import assert from "node:assert/strict";
import test from "node:test";
import type { Offer, Product } from "@/types";
import {
  applyOfferFilters,
  collectBrandOptions,
  hasActiveOfferFilters,
  offerMatchesDomain,
  parseOfferFiltersFromSearchParams,
} from "./offer-filters";

function offer(partial: Partial<Offer> & { id: string }): Offer {
  return {
    storeName: "Digitec",
    price: 100,
    currency: "CHF",
    inStock: true,
    deliveryTime: "1-2 days",
    deliveryCost: 0,
    purchaseUrl: "https://www.digitec.ch/product",
    affiliateNetwork: "test",
    type: "online",
    source: "demo",
    ...partial,
  };
}

const products: Product[] = [
  {
    id: "p1",
    title: "Headphones A",
    description: "Noise cancelling",
    brand: "Sony",
    category: "audio-headphones",
    image: "",
    targetCountries: ["CH"],
    gtin: "00012345678905",
    offers: [
      offer({ id: "d1", storeName: "Digitec", price: 180, deliveryCost: 0 }),
      offer({
        id: "a1",
        storeName: "Amazon.de (Delivered to CH)",
        price: 150,
        deliveryCost: 9.9,
        purchaseUrl: "https://www.amazon.de/dp/x",
        inStock: false,
      }),
    ],
  },
  {
    id: "p2",
    title: "Headphones B",
    description: "Budget",
    brand: "JBL",
    category: "audio-headphones",
    image: "",
    targetCountries: ["CH"],
    offers: [
      offer({
        id: "g1",
        storeName: "Galaxus",
        price: 90,
        deliveryCost: 5,
        purchaseUrl: "https://www.galaxus.ch/product",
      }),
    ],
  },
];

test("domain matcher accepts store name and purchase URL tokens", () => {
  assert.equal(offerMatchesDomain(products[0]!.offers[0]!, "digitec.ch"), true);
  assert.equal(offerMatchesDomain(products[0]!.offers[1]!, "amazon.de"), true);
  assert.equal(offerMatchesDomain(products[0]!.offers[0]!, "galaxus.ch"), false);
});

test("applyOfferFilters trims offers and supports brand/stock/price/gtin", () => {
  const byBrand = applyOfferFilters(products, { brand: "Sony" });
  assert.equal(byBrand.length, 1);
  assert.equal(byBrand[0]!.brand, "Sony");

  const inStock = applyOfferFilters(products, { inStockOnly: true, domain: "amazon.de" });
  assert.equal(inStock.length, 0);

  const free = applyOfferFilters(products, { freeDeliveryOnly: true });
  assert.equal(free.length, 1);
  assert.equal(free[0]!.offers.length, 1);
  assert.equal(free[0]!.offers[0]!.deliveryCost, 0);

  const capped = applyOfferFilters(products, { maxTotalPrice: 100 });
  assert.equal(capped.length, 1);
  assert.equal(capped[0]!.brand, "JBL");

  const withGtin = applyOfferFilters(products, { hasGtinOnly: true });
  assert.equal(withGtin.length, 1);
  assert.equal(withGtin[0]!.id, "p1");
});

test("brand options are sorted unique labels", () => {
  assert.deepEqual(collectBrandOptions(products), ["JBL", "Sony"]);
});

test("URL params round-trip into criteria", () => {
  const params = new URLSearchParams(
    "domain=digitec.ch&brand=Sony&inStock=1&freeDelivery=1&maxTotal=200&hasGtin=1"
  );
  const criteria = parseOfferFiltersFromSearchParams(params);
  assert.equal(criteria.domain, "digitec.ch");
  assert.equal(criteria.brand, "Sony");
  assert.equal(criteria.inStockOnly, true);
  assert.equal(criteria.freeDeliveryOnly, true);
  assert.equal(criteria.maxTotalPrice, 200);
  assert.equal(criteria.hasGtinOnly, true);
  assert.equal(hasActiveOfferFilters(criteria), true);
  assert.equal(hasActiveOfferFilters({}), false);
});
