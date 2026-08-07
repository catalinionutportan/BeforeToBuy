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
  it("returns live RO affiliate outbound links including Autobob", async () => {
    const offers = await getRoOffers(product, location, null, "en");

    expect(offers).toHaveLength(7);
    expect(offers.map((o) => o.storeName)).toEqual([
      "eMAG.ro",
      "evoMAG.ro",
      "Rowenta.ro",
      "Scule365.ro",
      "AutoEco.ro",
      "Soundhouse.ro",
      "Autobob.ro",
    ]);
    expect(offers[6]?.purchaseUrl).toBe(AFFILIATE_LINKS.autobob2Performant);
    expect(AFFILIATE_LINKS.autobob2Performant).toContain("unique=103440734");
    expect(AFFILIATE_LINKS.autobob2Performant).toContain(
      "redirect_to=https%3A%2F%2Fautobob.ro"
    );
  });
});
