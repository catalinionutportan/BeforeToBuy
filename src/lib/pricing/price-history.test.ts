import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@/types";
import {
  clearPriceHistoryForTests,
  getOfferPriceHistory,
  getPriceTrend,
  recordProductPriceHistory,
} from "./price-history";

test("recordProductPriceHistory tracks price changes", () => {
  clearPriceHistoryForTests();

  const product: Product = {
    id: "p1",
    title: "Phone",
    description: "Test",
    brand: "Apple",
    category: "mobile-smartphones",
    image: "https://example.com/i.jpg",
    targetCountries: ["CH"],
    canonicalKey: "gtin:123:v:base",
    offers: [
      {
        id: "offer-1",
        storeName: "Brack",
        price: 100,
        deliveryCost: 0,
        currency: "CHF",
        inStock: true,
        deliveryTime: "1d",
        purchaseUrl: "#",
        affiliateNetwork: "AWIN",
        type: "online",
        source: "sample",
        feedMerchantId: "ch-brack",
      },
    ],
  };

  recordProductPriceHistory([product], "2026-08-05T10:00:00.000Z");
  const updated: Product = {
    ...product,
    offers: [{ ...product.offers[0]!, price: 90, totalPrice: 90 }],
  };
  recordProductPriceHistory([updated], "2026-08-05T11:00:00.000Z");

  const history = getOfferPriceHistory(updated, updated.offers[0]!);
  assert.equal(history.length, 2);
  assert.equal(getPriceTrend(history), "down");
});
