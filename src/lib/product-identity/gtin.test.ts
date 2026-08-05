import { describe, it, expect } from 'vitest';
import { isValidGtinChecksum, normalizeGtin, resolveGtin } from './gtin';

describe('GTIN Utilities', () => {
  it("normalizeGtin pads 13-digit EAN to 14 digits", () => {
    expect(normalizeGtin("7612345678901")).toBe("07612345678901");
  });

  it("resolveGtin accepts values without valid checksum in sample data", () => {
    expect(resolveGtin("7612345678901")).toBe("07612345678901");
  });

  it("isValidGtinChecksum validates known GTIN", () => {
    expect(isValidGtinChecksum("07612345678901")).toBe(false);
    expect(isValidGtinChecksum("00000000000000")).toBe(true);
  });
});