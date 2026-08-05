import { describe, it, expect } from 'vitest';
import {
  getPriceHistoryStore,
  resetPriceHistoryStoreForTests,
} from './price-history-store';

describe('Price History Store', () => {
  it("memory store persists points across reads", async () => {
    resetPriceHistoryStoreForTests();
    const store = getPriceHistoryStore();
    expect(store.backend).toBe("memory");

    const appended = await store.appendPoint("offer:a", {
      price: 100,
      totalPrice: 100,
      recordedAt: "2026-08-05T10:00:00.000Z",
      source: "sample",
    });
    expect(appended).toBe(true);

    const points = await store.getPoints("offer:a");
    expect(points.length).toBe(1);
    expect(points[0]?.price).toBe(100);

    const skipped = await store.appendPoint("offer:a", {
      price: 100,
      totalPrice: 100,
      recordedAt: "2026-08-05T10:05:00.000Z",
      source: "sample",
    });
    expect(skipped).toBe(false);
  });

  it("memory store meta reflects tracked offers", async () => {
    resetPriceHistoryStoreForTests();
    const store = getPriceHistoryStore();

    await store.appendPoint("offer:a", {
      price: 10,
      totalPrice: 10,
      recordedAt: "2026-08-05T10:00:00.000Z",
      source: "sample",
    });
    await store.appendPoint("offer:b", {
      price: 20,
      totalPrice: 20,
      recordedAt: "2026-08-05T10:00:00.000Z",
      source: "sample",
    });

    const meta = await store.getMeta();
    expect(meta.trackedOffers).toBe(2);
    expect(meta.totalPoints).toBe(2);
  });
});