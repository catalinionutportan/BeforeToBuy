const STORAGE_PATTERN =
  /\b(\d+\s?(?:gb|tb|mb|kg|ml|l|inch|"|cm|mm))\b/gi;
const COLOR_PATTERN =
  /\b(natural titanium|titanium black|titanium gray|titanium grey|midnight|starlight|silver|black|white|blue|red|green|gold|graphite|space gray|space grey)\b/gi;
const MODEL_PATTERN = /\b(pro|ultra|plus|max|mini|slim|oled|air|se)\b/gi;

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/\s+/g, "-").replace(/"/g, "in").trim();
}

/** Lightweight variant fingerprint from title text (capacity, color, edition). */
export function extractVariantKey(title: string): string {
  const normalized = title.toLowerCase();
  const tokens = new Set<string>();

  for (const match of normalized.matchAll(STORAGE_PATTERN)) {
    tokens.add(normalizeToken(match[1]!));
  }
  for (const match of normalized.matchAll(COLOR_PATTERN)) {
    tokens.add(normalizeToken(match[1]!));
  }
  for (const match of normalized.matchAll(MODEL_PATTERN)) {
    tokens.add(normalizeToken(match[1]!));
  }

  if (tokens.size === 0) {
    return "base";
  }

  return Array.from(tokens).sort().join("+");
}
