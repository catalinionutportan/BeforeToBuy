import { describe, it, expect } from 'vitest';
import type { Offer, Product } from '@/types';
import {
  applyOfferFilters,
  collectBrandOptions,
  hasActiveOfferFilters,
  offerMatchesDomain,
  parseOfferFiltersFromSearchParams,
} from './offer-filters';

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

describe('Offer Filtering Logic', () => {
  it("domain matcher accepts store name and purchase URL tokens", () => {
    expect(offerMatchesDomain(products[0]!.offers[0]!, "digitec.ch")).toBe(true);
    expect(offerMatchesDomain(products[0]!.offers[1]!, "amazon.de")).toBe(true);
    expect(offerMatchesDomain(products[0]!.offers[0]!, "galaxus.ch")).toBe(false);
  });

  it("applyOfferFilters trims offers and supports brand/stock/price/gtin", () => {
    const byBrand = applyOfferFilters(products, { brand: "Sony" });
    expect(byBrand.length).toBe(1);
    expect(byBrand[0]!.brand).toBe("Sony");

    const inStock = applyOfferFilters(products, { inStockOnly: true, domain: "amazon.de" });
    expect(inStock.length).toBe(0);

    const free = applyOfferFilters(products, { freeDeliveryOnly: true });
    expect(free.length).toBe(1);
    expect(free[0]!.offers.length).toBe(1);
    expect(free[0]!.offers[0]!.deliveryCost).toBe(0);

    const unknownDelivery = applyOfferFilters(
      [
        {
          ...products[1]!,
          offers: [offer({ id: "unknown", deliveryCost: undefined })],
        },
      ],
      { freeDeliveryOnly: true }
    );
    expect(unknownDelivery).toHaveLength(0);

    const capped = applyOfferFilters(products, { maxTotalPrice: 100 });
    expect(capped.length).toBe(1);
    expect(capped[0]!.brand).toBe("JBL");

    const withGtin = applyOfferFilters(products, { hasGtinOnly: true });
    expect(withGtin.length).toBe(1);
    expect(withGtin[0]!.id).toBe("p1");
  });

  it("brand options are sorted unique labels", () => {
    expect(collectBrandOptions(products)).toEqual(["JBL", "Sony"]);
  });

  it("URL params round-trip into criteria", () => {
    const params = new URLSearchParams(
      "domain=digitec.ch&brand=Sony&inStock=1&freeDelivery=1&maxTotal=200&hasGtin=1"
    );
    const criteria = parseOfferFiltersFromSearchParams(params);
    expect(criteria.domain).toBe("digitec.ch");
    expect(criteria.brand).toBe("Sony");
    expect(criteria.inStockOnly).toBe(true);
    expect(criteria.freeDeliveryOnly).toBe(true);
    expect(criteria.maxTotalPrice).toBe(200);
    expect(criteria.hasGtinOnly).toBe(true);
    expect(hasActiveOfferFilters(criteria)).toBe(true);
    expect(hasActiveOfferFilters({})).toBe(false);
  });
});
