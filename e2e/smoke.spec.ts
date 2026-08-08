import { test, expect, type Page } from "@playwright/test";

/** Ensure browse market is Romania (primary live feeds). */
async function selectRomaniaMarket(page: Page) {
  const countrySelect = page.getByLabel(/country|market|țară|tara|land|pays|paese/i).first();
  await expect(countrySelect).toBeVisible({ timeout: 15_000 });
  await countrySelect.selectOption("RO");
}

async function dismissCookieBannerIfPresent(page: Page) {
  const essentialButton = page.getByRole("button", { name: /Essential Only|Doar esențiale|Nur essenzielle/i }).first();
  if (await essentialButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await essentialButton.click();
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 5_000 });
  }
}

test.describe("BeforeToBuy smoke E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Force English UI + RO market so assertions stay stable and catalog is non-empty.
    await page.addInitScript(() => {
      window.localStorage.setItem("btb-ui-lang", "en");
      window.localStorage.setItem("btb-market-country", "RO");
      window.localStorage.removeItem("b2b_consent_v3");
      document.cookie = "btb-market-country=RO; Path=/; SameSite=Lax";
    });
  });

  test("homepage loads with beta banner and product grid", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/");
    await dismissCookieBannerIfPresent(page);
    await expect(page.getByText(/Beta\s*\/?\s*Demo/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "BeforeToBuy", exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /^Menu$/i })).toBeVisible();
    await selectRomaniaMarket(page);
    await expect(page.locator("article").first()).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("link", { name: "admin@portanx.com" })).toHaveAttribute(
      "href",
      "mailto:admin@portanx.com"
    );
    await expect(page.getByRole("link", { name: "+41 78 310 33 17" })).toHaveAttribute(
      "href",
      "tel:+41783103317"
    );
  });

  test("legal hub and help pages are reachable", async ({ page }) => {
    await page.goto("/legal");
    await expect(page.getByRole("heading", { name: /Legal & Company Information/i })).toBeVisible();

    await page.goto("/help");
    await expect(page.getByRole("heading", { name: /Help & FAQ/i })).toBeVisible();
  });

  test("cookie consent banner can be dismissed", async ({ page }) => {
    await page.goto("/");
    const essentialButton = page.getByRole("button", { name: "Essential Only", exact: true });
    await expect(essentialButton).toBeVisible({ timeout: 10_000 });
    await essentialButton.click();
    await expect(page.getByRole("dialog", { name: /Cookie & Privacy Preferences/i })).toHaveCount(0, {
      timeout: 5_000,
    });
  });

  test("location APIs require signed server-side consent", async ({ request }) => {
    const origin = "http://127.0.0.1:3000";
    const blocked = await request.get("/api/geocode?lat=46.948&lng=7.4474");
    expect(blocked.status()).toBe(403);

    const deniedConsent = await request.post("/api/consent", {
      headers: { Origin: origin },
      data: { location: false, affiliate: false },
    });
    expect(deniedConsent.ok()).toBeTruthy();
    expect(deniedConsent.headers()["set-cookie"]).toContain("HttpOnly");
    expect(deniedConsent.headers()["set-cookie"].toLowerCase()).toContain("samesite=strict");
    expect((await request.get("/api/geocode?lat=46.948&lng=7.4474")).status()).toBe(403);

    const grantedConsent = await request.post("/api/consent", {
      headers: { Origin: origin },
      data: { location: true, affiliate: false },
    });
    expect(grantedConsent.ok()).toBeTruthy();
    expect((await request.get("/api/geocode?lat=invalid&lng=7.4474")).status()).toBe(400);

    expect((await request.delete("/api/consent", { headers: { Origin: origin } })).ok()).toBeTruthy();
    expect((await request.get("/api/geocode?lat=46.948&lng=7.4474")).status()).toBe(403);
  });

  test("health API distinguishes sample-only from production feeds", async ({ request }) => {
    const response = await request.get("/api/health", {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || "playwright-internal-api-secret-32chars!"}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.checks.productsMerge.productCount).toBeGreaterThan(0);
    if (body.checks.integrations.hasProductionFeed) {
      expect(body.status).toBe("healthy");
    } else {
      expect(body.status).toBe("degraded");
    }
  });

  test("products API has empty CH catalog until merchant approval", async ({ request }) => {
    const response = await request.get("/api/products?country=CH");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.products.length).toBe(0);
    expect(body.meta.productionOfferCount).toBe(0);
    expect(body.meta.sampleOfferCount).toBe(0);
    expect(body.meta.feedProductCount).toBe(0);
    expect(body.meta.mappingSummary?.total ?? 0).toBe(0);
  });

  test("products API still serves live RO affiliate feeds", async ({ request }) => {
    const response = await request.get("/api/products?country=RO");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.products.length).toBeGreaterThan(0);
    // CI Playwright uses FORCE_SAMPLE_FEEDS=1 → sampleOfferCount; production uses live feeds.
    expect(
      (body.meta.productionOfferCount ?? 0) + (body.meta.sampleOfferCount ?? 0)
    ).toBeGreaterThan(0);
    expect(body.meta.feedMerchants["ro-rowenta"]).toBeGreaterThan(0);
    expect(body.meta.feedMerchants["ro-scule365"]).toBeGreaterThan(0);
  });

  test("legacy category query redirects to SEO category route", async ({ page }) => {
    await page.goto("/?category=audio");
    await expect(page).toHaveURL(/\/categories\/electronics(\?|$)/);
    // Market-aware SSR locale: EN / DE / RO depending on cookie + geo.
    await expect(
      page.getByRole("heading", { name: /^(Electronics|Elektronik|Electronice)$/ })
    ).toBeVisible();
  });

  test("department SEO route renders breadcrumbs for live primary market", async ({ page }) => {
    await page.goto("/categories/electronics");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^(Electronics|Elektronik|Electronice)$/ })
    ).toBeVisible();
    // Primary live market is RO — electronics department may show product cards.
    // Presence of the department heading + breadcrumb is the SEO smoke signal.
  });

  test("category menu drill-down is shareable with live RO catalog", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/");
    await dismissCookieBannerIfPresent(page);
    await selectRomaniaMarket(page);
    await expect(page.locator("article").first()).toBeVisible({ timeout: 60_000 });

    await page.getByRole("button", { name: /^Menu$/i }).click();
    const rootMenu = page.getByRole("dialog", { name: /^Menu$/i });
    await expect(rootMenu).toBeVisible();
    const electronicsBtn = rootMenu
      .getByRole("navigation", { name: /Categories/i })
      .getByRole("button", { name: /^Electronics\b/ });
    // Desktop: hover expands preview columns; click a leaf to activate.
    // Sample RO feeds may not include headphones — assert shareable URL, not grid density.
    await electronicsBtn.hover();
    await rootMenu.getByRole("button", { name: /^Headphones\b/ }).click();
    await expect(page).toHaveURL(/category=audio-headphones/);

    await page.goto("/categories");
    // Primary live market (RO) uses Romanian SSR copy when cookie/geo resolve to RO.
    await expect(
      page.getByRole("heading", {
        name: /Compare Product Prices|Produktpreise vergleichen|Compară Prețurile Produselor/i,
      })
    ).toBeVisible();
  });

  test("integrations status reports all configured merchant feed modes", async ({ request }) => {
    const response = await request.get("/api/integrations/status", {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || "playwright-internal-api-secret-32chars!"}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    // CH feeds disabled; live enabled feeds: RO (3) + GB Seentat (1).
    expect(body.merchants.length).toBe(4);
    expect(body.feedMerchantIds).not.toContain("ch-brack");
    expect(body.feedMerchantIds).not.toContain("ch-digitec");
    expect(body.feedMerchantIds).toContain("ro-rowenta");
    expect(body.feedMerchantIds).toContain("ro-scule365");
    expect(body.feedMerchantIds).toContain("ro-evomag");
    expect(body.feedMerchantIds).toContain("gb-seentat");
  });

  test("products API has no CH merchant feeds until approval", async ({ request }) => {
    const response = await request.get("/api/products?country=CH");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.meta.feedMerchants).toEqual({});
    expect(body.meta.feedProductCount).toBe(0);
    expect(body.products?.length ?? 0).toBe(0);
    expect(body.meta.priceHistory?.enabled).toBe(true);
  });

  test("mapping report API is empty for CH while merchants are pending", async ({ request }) => {
    const response = await request.get("/api/mapping/report?country=CH", {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || "playwright-internal-api-secret-32chars!"}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.summary.total).toBe(0);
    expect(body.summary.byMerchant["ch-brack"]).toBeFalsy();
    expect(Array.isArray(body.reviewQueue)).toBeTruthy();
  });

  test("stores page does not list CH sample merchants", async ({ page }) => {
    await page.goto("/stores");
    await expect(page.getByRole("heading", { name: "Brack.ch" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Digitec" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Interdiscount" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Fust" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Microspot.ch" })).toHaveCount(0);
    // RO live affiliates remain listed.
    await expect(page.getByRole("heading", { name: "Rowenta.ro" })).toBeVisible();
  });
});
