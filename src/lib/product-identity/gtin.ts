/** Normalize GTIN/EAN/UPC strings to a stable 14-digit key when possible. */
export function normalizeGtin(raw?: string | null): string | undefined {
  if (!raw) return undefined;

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) return undefined;

  if (digits.length === 14) return digits;
  if (digits.length === 13) return `0${digits}`;
  if (digits.length === 12) return `00${digits}`;
  if (digits.length === 8) return `000000${digits}`;

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
