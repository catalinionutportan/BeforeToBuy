import assert from "node:assert/strict";
import test from "node:test";
import { getPriceTrend } from "./price-trend";

test("getPriceTrend detects downward movement", () => {
  const history = [
    { price: 100, totalPrice: 100, recordedAt: "2026-08-05T10:00:00.000Z", source: "sample" as const },
    { price: 90, totalPrice: 90, recordedAt: "2026-08-05T11:00:00.000Z", source: "sample" as const },
  ];
  assert.equal(getPriceTrend(history), "down");
});
