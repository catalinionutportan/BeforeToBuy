import assert from "node:assert/strict";
import test from "node:test";
import {
  getPriceHistoryStore,
  resetPriceHistoryStoreForTests,
} from "./price-history-store";

test("memory store persists points across reads", async () => {
  resetPriceHistoryStoreForTests();
  const store = getPriceHistoryStore();
  assert.equal(store.backend, "memory");

  const appended = await store.appendPoint("offer:a", {
    price: 100,
    totalPrice: 100,
    recordedAt: "2026-08-05T10:00:00.000Z",
    source: "sample",
  });
  assert.equal(appended, true);

  const points = await store.getPoints("offer:a");
  assert.equal(points.length, 1);
  assert.equal(points[0]?.price, 100);

  const skipped = await store.appendPoint("offer:a", {
    price: 100,
    totalPrice: 100,
    recordedAt: "2026-08-05T10:05:00.000Z",
    source: "sample",
  });
  assert.equal(skipped, false);
});

test("memory store meta reflects tracked offers", async () => {
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
  assert.equal(meta.trackedOffers, 2);
  assert.equal(meta.totalPoints, 2);
});
