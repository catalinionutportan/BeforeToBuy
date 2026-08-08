import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Product } from '@/types';

const sampleProduct: Product = {
  id: 'test-product-1',
  title: 'Test Headphones',
  description: 'Test product used by the price snapshot job test.',
  category: 'audio',
  brand: 'TestBrand',
  image: 'https://example.com/image.png',
  targetCountries: ['CH'],
  catalogSource: 'sample',
  offers: [
    {
      id: 'offer-1',
      storeName: 'Test Store',
      price: 100,
      currency: 'CHF',
      inStock: true,
      deliveryCost: 0,
      purchaseUrl: 'https://example.com/offer',
      affiliateNetwork: 'Test Network',
      source: 'sample',
      type: 'online',
      deliveryTime: '1-2 days',
    },
  ],
};

// Mock the job's actual dependencies (feed loading + demo product fetch), not
// the job module itself, so `runPriceSnapshotJob` runs for real against a
// deterministic feed product and its side effects (price history) can be checked.
vi.mock('@/lib/api-aggregator', () => ({
  fetchProductsForLocation: vi.fn(async () => [] as Product[]),
}));

vi.mock('@/lib/merchant-feeds', () => ({
  getFeedProducts: vi.fn(async () => ({
    products: [sampleProduct],
    sources: ['sample'],
    mappingLog: [],
    merchantProductCounts: { 'test-merchant': 1 },
  })),
}));

import { clearPriceHistoryForTests } from './price-history';
import { runPriceSnapshotJob } from './price-snapshot-job';

describe('Price Snapshot Job', () => {
  beforeEach(async () => {
    await clearPriceHistoryForTests();
  });

  it("runPriceSnapshotJob records RO feed offers", async () => {
    const result = await runPriceSnapshotJob(["RO"]);

    expect(result.ok).toBe(true);
    expect(result.productCount).toBeGreaterThan(0);
    expect(result.offerCount).toBeGreaterThan(0);
    expect(result.appendedPoints).toBeGreaterThan(0);
    expect(result.stats.trackedOffers).toBeGreaterThan(0);
  });
});
