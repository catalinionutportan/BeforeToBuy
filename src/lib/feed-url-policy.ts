/**
 * Central policy for feed image URLs, commercial/affiliate links, and remote feed downloads.
 * Domains are taken from observed legitimate AWIN / 2Performant / merchant fixtures and config —
 * unknown hosts are rejected at import (not trusted at render time).
 */

/** Placeholder used when an image URL is missing or rejected. */
export const SAFE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600";

/** Standard HTTPS ports only — anything else is treated as unusual. */
const ALLOWED_PORTS = new Set(["", "443"]);

/**
 * Image CDNs / merchant hosts observed in live or sample feeds for:
 * Rowenta, Scule365, Seentat, Ottocast, evoMAG (+ Unsplash placeholder).
 */
export const APPROVED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "c.cdnmp.net",
  "cdnmpro.com",
  "www.rowenta.ro",
  "rowenta.ro",
  "www.seentat.com",
  "seentat.com",
  "www.ottocast.com",
  "ottocast.com",
  "geepas.co.uk",
  "www.geepas.co.uk",
  "cdn.shopify.com",
  "images2.productserve.com",
  "static2.evomag.ro",
  "www.evomag.ro",
  "evomag.ro",
  "www.scule365.ro",
  "scule365.ro",
  // Observed in checked-in CH sample fixtures (feeds currently disabled pending approval)
  "www.digitec.ch",
  "digitec.ch",
  "www.galaxus.ch",
  "galaxus.ch",
  "www.brack.ch",
  "brack.ch",
  "www.mediamarkt.ch",
  "mediamarkt.ch",
  "www.interdiscount.ch",
  "interdiscount.ch",
  "www.fust.ch",
  "fust.ch",
  "www.baby-walz.ch",
  "baby-walz.ch",
  "www.reifen.com",
  "reifen.com",
] as const;

/** Affiliate network click hosts. */
export const AFFILIATE_NETWORK_HOSTS = [
  "event.2performant.com",
  "www.awin1.com",
  "awin1.com",
] as const;

/** Merchant storefront hosts tied to configured feeds. */
export const MERCHANT_STORE_HOSTS = [
  "www.rowenta.ro",
  "rowenta.ro",
  "www.scule365.ro",
  "scule365.ro",
  "www.evomag.ro",
  "evomag.ro",
  "www.seentat.com",
  "seentat.com",
  "www.ottocast.com",
  "ottocast.com",
  "geepas.co.uk",
  "www.geepas.co.uk",
  "www.digitec.ch",
  "digitec.ch",
  "www.galaxus.ch",
  "galaxus.ch",
  "www.brack.ch",
  "brack.ch",
  "www.mediamarkt.ch",
  "mediamarkt.ch",
  "www.interdiscount.ch",
  "interdiscount.ch",
  "www.fust.ch",
  "fust.ch",
  "www.baby-walz.ch",
  "baby-walz.ch",
  "www.reifen.com",
  "reifen.com",
] as const;

/** Remote feed download hosts (CSV/XML endpoints). */
export const FEED_DOWNLOAD_HOSTS = [
  "2performant.com",
  "productdata.awin.com",
  "www.scule365.ro",
  "scule365.ro",
] as const;

/** Per-feed commercial link allowlist (affiliate network + that merchant). */
export const COMMERCIAL_HOSTS_BY_FEED: Record<string, readonly string[]> = {
  "ro-rowenta": ["event.2performant.com", "www.rowenta.ro", "rowenta.ro"],
  "ro-scule365": [
    "event.2performant.com",
    "www.scule365.ro",
    "scule365.ro",
    "c.cdnmp.net",
    "cdnmpro.com",
  ],
  "ro-evomag": ["event.2performant.com", "www.evomag.ro", "evomag.ro"],
  "gb-seentat": [
    "www.awin1.com",
    "awin1.com",
    "www.seentat.com",
    "seentat.com",
  ],
  "us-ottocast": [
    "www.awin1.com",
    "awin1.com",
    "www.ottocast.com",
    "ottocast.com",
  ],
  "gb-geepas": [
    "www.awin1.com",
    "awin1.com",
    "geepas.co.uk",
    "www.geepas.co.uk",
    "cdn.shopify.com",
  ],
  "ch-digitec": ["www.digitec.ch", "digitec.ch"],
  "ch-galaxus": ["www.galaxus.ch", "galaxus.ch"],
  "ch-brack": ["www.awin1.com", "awin1.com", "www.brack.ch", "brack.ch"],
  "ch-mediamarkt": [
    "www.awin1.com",
    "awin1.com",
    "www.mediamarkt.ch",
    "mediamarkt.ch",
  ],
  "ch-interdiscount": [
    "www.awin1.com",
    "awin1.com",
    "www.interdiscount.ch",
    "interdiscount.ch",
  ],
  "ch-fust": ["www.awin1.com", "awin1.com", "www.fust.ch", "fust.ch"],
  "ch-babywalz": [
    "www.awin1.com",
    "awin1.com",
    "www.baby-walz.ch",
    "baby-walz.ch",
  ],
  "ch-reifencom": [
    "www.awin1.com",
    "awin1.com",
    "www.reifen.com",
    "reifen.com",
  ],
};

export type FeedUrlKind = "image" | "commercial" | "feed-download";

export type FeedUrlValidation =
  | { ok: true; url: URL; normalized: string }
  | { ok: false; reason: string; safeLog: string };

function hostMatchesAllowlist(hostname: string, allowlist: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  return allowlist.some((allowed) => host === allowed.toLowerCase());
}

/** Redact to hostname only — never log path, query, hash, or credentials (AWIN keys live in paths). */
export function safeUrlForLog(raw: string): string {
  try {
    const url = new URL(raw.trim());
    return url.hostname.toLowerCase();
  } catch {
    return "[unparseable-url]";
  }
}

function isDisallowedScheme(protocol: string): boolean {
  return protocol !== "https:";
}

/**
 * Structural HTTPS checks shared by all feed URL kinds:
 * HTTPS only, no credentials, no unusual ports, no alternative schemes.
 */
export function parseStrictHttpsUrl(raw: string | null | undefined): FeedUrlValidation {
  if (!raw?.trim()) {
    return { ok: false, reason: "empty", safeLog: "[empty]" };
  }

  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("blob:")
  ) {
    return { ok: false, reason: "disallowed-scheme", safeLog: safeUrlForLog(trimmed) };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: "invalid-url", safeLog: safeUrlForLog(trimmed) };
  }

  if (isDisallowedScheme(url.protocol)) {
    return { ok: false, reason: "non-https", safeLog: safeUrlForLog(trimmed) };
  }
  if (url.username || url.password) {
    return { ok: false, reason: "credentials", safeLog: safeUrlForLog(trimmed) };
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    return { ok: false, reason: "unusual-port", safeLog: safeUrlForLog(trimmed) };
  }
  if (!url.hostname || url.hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname)) {
    return { ok: false, reason: "invalid-host", safeLog: safeUrlForLog(trimmed) };
  }

  return { ok: true, url, normalized: url.toString() };
}

function allowlistForKind(kind: FeedUrlKind, feedMerchantId?: string): readonly string[] {
  if (kind === "image") return APPROVED_IMAGE_HOSTS;
  if (kind === "feed-download") {
    const extra = (process.env.FEED_ALLOWED_HOSTS || "")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);
    return [...FEED_DOWNLOAD_HOSTS, ...extra];
  }
  if (feedMerchantId && COMMERCIAL_HOSTS_BY_FEED[feedMerchantId]) {
    return COMMERCIAL_HOSTS_BY_FEED[feedMerchantId]!;
  }
  return [...AFFILIATE_NETWORK_HOSTS, ...MERCHANT_STORE_HOSTS];
}

export function validateFeedUrl(
  raw: string | null | undefined,
  kind: FeedUrlKind,
  options?: { feedMerchantId?: string }
): FeedUrlValidation {
  const parsed = parseStrictHttpsUrl(raw);
  if (!parsed.ok) return parsed;

  const allowlist = allowlistForKind(kind, options?.feedMerchantId);
  if (!hostMatchesAllowlist(parsed.url.hostname, allowlist)) {
    return {
      ok: false,
      reason: "host-not-allowlisted",
      safeLog: safeUrlForLog(parsed.normalized),
    };
  }

  return parsed;
}

export function logRejectedFeedUrl(
  kind: FeedUrlKind,
  raw: string | null | undefined,
  reason: string,
  feedMerchantId?: string
): void {
  const merchant = feedMerchantId ? ` merchant=${feedMerchantId}` : "";
  console.warn(
    `[feed-url-policy] rejected ${kind}${merchant} reason=${reason} url=${safeUrlForLog(raw || "")}`
  );
}

/** Validate image URL; unknown/unsafe → fallback + log. */
export function sanitizeFeedImageUrl(
  raw: string | null | undefined,
  feedMerchantId?: string
): string {
  const result = validateFeedUrl(raw, "image", { feedMerchantId });
  if (result.ok) return result.normalized;
  if (raw?.trim()) {
    logRejectedFeedUrl("image", raw, result.reason, feedMerchantId);
  }
  return SAFE_IMAGE_FALLBACK;
}

/**
 * Validate commercial/affiliate purchase URL for a feed.
 * Returns null when rejected (caller should drop the offer).
 */
export function sanitizeCommercialUrl(
  raw: string | null | undefined,
  feedMerchantId: string
): string | null {
  const result = validateFeedUrl(raw, "commercial", { feedMerchantId });
  if (result.ok) return result.normalized;
  if (raw?.trim()) {
    logRejectedFeedUrl("commercial", raw, result.reason, feedMerchantId);
  }
  return null;
}

/** Validate remote feed download URL (SSRF guard). Throws on failure. */
export function assertFeedDownloadUrl(raw: string): URL {
  const result = validateFeedUrl(raw, "feed-download");
  if (!result.ok) {
    logRejectedFeedUrl("feed-download", raw, result.reason);
    throw new Error(`Feed download URL rejected: ${result.reason}`);
  }
  return result.url;
}

/** CSP img-src host list (https://host form). */
export function cspImgSrcHosts(): string[] {
  const unique = new Set<string>();
  for (const host of APPROVED_IMAGE_HOSTS) {
    unique.add(`https://${host}`);
  }
  return [...unique];
}

/** Next.js `images.remotePatterns` derived from the same allowlist. */
export function imageRemotePatterns(): Array<{ protocol: "https"; hostname: string }> {
  return APPROVED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname }));
}

export function isApprovedImageHost(hostname: string): boolean {
  return hostMatchesAllowlist(hostname, APPROVED_IMAGE_HOSTS);
}

/** At DB map / render time — unknown/unsafe URLs become the safe fallback (never load via native img). */
export function sanitizeProductImageForRender(
  raw: string | null | undefined
): string {
  if (!raw?.trim()) return SAFE_IMAGE_FALLBACK;
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  const result = validateFeedUrl(trimmed, "image");
  if (result.ok) return result.normalized;
  return SAFE_IMAGE_FALLBACK;
}
