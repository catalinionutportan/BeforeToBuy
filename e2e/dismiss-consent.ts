import { expect, type Page } from "@playwright/test";

/** Wait for the self-hosted banner to hydrate, then dismiss it if present. */
export async function dismissCookieBannerIfPresent(page: Page) {
  const essentialButton = page
    .getByRole("button", { name: /Essential Only|Doar esențiale|Nur essenzielle/i })
    .first();
  if (await essentialButton.waitFor({ state: "visible", timeout: 5_000 }).then(() => true).catch(() => false)) {
    await essentialButton.click();
    await expect(essentialButton).toBeHidden({ timeout: 5_000 });
  }
}
