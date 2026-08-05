import { describe, it, expect, vi } from 'vitest';
import { fetchCountryPriceMultipliers } from "@/lib/api-aggregator";

const mockCountryPriceMultipliers = {
  CH: 1.15,
  DE: 1.0,
  FR: 1.02,
  RO: 4.98,
  GB: 0.85,
  US: 1.05,
};

vi.mock('./price-history');
vi.mock("./price-snapshot-job");

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockCountryPriceMultipliers),
  } as Response)
);
vi.mock("@/lib/api-aggregator", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    fetchCountryPriceMultipliers: vi.fn(() => Promise.resolve(mockCountryPriceMultipliers)),
  };
});


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