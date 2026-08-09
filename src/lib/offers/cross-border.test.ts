import { describe, it, expect } from 'vitest';
import type { Product } from '@/types';
import {
  applyCrossBorderVisibility,
  includesCrossBorderOffers,
  withDomesticOffersOnly,
} from './cross-border';

function offer(
  id: string,
  type: "online" | "cross_border"
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

describe('Cross-Border Offer Logic', () => {
  it("default browse strips cross-border offers", () => {
    expect(includesCrossBorderOffers(undefined)).toBe(false);
    expect(includesCrossBorderOffers("audio-headphones")).toBe(false);

    const domestic = withDomesticOffersOnly(mixedProduct);
    expect(domestic).toBeDefined();
    expect(domestic!.offers.length).toBe(1);
    expect(domestic!.offers[0].type).toBe("online");

    const visible = applyCrossBorderVisibility([mixedProduct], undefined);
    expect(visible.length).toBe(1);
    expect(visible[0].offers.every((o) => o.type !== "cross_border")).toBe(true);
  });

  it("cross-border collection keeps foreign offers for CH vs abroad compare", () => {
    expect(includesCrossBorderOffers("compare-cross-border")).toBe(true);

    const visible = applyCrossBorderVisibility([mixedProduct], "compare-cross-border");
    expect(visible.length).toBe(1);
    expect(visible[0].offers.length).toBe(2);
    expect(visible[0].offers.some((o) => o.type === "cross_border")).toBe(true);
  });

  it("products with only cross-border offers disappear from default browse", () => {
    const foreignOnly: Product = {
      ...mixedProduct,
      id: "p2",
      offers: [offer("amazon-de", "cross_border")],
    };

    expect(withDomesticOffersOnly(foreignOnly)).toBe(null);
    expect(applyCrossBorderVisibility([foreignOnly], undefined)).toEqual([]);
    expect(
      applyCrossBorderVisibility([foreignOnly], "compare-cross-border").length,
    ).toBe(1);
  });
});
