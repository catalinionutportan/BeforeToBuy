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
  it("returns live RO affiliate outbound links including Soundhouse", async () => {
    const offers = await getRoOffers(product, location, null, "en");

    expect(offers).toHaveLength(6);
    expect(offers.map((o) => o.storeName)).toEqual([
      "eMAG.ro",
      "evoMAG.ro",
      "Rowenta.ro",
      "Scule365.ro",
      "AutoEco.ro",
      "Soundhouse.ro",
    ]);
    expect(offers[5]?.purchaseUrl).toBe(AFFILIATE_LINKS.soundhouse2Performant);
    expect(AFFILIATE_LINKS.soundhouse2Performant).toContain("unique=3efdbc6c8");
    expect(AFFILIATE_LINKS.soundhouse2Performant).toContain(
      "redirect_to=https%3A%2F%2Fsoundhouse.ro%2F"
    );
  });
});
