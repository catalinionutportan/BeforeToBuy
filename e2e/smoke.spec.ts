import { test, expect } from "@playwright/test";

test.describe("BeforeToBuy smoke E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Force English UI so copy assertions stay stable across CI locales.
    await page.addInitScript(() => {
      window.localStorage.setItem("btb-ui-lang", "en");
      window.localStorage.removeItem("b2b_consent_v3");
    });
  });

  test("homepage loads with beta banner and product grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Beta\s*\/?\s*Demo/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "BeforeToBuy", exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /^Menu$/i })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('a[href="https://portanx.com"]').first()).toBeVisible();
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

  test("products API labels the default CH feed as sample data", async ({ request }) => {
    const response = await request.get("/api/products?country=CH");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.meta.productionOfferCount).toBe(0);
    expect(body.meta.sampleOfferCount).toBeGreaterThan(0);
    type ApiOffer = { source: string; originalPrice?: number };
    const sampleOffers = body.products
      .flatMap((product: { offers: ApiOffer[] }) => product.offers)
      .filter((offer: ApiOffer) => offer.source === "sample");
    expect(sampleOffers.length).toBeGreaterThan(0);
    expect(sampleOffers.every((offer: { originalPrice?: number }) => offer.originalPrice === undefined)).toBeTruthy();
    expect(body.products.every((product: { rating?: number }) => product.rating === undefined)).toBeTruthy();
    const audioSignal =
      (body.meta.categoryCounts.audio ?? 0) + (body.meta.categoryCounts["audio-headphones"] ?? 0);
    expect(audioSignal).toBeGreaterThan(0);
    expect(body.meta.collectionCounts["compare-local-pickup"] ?? 0).toBeGreaterThanOrEqual(0);
    expect(body.meta.mappingSummary?.total).toBeGreaterThan(0);
    expect(body.meta.unmappedProductCount).toBeGreaterThanOrEqual(0);
    expect(body.products.every((product: { category: string }) => product.category !== "unmapped")).toBeTruthy();
  });

  test("legacy category query redirects to SEO category route", async ({ page }) => {
    await page.goto("/?category=audio");
    await expect(page).toHaveURL(/\/categories\/electronics$/);
    // SEO pages use market default locale (CH → DE): Elektronik
    await expect(page.getByRole("heading", { name: /^(Electronics|Elektronik)$/ })).toBeVisible();
  });

  test("department SEO route renders products and breadcrumbs", async ({ page }) => {
    await page.goto("/categories/electronics");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^(Electronics|Elektronik)$/ })).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
  });

  test("category menu drill-down is shareable and empty departments stay hidden", async ({ page }) => {
    await page.goto("/");
    const essentialButton = page.getByRole("button", { name: "Essential Only", exact: true });
    if (await essentialButton.isVisible().catch(() => false)) {
      await essentialButton.click();
    }
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });

    await page.getByRole("button", { name: /^Menu$/i }).click();
    await expect(page.getByRole("dialog", { name: /^Menu$/i })).toBeVisible();
    await page.getByRole("button", { name: /^Electronics\b/ }).click();
    await page.getByRole("button", { name: /^Headphones\b/ }).click();
    await expect(page).toHaveURL(/categories\/electronics\/audio-headphones|category=audio-headphones/);
    await expect(page.getByText(/Anzeige|Browsing|Navigation/i).first()).toBeVisible();

    await page.goto("/categories");
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Compare Product Prices" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Large Appliances", exact: true })).toHaveCount(0);
  });

  test("integrations status reports all configured merchant feed modes", async ({ request }) => {
    const response = await request.get("/api/integrations/status", {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || "playwright-internal-api-secret-32chars!"}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.merchants.length).toBe(8);
    // CH sample feeds stay sample; RO defaultRemoteUrl resolves to production outside vitest.
    expect(body.sampleFeeds.length).toBeGreaterThanOrEqual(6);
    expect(body.feedMerchantIds).toContain("ch-brack");
    expect(body.feedMerchantIds).toContain("ch-digitec");
    expect(body.feedMerchantIds).toContain("ch-galaxus");
    expect(body.feedMerchantIds).toContain("ro-rowenta");
    expect(body.feedMerchantIds).toContain("ro-scule365");
  });

  test("products API exposes per-merchant feed counts", async ({ request }) => {
    const response = await request.get("/api/products?country=CH");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.meta.feedMerchants["ch-brack"]).toBe(6);
    expect(body.meta.feedMerchants["ch-digitec"]).toBe(2);
    // feedProductCount is GTIN-merged across merchants (16 raw rows -> fewer canonical products)
    expect(body.meta.feedProductCount).toBeGreaterThanOrEqual(12);
    expect(body.meta.priceHistory?.enabled).toBe(true);
  });

  test("mapping report API exposes review queue for feed products", async ({ request }) => {
    const response = await request.get("/api/mapping/report?country=CH", {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || process.env.CRON_SECRET || "playwright-internal-api-secret-32chars!"}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.summary.total).toBeGreaterThan(0);
    expect(body.summary.byMerchant["ch-brack"]).toBeTruthy();
    expect(Array.isArray(body.reviewQueue)).toBeTruthy();
  });

  test("stores page lists Brack as Sample Feed", async ({ page }) => {
    await page.goto("/stores");
    await expect(page.getByRole("heading", { name: "Brack.ch" })).toBeVisible();
    await expect(page.getByText("Sample Feed").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Interdiscount" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fust" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Microspot.ch" })).toHaveCount(0);
  });
});
