/**
 * Live outbound affiliate quicklinks.
 * Add a merchant here only when the programme is accepted and we wire it on-site.
 */
export const AFFILIATE_LINKS = {
  rowenta2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=d19151f4f&redirect_to=https%3A%2F%2Fwww.rowenta.ro%2F",
  scule3652Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=8e59c17b0&redirect_to=https%3A%2F%2Fwww.scule365.ro",
  /** evoMAG homepage — 2Performant campaign unique d4f678b43. Product feed TBD (specialty only). */
  evomag2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=d4f678b43&redirect_to=https%3A%2F%2Fwww.evomag.ro%2F",
  /** Seentat UK homepage — AWIN advertiser 125014 / publisher 3024371. */
  seentatAwin:
    "https://www.awin1.com/cread.php?awinmid=125014&awinaffid=3024371&ued=https%3A%2F%2Fwww.seentat.com",
} as const;

const SCULE365_2P_BASE =
  "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=8e59c17b0&redirect_to=";

/** Wrap a Scule365 product URL with the 2Performant tracking quicklink. */
export function wrapScule365AffiliateUrl(productUrl: string): string {
  const trimmed = productUrl.trim();
  if (!trimmed) return AFFILIATE_LINKS.scule3652Performant;
  if (trimmed.includes("event.2performant.com")) return trimmed;
  return `${SCULE365_2P_BASE}${encodeURIComponent(trimmed)}`;
}
