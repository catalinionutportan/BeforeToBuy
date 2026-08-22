export const NOTEBOOKS_LAPTOPS_LEAF = "notebooks-laptops";

/** Titles that usually photograph as a clamshell laptop, not a dock or desk. */
export const LAPTOP_COVER_TITLE_TOKENS = [
  "laptop",
  "notebook",
  "ultrabook",
  "chromebook",
  "macbook",
  "swift",
  "travelmate",
  "aspire",
] as const;

export const LAPTOP_COVER_TITLE_EXCLUDE = [
  "schreibtisch",
  "standing desk",
  "office desk",
  "docking",
  " dock",
  "usb-c hub",
  "tasche",
  "sleeve",
  "hülle",
  "huelle",
  " bag",
  "adapter",
  "ladegerät",
  "ladegeraet",
  "desktop",
  "veriton",
  "aspire tc",
] as const;

export function isLikelyLaptopCoverTitle(title: string): boolean {
  const normalized = ` ${title.toLowerCase()} `;
  if (LAPTOP_COVER_TITLE_EXCLUDE.some((token) => normalized.includes(token))) {
    return false;
  }
  return LAPTOP_COVER_TITLE_TOKENS.some((token) => normalized.includes(token));
}
