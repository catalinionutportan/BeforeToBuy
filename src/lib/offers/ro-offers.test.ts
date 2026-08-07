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
  it("returns live RO affiliate outbound links including PAA-Home", async () => {
    const offers = await getRoOffers(product, location, null, "en");

    expect(offers).toHaveLength(9);
    expect(offers.map((o) => o.storeName)).toEqual([
      "eMAG.ro",
      "evoMAG.ro",
      "Rowenta.ro",
      "Scule365.ro",
      "AutoEco.ro",
      "Soundhouse.ro",
      "Autobob.ro",
      "Automobilus.ro",
      "PAA-Home.ro",
    ]);
    expect(offers[8]?.purchaseUrl).toBe(AFFILIATE_LINKS.paahome2Performant);
    expect(AFFILIATE_LINKS.paahome2Performant).toContain("unique=2c9f51768");
  });
});
