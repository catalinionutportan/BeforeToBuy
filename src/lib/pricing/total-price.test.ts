import assert from "node:assert/strict";
import test from "node:test";
import type { Offer } from "@/types";
import { computeTotalPrice, sortOffersByTotalPrice } from "../pricing/total-price";

test("computeTotalPrice adds delivery cost", () => {
  assert.equal(
    computeTotalPrice({ price: 100, deliveryCost: 9.9 }),
    109.9
  );
});

test("sortOffersByTotalPrice ranks by total not list price", () => {
  const offers: Offer[] = [
    {
      id: "a",
      storeName: "A",
      price: 90,
      deliveryCost: 20,
      currency: "CHF",
      inStock: true,
      deliveryTime: "1d",
      purchaseUrl: "#",
      affiliateNetwork: "Test",
      type: "online",
      source: "sample",
    },
    {
      id: "b",
      storeName: "B",
      price: 100,
      deliveryCost: 0,
      currency: "CHF",
      inStock: true,
      deliveryTime: "1d",
      purchaseUrl: "#",
      affiliateNetwork: "Test",
      type: "online",
      source: "sample",
    },
  ];

  const sorted = sortOffersByTotalPrice(offers);
  assert.equal(sorted[0]?.id, "b");
});
