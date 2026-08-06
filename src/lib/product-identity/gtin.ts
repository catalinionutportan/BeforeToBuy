const VALID_GTIN_LENGTHS = [8, 12, 13, 14] as const;

/** Normalize GTIN/EAN/UPC strings to a stable 14-digit key when possible. */
export function normalizeGtin(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  const digits = raw.trim().replace(/\D/g, "");
  if (!VALID_GTIN_LENGTHS.includes(digits.length as (typeof VALID_GTIN_LENGTHS)[number])) {
    return undefined;
  }

  return digits.padStart(14, "0");
}

export function isValidGtinChecksum(gtin14: string): boolean {
  if (!/^\d{14}$/.test(gtin14)) return false;

  const digits = gtin14.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const weight = i % 2 === 0 ? 3 : 1;
    sum += digits[i]! * weight;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[13];
}

export function resolveGtin(
  ...candidates: Array<string | undefined | null>
): string | undefined {
  for (const candidate of candidates) {
    const normalized = normalizeGtin(candidate);
    if (!normalized) continue;
    if (isValidGtinChecksum(normalized)) return normalized;
    if (normalized.length >= 12) return normalized;
  }
  return undefined;
}
