import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@/types";
import {
  applyCrossBorderVisibility,
  includesCrossBorderOffers,
  withDomesticOffersOnly,
} from "./cross-border";

function offer(
  id: string,
  type: "online" | "local_pickup" | "cross_border"
): Product["offers"][number] {
  return {
    id,
    storeName: id,
    price: 100,
    currency: "CHF",
    inStock: true,
    deliveryTime: "1-2 days",
    deliveryCost: 0,
    purchaseUrl: `https://example.com/${id}`,
    affiliateNetwork: "test",
    type,
    source: "demo",
  };
}

const mixedProduct: Product = {
  id: "p1",
  title: "Mixed product",
  description: "Has Swiss and cross-border offers",
  brand: "Test",
  category: "audio-headphones",
  image: "",
  targetCountries: ["CH"],
  offers: [offer("digitec", "online"), offer("amazon-de", "cross_border")],
};

test("default browse strips cross-border offers", () => {
  assert.equal(includesCrossBorderOffers(undefined), false);
  assert.equal(includesCrossBorderOffers("audio-headphones"), false);

  const domestic = withDomesticOffersOnly(mixedProduct);
  assert.ok(domestic);
  assert.equal(domestic.offers.length, 1);
  assert.equal(domestic.offers[0].type, "online");

  const visible = applyCrossBorderVisibility([mixedProduct], undefined);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].offers.every((o) => o.type !== "cross_border"), true);
});

test("cross-border collection keeps foreign offers for CH vs abroad compare", () => {
  assert.equal(includesCrossBorderOffers("compare-cross-border"), true);

  const visible = applyCrossBorderVisibility([mixedProduct], "compare-cross-border");
  assert.equal(visible.length, 1);
  assert.equal(visible[0].offers.length, 2);
  assert.ok(visible[0].offers.some((o) => o.type === "cross_border"));
});

test("products with only cross-border offers disappear from default browse", () => {
  const foreignOnly: Product = {
    ...mixedProduct,
    id: "p2",
    offers: [offer("amazon-de", "cross_border")],
  };

  assert.equal(withDomesticOffersOnly(foreignOnly), null);
  assert.deepEqual(applyCrossBorderVisibility([foreignOnly], undefined), []);
  assert.equal(
    applyCrossBorderVisibility([foreignOnly], "compare-cross-border").length,
    1
  );
});
