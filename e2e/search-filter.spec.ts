import { expect, test, type Page } from "@playwright/test";

const OFFER_LINK_NAME = /View offer|Search store|Open store/i;

async function dismissCookieBanner(page: Page) {
  const essential = page.getByRole("button", { name: "Essential Only", exact: true });
  if (await essential.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await essential.click();
    await expect(page.getByRole("dialog", { name: /Cookie & Privacy Preferences/i })).toHaveCount(0);
  }
}

test.describe("Search, filters and product handoff", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: "btb-ui-lang", value: "en", domain: "127.0.0.1", path: "/" },
      { name: "btb-market-country", value: "RO", domain: "127.0.0.1", path: "/" },
    ]);
    await page.addInitScript(() => {
      localStorage.setItem("btb-ui-lang", "en");
      localStorage.setItem("btb-market-country", "RO");
      localStorage.removeItem("b2b_consent_v4");
    });
    await page.goto("/?lang=en");
    await dismissCookieBanner(page);
    await expect(page.locator("article").first()).toBeVisible({ timeout: 60_000 });
  });

  test("searches with the current q parameter", async ({ page }) => {
    const search = page.getByRole("combobox", { name: /Search products/i });
    await search.fill("rowenta");
    await search.press("Enter");

    await expect(page).toHaveURL(/(?:\?|&)q=rowenta(?:&|$)/);
    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("article").first()).toContainText(/rowenta/i);
  });

  test("shows an honest empty state for an unknown query", async ({ page }) => {
    const search = page.getByRole("combobox", { name: /Search products/i });
    await search.fill("nonexistentproduct123");
    await search.press("Enter");

    await expect(page).toHaveURL(/q=nonexistentproduct123/);
    await expect(page.locator("article")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();
  });

  test("filters by merchant domain and opens category menu", async ({ page }) => {
    await page.getByLabel("Store domain").selectOption("rowenta.ro");

    await expect(page).toHaveURL(/domain=rowenta.ro/);
    await expect(page.locator("article").first()).toContainText(/rowenta/i);

    // Hub tabs were removed — categories live under the bag menu (iOS affordance).
    await page.getByRole("button", { name: /^Menu$/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("opens accessible product details", async ({ page }) => {
    await page.locator("article").first().locator("a").first().click();

    await expect(page).toHaveURL(/\/p\/[^/?]+/);
    const productDialog = page.getByRole("dialog", { name: /Store offer/i });
    await expect(productDialog).toBeVisible();
    await expect(productDialog.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(productDialog.getByRole("heading", { level: 2, name: /Store offer/i })).toBeVisible();
  });

  test("requires affiliate consent and then opens the real merchant URL", async ({ page, context }) => {
    await page.locator("article").first().locator("a").first().click();
    await expect(page).toHaveURL(/\/p\/[^/?]+/);
    const productDialog = page.getByRole("dialog", { name: /Store offer/i });
    await expect(productDialog).toBeVisible();
    const blockedLink = productDialog.getByRole("link", { name: OFFER_LINK_NAME }).first();
    await blockedLink.click();

    const acceptAll = page.getByRole("button", { name: "Accept All", exact: true });
    await expect(acceptAll).toBeVisible();
    await acceptAll.click();
    await expect(acceptAll).toHaveCount(0);

    const merchantLink = page.getByRole("link", { name: OFFER_LINK_NAME }).first();
    const [popup] = await Promise.all([
      context.waitForEvent("page"),
      merchantLink.click(),
    ]);
    await popup.waitForLoadState("domcontentloaded").catch(() => {});
    expect(new URL(popup.url()).hostname).not.toBe("127.0.0.1");
    await popup.close();
  });

  test("loads CH catalogue when switching market from RO", async ({ page }) => {
    await page.getByLabel("Country / market").selectOption("CH");

    await expect(page.locator("article").first()).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/\d[\d,.]*\s+(items found|results)/i).first()).toBeVisible();
    // Permanent bag + menu stay available on every market.
    await expect(page.getByRole("button", { name: /^Menu$/i })).toBeVisible();
  });
});
