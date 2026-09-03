/**
 * Live outbound affiliate quicklinks.
 * Add a merchant here only when the programme is accepted and we wire it on-site.
 */
export const AFFILIATE_LINKS = {
  rowenta2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=d19151f4f&redirect_to=https%3A%2F%2Fwww.rowenta.ro%2F",
  scule3652Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=8e59c17b0&redirect_to=https%3A%2F%2Fwww.scule365.ro",
  /** evoMAG homepage — 2Performant campaign unique d4f678b43 (+ live product feed). */
  evomag2Performant:
    "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=244836372&unique=d4f678b43&redirect_to=https%3A%2F%2Fwww.evomag.ro%2F",
  /** Seentat UK homepage — AWIN advertiser 125014 / publisher 3024371. */
  seentatAwin:
    "https://www.awin1.com/cread.php?awinmid=125014&awinaffid=3024371&ued=https%3A%2F%2Fwww.seentat.com",
  /** Ottocast homepage — AWIN advertiser 96499 / publisher 3024371 (USD catalogue). */
  ottocastAwin:
    "https://www.awin1.com/cread.php?awinmid=96499&awinaffid=3024371&ued=https%3A%2F%2Fwww.ottocast.com",
  /** Geepas UK homepage — AWIN advertiser 46851 / publisher 3024371 (GBP catalogue). */
  geepasAwin:
    "https://www.awin1.com/cread.php?awinmid=46851&awinaffid=3024371&ued=https%3A%2F%2Fgeepas.co.uk",
  /** baby-walz CH homepage — AWIN advertiser 11616 / publisher 3024371 (CHF catalogue). */
  babywalzAwin:
    "https://www.awin1.com/cread.php?awinmid=11616&awinaffid=3024371&ued=https%3A%2F%2Fwww.baby-walz.ch%2Fde%2F",
  /** Reifen.com CH homepage — AWIN advertiser 11412 / publisher 3024371 (CHF catalogue). */
  reifencomAwin:
    "https://www.awin1.com/cread.php?awinmid=11412&awinaffid=3024371&ued=https%3A%2F%2Fwww.reifen.com%2Fde-ch",
  /** Belando CH homepage — AWIN advertiser 13668 / publisher 3024371 (CHF beauty catalogue). */
  belandoAwin:
    "https://www.awin1.com/cread.php?awinmid=13668&awinaffid=3024371&ued=https%3A%2F%2Fbelando.ch%2F",
  /** Acer CH homepage — AWIN advertiser 23364 / publisher 3024371 (CHF notebooks catalogue). */
  acerAwin:
    "https://www.awin1.com/cread.php?awinmid=23364&awinaffid=3024371&ued=https%3A%2F%2Fstore.acer.com%2Fde-ch%2F",
  /** Gigasport CH homepage — AWIN advertiser 22149 / publisher 3024371 (CHF sports catalogue). */
  gigasportAwin:
    "https://www.awin1.com/cread.php?awinmid=22149&awinaffid=3024371&ued=https%3A%2F%2Fwww.gigasport.ch%2F",
  /** Arlo Security UK homepage — AWIN advertiser 122884 / publisher 3024371 (GBP catalogue). */
  arloAwin:
    "https://www.awin1.com/cread.php?awinmid=122884&awinaffid=3024371&ued=https%3A%2F%2Fwww.arlo.com%2Fen-gb",
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
