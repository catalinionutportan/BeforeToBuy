import assert from "node:assert/strict";
import test from "node:test";
import { clearPriceHistoryForTests } from "./price-history";
import { runPriceSnapshotJob } from "./price-snapshot-job";

test("runPriceSnapshotJob records CH feed offers", async () => {
  await clearPriceHistoryForTests();
  const result = await runPriceSnapshotJob(["CH"]);

  assert.equal(result.ok, true);
  assert.ok(result.productCount > 0);
  assert.ok(result.offerCount > 0);
  assert.ok(result.appendedPoints > 0);
  assert.ok(result.stats.trackedOffers > 0);
});
