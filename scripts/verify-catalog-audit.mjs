/** Controlled release smoke: no affiliate clicks, no mutations, no load test. */
import { chromium, expect } from "@playwright/test";

const base = process.env.AUDIT_BASE_URL;
if (!base) throw new Error("Set AUDIT_BASE_URL to the candidate release");
const browser = await chromium.launch();
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  for (const market of ["CH", "DE", "GB", "US"]) {
    const started = Date.now();
    await page.goto(`${base}/?country=${market}&lang=en`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const essential = page.getByRole("button", { name: /only essential|essential only|reject/i });
    if (await essential.first().waitFor({ state: "visible", timeout: 2000 }).then(() => true).catch(() => false)) await essential.first().click();
    const cards = page.locator("[data-product-id]");
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    const ids = await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.productId));
    expect(new Set(ids).size).toBe(ids.length);
    const railCount = await page.locator("[data-shortcut-category]").count();
    const target = cards.nth(7);
    await target.scrollIntoViewIfNeeded();
    const y = await target.evaluate((node) => node.getBoundingClientRect().top);
    await target.locator("a").first().click();
    const dialog = page.getByRole("dialog", { name: /store offer/i });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /close/i }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/p\//);
    await expect(cards.first()).toBeVisible();
    expect(await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.productId))).toEqual(ids);
    expect(Math.abs(await target.evaluate((node) => node.getBoundingClientRect().top) - y)).toBeLessThanOrEqual(3);
    // Use the translated label supplied by the actual navigation, not an icon.
    const lastNav = page.getByRole("navigation", { name: "Product pages", exact: true }).last();
    await expect(lastNav).toBeVisible();
    const nextButton = lastNav.locator("button").last();
    if (await nextButton.count()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
      await expect(cards.first()).toBeVisible();
      const secondIds = await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.productId));
      expect(secondIds.some((id) => ids.includes(id))).toBe(false);
    }
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    if (market === "US") await page.screenshot({ path: "/tmp/btb-audit-us-desktop.png", fullPage: false });
    results.push({ market, cards: ids.length, railCategories: railCount, modalOrderAndPosition: "pass", responsiveWidths: [375, 768, 1440], flowMs: Date.now() - started });
  }
  const index = await context.request.get(`${base}/sitemap.xml`);
  expect(index.status()).toBe(200);
  const xml = await index.text();
  const shards = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  expect(shards.length).toBeGreaterThan(1);
  let urls = 0;
  for (const shard of shards) {
    const response = await context.request.get(`${base}${shard}`);
    expect(response.status()).toBe(200);
    urls += ((await response.text()).match(/<url>/g) || []).length;
  }
  console.log(JSON.stringify({ markets: results, sitemap: { shards: shards.length, urls } }, null, 2));
} finally { await browser.close(); }
