import { describe, expect, it } from "vitest";
import { getRoOffers } from "@/lib/offers/ro-offers";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";
import type { Product, UserLocation } from "@/types";

const product = {
  id: "demo-phone",
  title: "Demo Phone X",
  basePrice: 400,
} as Product;

const location = {
  countryCode: "RO",
  city: "București",
} as UserLocation;

describe("getRoOffers", () => {
  it("returns live RO affiliate outbound links including Automobilus", async () => {
    const offers = await getRoOffers(product, location, null, "en");

    expect(offers).toHaveLength(8);
    expect(offers.map((o) => o.storeName)).toEqual([
      "eMAG.ro",
      "evoMAG.ro",
      "Rowenta.ro",
      "Scule365.ro",
      "AutoEco.ro",
      "Soundhouse.ro",
      "Autobob.ro",
      "Automobilus.ro",
    ]);
    expect(offers[7]?.purchaseUrl).toBe(AFFILIATE_LINKS.automobilus2Performant);
    expect(AFFILIATE_LINKS.automobilus2Performant).toContain("unique=ef2621c0a");
  });
});
