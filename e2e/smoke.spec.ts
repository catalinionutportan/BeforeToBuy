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
    const publicResponse = await request.get("/api/health");
    expect(publicResponse.ok()).toBeTruthy();
    const publicBody = await publicResponse.json();
    expect(publicBody.detailLevel).toBe("public");
    expect(publicBody.commit).toBeUndefined();
    expect(publicBody.environment).toBeUndefined();
    expect(publicBody.checks.supabaseCatalogue).toBeUndefined();
    expect(publicBody.checks.priceHistory).toBeUndefined();

    const response = await request.get("/api/health", {
      headers: { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || "playwright-internal-api-secret-32chars!"}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.sitePhase).toBe("production");
    expect(body.legalDocumentVersion).toBe("1.0");
    expect(body.detailLevel).toBe("internal");
    expect(body.checks.productsMerge.productCount).toBeGreaterThan(0);
    if (body.checks.integrations.hasProductionFeed) {
      expect(body.status).toBe("healthy");
    } else {
      expect(body.status).toBe("degraded");
    }
  });

  test("HTML responses include nonce-based CSP without wildcard https img-src", async ({ page }) => {
    const response = await page.goto("/?lang=en");
    expect(response?.ok()).toBeTruthy();
    const csp = response?.headers()["content-security-policy"] || "";
    expect(csp).toContain("script-src");
    expect(csp).toMatch(/nonce-[A-Za-z0-9+/=]+/);
    expect(csp).toContain("strict-dynamic");
    expect(csp).not.toMatch(/img-src[^;]*\shttps:(;|$)/);
    expect(csp).toContain("https://www.rowenta.ro");
  });

  test("primary pages emit no Content-Security-Policy console violations", async ({ page }) => {
    const cspViolations: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (
        message.type() === "error" &&
        (/content security policy/i.test(text) ||
          /refused to apply inline style/i.test(text) ||
          /refused to load/i.test(text))
      ) {
        cspViolations.push(text);
      }
    });

    await page.goto("/");
    await dismissCookieBannerIfPresent(page);
    await selectRomaniaMarket(page);
    await expect(page.locator("article").first()).toBeVisible({ timeout: 60_000 });

    await page.goto("/legal");
    await expect(page.getByRole("heading", { name: /Legal & Company Information/i })).toBeVisible();

    expect(cspViolations, cspViolations.join("\n")).toEqual([]);
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

  test("integrations status reports configured merchant feeds from registry", async ({ request }) => {
    const response = await request.get("/api/integrations/status", {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || "playwright-internal-api-secret-32chars!"}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    // Pending CH sample merchants stay out; baby-walz is the live CH feed.
    expect(body.feedMerchantIds).not.toContain("ch-brack");
    expect(body.feedMerchantIds).not.toContain("ch-digitec");
    expect(body.feedMerchantIds).toContain("ch-babywalz");
    expect(body.feedMerchantIds).toContain("ch-reifencom");
    expect(body.feedMerchantIds).toContain("gb-seentat");
    expect(body.feedMerchantIds).toContain("us-ottocast");
    expect(body.feedMerchantIds).toContain("gb-geepas");
    // FORCE_SAMPLE_FEEDS may enable RO samples — assert config presence, not a fragile count.
    if (body.feedMerchantIds.includes("ro-rowenta")) {
      expect(body.feedMerchantIds).toContain("ro-scule365");
    }
    expect(Array.isArray(body.merchants)).toBe(true);
    expect(body.merchants.length).toBe(body.feedMerchantIds.length);
    for (const merchantId of body.feedMerchantIds as string[]) {
      expect(body.merchants.some((m: { merchantId: string }) => m.merchantId === merchantId)).toBe(
        true
      );
    }
  });

  test("products API exposes CH baby-walz sample/live catalogue", async ({ request }) => {
    const response = await request.get("/api/products?country=CH");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.meta.feedMerchants?.["ch-babywalz"] ?? 0).toBeGreaterThan(0);
    expect(body.meta.feedProductCount).toBeGreaterThan(0);
    expect(body.products?.length ?? 0).toBeGreaterThan(0);
    expect(body.meta.priceHistory?.enabled).toBe(true);
  });

  test("mapping report API includes baby-walz for CH", async ({ request }) => {
    const response = await request.get("/api/mapping/report?country=CH", {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || "playwright-internal-api-secret-32chars!"}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.summary.total).toBeGreaterThan(0);
    expect(body.summary.byMerchant["ch-babywalz"]).toBeTruthy();
    expect(body.summary.byMerchant["ch-brack"]).toBeFalsy();
    expect(Array.isArray(body.reviewQueue)).toBeTruthy();
  });

  test("stores page lists live CH merchants but not pending CH sample merchants", async ({ page }) => {
    await page.goto("/stores");
    await expect(page.getByRole("heading", { name: "Brack.ch" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Digitec" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Interdiscount" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Fust" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Microspot.ch" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /baby-walz/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reifen\.com/i })).toBeVisible();
    // RO live affiliates remain listed.
    await expect(page.getByRole("heading", { name: "Rowenta.ro" })).toBeVisible();
  });
});


