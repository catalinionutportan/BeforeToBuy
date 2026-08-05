import assert from "node:assert/strict";
import test from "node:test";
import { isValidGtinChecksum, normalizeGtin, resolveGtin } from "./gtin";

test("normalizeGtin pads 13-digit EAN to 14 digits", () => {
  assert.equal(normalizeGtin("7612345678901"), "07612345678901");
});

test("resolveGtin accepts values without valid checksum in sample data", () => {
  assert.equal(resolveGtin("7612345678901"), "07612345678901");
});

test("isValidGtinChecksum validates known GTIN", () => {
  assert.equal(isValidGtinChecksum("07612345678901"), false);
  assert.equal(isValidGtinChecksum("00000000000000"), true);
});
