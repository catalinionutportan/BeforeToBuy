import { describe, it, expect } from 'vitest';
import { formatOfferFreshness, getFreshestOfferTimestamp } from './freshness';

describe('Offer Freshness Utilities', () => {
  it("formatOfferFreshness buckets ages", () => {
    const now = Date.parse("2026-08-05T12:00:00.000Z");
    expect(formatOfferFreshness("2026-08-05T11:59:30.000Z", now)).toBe("Checked just now");
    expect(formatOfferFreshness("2026-08-05T11:40:00.000Z", now)).toBe("Checked 20m ago");
    expect(formatOfferFreshness("2026-08-05T09:00:00.000Z", now)).toBe("Checked 3h ago");
    expect(formatOfferFreshness("2026-08-02T12:00:00.000Z", now)).toBe("Checked 3d ago");
    expect(formatOfferFreshness(undefined, now)).toBe(null);
  });

  it("localizes freshness without changing the timestamp calculation", () => {
    const now = Date.parse("2026-08-05T12:00:00.000Z");
    expect(formatOfferFreshness("2026-08-05T11:40:00.000Z", now, "ro")).toBe(
      "Verificat acum 20 min"
    );
    expect(formatOfferFreshness("2026-08-05T09:00:00.000Z", now, "de")).toBe(
      "Vor 3 Std. geprüft"
    );
  });

  it("getFreshestOfferTimestamp ignores demo offers", () => {
    expect(
      getFreshestOfferTimestamp([
        { source: "demo", fetchedAt: "2026-08-05T11:00:00.000Z" },
        { source: "sample", fetchedAt: "2026-08-05T10:00:00.000Z" },
        { source: "sample", fetchedAt: "2026-08-05T11:30:00.000Z" },
      ] as Parameters<typeof getFreshestOfferTimestamp>[0]),
    ).toBe("2026-08-05T11:30:00.000Z");
  });
});
