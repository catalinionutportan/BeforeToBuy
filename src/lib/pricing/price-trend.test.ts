import { describe, it, expect } from 'vitest';
import { getPriceTrend } from './price-trend';

describe('Price Trend Logic', () => {
  it("getPriceTrend detects downward movement", () => {
    const history = [
      { price: 100, totalPrice: 100, recordedAt: "2026-08-05T10:00:00.000Z", source: "sample" as const },
      { price: 90, totalPrice: 90, recordedAt: "2026-08-05T11:00:00.000Z", source: "sample" as const },
    ];
    expect(getPriceTrend(history)).toBe("down");
  });
});