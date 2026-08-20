export const AUTO_TIRES_LEAF = "auto-tires-wheels";
export const AUTO_COMPLETE_WHEELS_LEAF = "auto-complete-wheels";

const COMPLETE_WHEEL_TITLE_RE =
  /\b(komplettrad|kompletträder|kompletraeder|complete\s+wheels?)\b/i;
/** Reifen.com rim SKUs look like "20 Ludwig 7 5x17 5x112 ET35 MB66 6". */
const RIM_OFFSET_TITLE_RE = /\bET\s?\d{2,3}\b/i;

export function titleLooksLikeCompleteWheelOrRim(
  title: string | null | undefined
): boolean {
  const text = title ?? "";
  return COMPLETE_WHEEL_TITLE_RE.test(text) || RIM_OFFSET_TITLE_RE.test(text);
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
