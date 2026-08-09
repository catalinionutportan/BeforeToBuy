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

test("first visit uses the hosting country code without a saved market", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-vercel-ip-country": "CH" });
  await page.addInitScript(() => {
    window.localStorage.removeItem("btb-market-country");
    window.localStorage.removeItem("btb-ui-lang");
  });

  await page.goto("/");

  const countrySelect = page.getByLabel(/country|market|țară|tara|land|pays|paese/i).first();
  await expect(countrySelect).toHaveValue("CH");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("language query controls server HTML, metadata and preference cookie", async ({ page }) => {
  const response = await page.goto("/legal?lang=ro");
  await expect(page.locator("html")).toHaveAttribute("lang", "ro");
  await expect(page).toHaveTitle(/Informații juridice|Legal/i);
  await expect(page.getByRole("heading", { name: /Informații legale și despre companie/i })).toBeVisible();
  expect((await response?.headerValue("set-cookie")) || "").toContain("btb-ui-lang=ro");
});

test("security headers block sensitive browser capabilities", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["x-powered-by"]).toBeUndefined();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["permissions-policy"]).toContain("geolocation=()");
});

test.describe("BeforeToBuy smoke E2E", () => {
  test.beforeEach(async ({ page, context }) => {
    // Force English UI + RO market so assertions stay stable and catalog is non-empty.
    await context.addCookies([
      { name: "btb-ui-lang", value: "en", domain: "127.0.0.1", path: "/" },
      { name: "btb-market-country", value: "RO", domain: "127.0.0.1", path: "/" },
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem("btb-ui-lang", "en");
      window.localStorage.setItem("btb-market-country", "RO");
      window.localStorage.removeItem("b2b_consent_v4");
      document.cookie = "btb-market-country=RO; Path=/; SameSite=Lax";
    });
  });

  test("homepage loads with brand and product grid", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/");
    await dismissCookieBannerIfPresent(page);
    await expect(page).not.toHaveTitle(/beta/i);
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

  test("consent preferences are stored and can be cleared", async ({ request }) => {
    const origin = "http://127.0.0.1:3000";
    const savedConsent = await request.post("/api/consent", {
      headers: { Origin: origin },
      data: { affiliate: false, analytics: false },
    });
    expect(savedConsent.ok()).toBeTruthy();
    expect(savedConsent.headers()["set-cookie"]).toContain("HttpOnly");
    expect(savedConsent.headers()["set-cookie"].toLowerCase()).toContain("samesite=strict");

    expect((await request.delete("/api/consent", { headers: { Origin: origin } })).ok()).toBeTruthy();
  });

  test("health API distinguishes sample-only from production feeds", async ({ request }) => {
    const response = await request.get("/api/health", {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || "playwright-internal-api-secret-32chars!"}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.sitePhase).toBe("production");
    expect(body.legalDocumentVersion).toBe("1.0");
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

  test("products API serves RO catalogue without remote CSV cost path", async ({ request }) => {
    const response = await request.get("/api/products?country=RO");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.products)).toBe(true);
    // CI uses FORCE_SAMPLE_FEEDS samples; production uses Supabase after import.
    // Either way the API must stay healthy (no 500 from huge CSV downloads).
    if ((body.meta.sampleOfferCount ?? 0) > 0) {
      expect(
        (body.meta.feedMerchants?.["ro-rowenta"] ?? 0) +
          (body.meta.feedMerchants?.["ro-scule365"] ?? 0)
      ).toBeGreaterThan(0);
    }
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
    // Language preference is independent from the RO shopping market.
    await expect(
      page.getByRole("heading", {
        name: /Browse offers|Angebote durchsuchen|Parcourir les offres|Sfoglia le offerte|Răsfoiește ofertele/i,
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
    // CH is disabled. Local smoke mode may expose the two checked-in RO sample feeds.
    expect(body.feedMerchantIds).not.toContain("ch-brack");
    expect(body.feedMerchantIds).not.toContain("ch-digitec");
    expect(body.feedMerchantIds).toContain("gb-seentat");
    if (body.feedMerchantIds.includes("ro-rowenta")) {
      expect(body.feedMerchantIds).toContain("ro-rowenta");
      expect(body.feedMerchantIds).toContain("ro-scule365");
      expect(body.merchants.length).toBe(3);
    } else {
      expect(body.merchants.length).toBe(1);
      expect(body.feedMerchantIds).not.toContain("ro-rowenta");
    }
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
