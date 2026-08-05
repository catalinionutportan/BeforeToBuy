import { describe, it, expect } from 'vitest';
import type { Offer } from '@/types';
import { computeTotalPrice, sortOffersByTotalPrice } from '../pricing/total-price';

describe('Total Price Calculation', () => {
  it("computeTotalPrice adds delivery cost", () => {
    expect(
      computeTotalPrice({ price: 100, deliveryCost: 9.9 } as Offer),
    ).toBe(109.9);
  });

  it("sortOffersByTotalPrice ranks by total not list price", () => {
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
    expect(sorted[0]?.id).toBe("b");
  });
});