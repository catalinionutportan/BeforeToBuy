/**
 * Live outbound affiliate quicklinks (RO beta).
 * Scule365 also has a Google Merchant product feed — deep links wrap product URLs below.
 */
export const AFFILIATE_LINKS = {
  emagProfitshare: "https://l.profitshare.ro/l/16283250",
  evomag2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=d4f678b43&redirect_to=https%3A%2F%2Fwww.evomag.ro%2F",
  rowenta2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=d19151f4f&redirect_to=https%3A%2F%2Fwww.rowenta.ro%2F",
  scule3652Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=8e59c17b0&redirect_to=https%3A%2F%2Fwww.scule365.ro",
  /** aff_code filled from publisher account — quicklink export sometimes omits it */
  autoeco2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=7cf7c22ce&redirect_to=https%3A%2F%2Fwww.autoeco.ro",
  /** redirect_to normalized (export had double-encoded https%253A) */
  soundhouse2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=3efdbc6c8&redirect_to=https%3A%2F%2Fsoundhouse.ro%2F",
  /** redirect_to normalized (export had double-encoded https%253A) */
  autobob2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=103440734&redirect_to=https%3A%2F%2Fautobob.ro",
  automobilus2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=ef2621c0a&redirect_to=https%3A%2F%2Fautomobilus.ro",
  paahome2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=2c9f51768&redirect_to=https%3A%2F%2Fpaa-home.ro",
  mxenduro2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=90cc26df2&redirect_to=https%3A%2F%2Fmxenduro.ro",
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
