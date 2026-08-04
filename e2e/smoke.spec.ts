import { test, expect } from "@playwright/test";

test.describe("BeforeToBuy smoke E2E", () => {
  test("homepage loads with beta banner and product grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Beta\s*\/?\s*Demo/i).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Shopping in/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
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

  test("health API returns healthy status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.checks.productsMerge.productCount).toBeGreaterThan(0);
  });

  test("products API returns live feed metadata for CH", async ({ request }) => {
    const response = await request.get("/api/products?country=CH");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.products.length).toBeGreaterThan(0);
    expect(body.meta.liveOfferCount).toBeGreaterThan(0);
  });

  test("stores page lists Brack as Live Feed", async ({ page }) => {
    await page.goto("/stores");
    await expect(page.getByRole("heading", { name: "Brack.ch" })).toBeVisible();
    await expect(page.getByText("Live Feed").first()).toBeVisible();
  });
});
