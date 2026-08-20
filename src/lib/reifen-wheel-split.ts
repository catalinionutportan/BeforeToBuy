export const AUTO_TIRES_LEAF = "auto-tires-wheels";
export const AUTO_COMPLETE_WHEELS_LEAF = "auto-complete-wheels";
export const REIFEN_FEED_MERCHANT_ID = "ch-reifencom";

const COMPLETE_WHEEL_TITLE_RE =
  /\b(komplettrad|kompletträder|kompletraeder|complete\s+wheels?)\b/i;
/** Reifen.com rim SKUs look like "20 Ludwig 7 5x17 5x112 ET35 MB66 6". */
const RIM_OFFSET_TITLE_RE = /\bET\s?\d{2,3}\b/i;

/**
 * Prisma cannot match ET+digits. " ET" is too loose: French "et" in baby-walz
 * titles stole the Kompletträder cover. Offset codes are ET15–ET60.
 */
export const REIFEN_RIM_TITLE_CONTAINS = [
  " ET1",
  " ET2",
  " ET3",
  " ET4",
  " ET5",
  " ET6",
  "komplettrad",
  "kompletraeder",
  "kompletträder",
] as const;

const PREFERRED_RIM_TITLE_CONTAINS = ["Ludwig", "Fritz", "Borbet", "Carmani", "Rial"] as const;

export function titleLooksLikeCompleteWheelOrRim(
  title: string | null | undefined
): boolean {
  const text = title ?? "";
  return COMPLETE_WHEEL_TITLE_RE.test(text) || RIM_OFFSET_TITLE_RE.test(text);
}

export function isReifenHostedImage(url: string | null | undefined): boolean {
  return Boolean(url && /reifen\.com/i.test(url));
}

export function preferredReifenRimTitleContains(): readonly string[] {
  return PREFERRED_RIM_TITLE_CONTAINS;
}

/** Live Reifen rows are still stored as tires until the next import. */
export function resolveAutoLeafFromTitle(
  category: string,
  title?: string | null
): string {
  if (category !== AUTO_TIRES_LEAF && category !== AUTO_COMPLETE_WHEELS_LEAF) {
    return category;
  }
  return titleLooksLikeCompleteWheelOrRim(title) ? AUTO_COMPLETE_WHEELS_LEAF : AUTO_TIRES_LEAF;
}
