#!/usr/bin/env node
/**
 * Warm heavy merchant feeds (evoMAG) into Redis outside the user request path.
 *
 * Usage:
 *   CRON_SECRET=... npm run feeds:warm
 *   CRON_SECRET=... FEEDS_WARM_URL=https://www.beforetobuy.com/api/cron/feeds-warm npm run feeds:warm
 *   CRON_SECRET=... FEEDS_WARM_URL=http://localhost:3000/api/cron/feeds-warm npm run feeds:warm
 *
 * Env:
 *   CRON_SECRET or INTERNAL_API_SECRET — Bearer token (required)
 *   FEEDS_WARM_URL — full cron URL (default: https://www.beforetobuy.com/api/cron/feeds-warm)
 *   FEEDS_WARM_ALL=1 — warm all enabled feeds, not only heavy/cacheOnly
 */
const secret = process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET;
const base =
  process.env.FEEDS_WARM_URL ||
  `${(process.env.SMOKE_BASE_URL || "https://www.beforetobuy.com").replace(/\/$/, "")}/api/cron/feeds-warm`;
const url = process.env.FEEDS_WARM_ALL === "1" ? `${base}${base.includes("?") ? "&" : "?"}all=1` : base;

if (!secret) {
  console.error("[feeds:warm] Set CRON_SECRET or INTERNAL_API_SECRET");
  process.exit(1);
}

const controller = new AbortController();
const timeoutMs = Number(process.env.FEEDS_WARM_TIMEOUT_MS || 280_000);
const timer = setTimeout(() => controller.abort(), timeoutMs);

console.log(`[feeds:warm] POST/GET ${url} (timeout ${timeoutMs}ms)`);

try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
    },
    signal: controller.signal,
  });
  clearTimeout(timer);

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 500) };
  }

  console.log(JSON.stringify(body, null, 2));

  if (!response.ok || body?.ok === false) {
    process.exit(1);
  }
} catch (error) {
  clearTimeout(timer);
  console.error("[feeds:warm] failed:", error);
  process.exit(1);
}
