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
  it("returns live RO affiliate outbound links including MxEnduro (no eMAG)", async () => {
    const offers = await getRoOffers(product, location, null, "en");

    expect(offers).toHaveLength(9);
    expect(offers.map((o) => o.storeName)).toEqual([
      "evoMAG.ro",
      "Rowenta.ro",
      "Scule365.ro",
      "AutoEco.ro",
      "Soundhouse.ro",
      "Autobob.ro",
      "Automobilus.ro",
      "PAA-Home.ro",
      "MxEnduro.ro",
    ]);
    expect(offers.some((o) => /emag/i.test(o.storeName))).toBe(false);
    expect(offers.some((o) => /profitshare/i.test(o.affiliateNetwork ?? ""))).toBe(false);
    expect(offers[8]?.purchaseUrl).toBe(AFFILIATE_LINKS.mxenduro2Performant);
    expect(AFFILIATE_LINKS.mxenduro2Performant).toContain("unique=90cc26df2");
  });
});
