import { describe, it, expect } from 'vitest';
import { clearPriceHistoryForTests } from './price-history';
import { runPriceSnapshotJob } from './price-snapshot-job';

describe('Price Snapshot Job', () => {
  it("runPriceSnapshotJob records CH feed offers", async () => {
    await clearPriceHistoryForTests();
    const result = await runPriceSnapshotJob(["CH"]);

    expect(result.ok).toBe(true);
    expect(result.productCount).toBeGreaterThan(0);
    expect(result.offerCount).toBeGreaterThan(0);
    expect(result.appendedPoints).toBeGreaterThan(0);
    expect(result.stats.trackedOffers).toBeGreaterThan(0);
  });
});