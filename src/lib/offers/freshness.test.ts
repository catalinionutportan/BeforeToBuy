import assert from "node:assert/strict";
import test from "node:test";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "./freshness";

test("formatOfferFreshness buckets ages", () => {
  const now = Date.parse("2026-08-05T12:00:00.000Z");
  assert.equal(formatOfferFreshness("2026-08-05T11:59:30.000Z", now), "Checked just now");
  assert.equal(formatOfferFreshness("2026-08-05T11:40:00.000Z", now), "Checked 20m ago");
  assert.equal(formatOfferFreshness("2026-08-05T09:00:00.000Z", now), "Checked 3h ago");
  assert.equal(formatOfferFreshness("2026-08-02T12:00:00.000Z", now), "Checked 3d ago");
  assert.equal(formatOfferFreshness(undefined, now), null);
});

test("getFreshestOfferTimestamp ignores demo offers", () => {
  assert.equal(
    getFreshestOfferTimestamp([
      { source: "demo", fetchedAt: "2026-08-05T11:00:00.000Z" },
      { source: "sample", fetchedAt: "2026-08-05T10:00:00.000Z" },
      { source: "sample", fetchedAt: "2026-08-05T11:30:00.000Z" },
    ]),
    "2026-08-05T11:30:00.000Z"
  );
});
