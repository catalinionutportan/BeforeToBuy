import { expect, type Page } from "@playwright/test";

/** Dismiss iubenda Cookie Solution or the local fallback banner. */
export async function dismissCookieBannerIfPresent(page: Page) {
  const iubendaReject = page.locator(
    "#iubenda-cs-banner .iubenda-cs-reject-btn, #iubenda-cs-banner button.iubenda-cs-reject-btn"
  ).first();
  if (await iubendaReject.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await iubendaReject.click();
    await expect(page.locator("#iubenda-cs-banner")).toBeHidden({ timeout: 8_000 }).catch(() => undefined);
    return;
  }

  const essentialButton = page
    .getByRole("button", { name: /Essential Only|Doar esențiale|Nur essenzielle/i })
    .first();
  if (await essentialButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await essentialButton.click();
    await expect(page.getByRole("dialog", { name: /Cookie & Privacy Preferences/i })).toHaveCount(0, {
      timeout: 5_000,
    });
  }
}
