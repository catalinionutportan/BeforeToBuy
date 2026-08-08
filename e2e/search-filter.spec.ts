import { test, expect } from "@playwright/test";

test.describe("Search and Filter E2E tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Ensure the page is loaded and the product grid is visible before each test
    await expect(page.locator("article").first()).toBeVisible({ timeout: 20_000 });
  });

  test("should perform a basic product search and display results", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products.../i);
    await searchInput.fill("phone");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/search=phone/);
    await expect(page.locator("article").first()).toBeVisible();
    const productTitles = await page.locator("article h3").allTextContents();
    expect(productTitles.some(title => title.toLowerCase().includes("phone"))).toBeTruthy();
  });

  test("should display no results for an unknown search query", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products.../i);
    await searchInput.fill("nonexistentproduct123");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/search=nonexistentproduct123/);
    await expect(page.locator("article")).toHaveCount(0);
    await expect(page.getByText(/No products found/i)).toBeVisible();
  });

  test("should filter products by category", async ({ page }) => {
    await page.getByRole("button", { name: /^Electronics$/i }).click();
    await expect(page).toHaveURL(/category=electronics/);
    await expect(page.locator("article").first()).toBeVisible();

    // Category chips filter client-side; presence of products is enough for smoke.
  });

  test("should filter products by merchant domain", async ({ page }) => {
    // First, dismiss cookie consent if visible to ensure elements are clickable
    const essentialButton = page.getByRole("button", { name: "Essential Only", exact: true });
    if (await essentialButton.isVisible({ timeout: 5_000 })) {
      await essentialButton.click();
      await expect(page.getByRole("dialog", { name: /Cookie & Privacy Preferences/i })).toHaveCount(0, {
        timeout: 5_000,
      });
    }

    const domainSelect = page.getByLabel(/Store Domain/i);
    await domainSelect.selectOption({ label: "brack.ch" });

    await expect(page).toHaveURL(/domain=brack.ch/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("should combine search and category filter", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products.../i);
    await searchInput.fill("laptop");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/search=laptop/);

    await page.getByRole("button", { name: /^Electronics$/i }).click();
    await expect(page).toHaveURL(/search=laptop&category=electronics/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("should navigate to product details page", async ({ page }) => {
    await page.locator("article").first().click();
    await expect(page).toHaveURL(/\/p\/[^\/]+/); // Expect URL like /p/{productId}
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Offers in/i)).toBeVisible();
  });

  test("should select an offer and redirect to purchase URL", async ({ page, context }) => {
    await page.locator("article").first().click();
    await expect(page.getByText(/Offers in/i)).toBeVisible();

    // Block affiliate tracking consent to test redirection behavior without actual navigation
    // This will prevent the actual site from opening, allowing us to check the onClick handler
    // (The handleAffiliateClick in ProductCardOffers prevents default if affiliate consent is not given)
    const initialPageUrl = page.url();
    const affiliateLink = page.locator("a", { hasText: /View Offer|Search Store/i }).first();

    // Assuming initial consent is not given, clicking should open consent preferences
    await affiliateLink.click();
    await expect(page.getByRole("dialog", { name: /Cookie & Privacy Preferences/i })).toBeVisible();

    // Grant affiliate consent
    await page.getByRole("button", { name: "Accept All", exact: true }).click();
    await expect(page.getByRole("dialog", { name: /Cookie & Privacy Preferences/i })).toHaveCount(0);

    // Re-click the affiliate link after granting consent
    // This time, it should open a new tab/window
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      affiliateLink.click()
    ]);

    expect(popup.url()).not.toBe(initialPageUrl);
    expect(popup.url()).toMatch(/http/);
    expect(popup.url()).toContain("/offer");
    await popup.close();
  });
});
