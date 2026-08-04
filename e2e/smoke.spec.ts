import { test, expect } from "@playwright/test";

test.describe("BeforeToBuy smoke E2E", () => {
  test("homepage loads with beta banner and product grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Beta\s*\/?\s*Demo/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Shopping in/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("link", { name: "Visit the official PortanX company website" })
    ).toHaveAttribute("href", "https://portanx.com");
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
    const blocked = await request.get("/api/geocode?lat=46.948&lng=7.4474");
    expect(blocked.status()).toBe(403);

    const deniedConsent = await request.post("/api/consent", {
      data: { location: false, affiliate: false },
    });
    expect(deniedConsent.ok()).toBeTruthy();
    expect(deniedConsent.headers()["set-cookie"]).toContain("HttpOnly");
    expect(deniedConsent.headers()["set-cookie"].toLowerCase()).toContain("samesite=strict");
    expect((await request.get("/api/geocode?lat=46.948&lng=7.4474")).status()).toBe(403);

    const grantedConsent = await request.post("/api/consent", {
      data: { location: true, affiliate: false },
    });
    expect(grantedConsent.ok()).toBeTruthy();
    expect((await request.get("/api/geocode?lat=invalid&lng=7.4474")).status()).toBe(400);

    expect((await request.delete("/api/consent")).ok()).toBeTruthy();
    expect((await request.get("/api/geocode?lat=46.948&lng=7.4474")).status()).toBe(403);
  });

  test("health API distinguishes sample-only from production feeds", async ({ request }) => {
    const response = await request.get("/api/health");
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
  });

  test("stores page lists Brack as Sample Feed", async ({ page }) => {
    await page.goto("/stores");
    await expect(page.getByRole("heading", { name: "Brack.ch" })).toBeVisible();
    await expect(page.getByText("Sample Feed").first()).toBeVisible();
  });
});
