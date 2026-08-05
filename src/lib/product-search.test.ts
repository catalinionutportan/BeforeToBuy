import assert from "node:assert/strict";
import test from "node:test";
import { productMatchesSearchQuery } from "./product-search";

const product = {
  title: "Sony WH-1000XM5",
  brand: "Sony",
  description: "Wireless headphones",
  gtin: "00045487361453",
};

test("search matches title brand description and GTIN digits", () => {
  assert.equal(productMatchesSearchQuery(product, "wh-1000"), true);
  assert.equal(productMatchesSearchQuery(product, "sony"), true);
  assert.equal(productMatchesSearchQuery(product, "45487361453"), true);
  assert.equal(productMatchesSearchQuery(product, "00045487361453"), true);
  assert.equal(productMatchesSearchQuery(product, "bosch"), false);
});
