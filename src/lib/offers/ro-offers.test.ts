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
  it("returns live RO affiliate outbound links including AutoEco", async () => {
    const offers = await getRoOffers(product, location, null, "en");

    expect(offers).toHaveLength(5);
    expect(offers[0]?.storeName).toBe("eMAG.ro");
    expect(offers[0]?.purchaseUrl).toBe(AFFILIATE_LINKS.emagProfitshare);

    expect(offers[1]?.storeName).toBe("evoMAG.ro");
    expect(offers[1]?.purchaseUrl).toBe(AFFILIATE_LINKS.evomag2Performant);

    expect(offers[2]?.storeName).toBe("Rowenta.ro");
    expect(offers[2]?.purchaseUrl).toBe(AFFILIATE_LINKS.rowenta2Performant);

    expect(offers[3]?.storeName).toBe("Scule365.ro");
    expect(offers[3]?.purchaseUrl).toBe(AFFILIATE_LINKS.scule3652Performant);

    expect(offers[4]?.storeName).toBe("AutoEco.ro");
    expect(offers[4]?.purchaseUrl).toBe(AFFILIATE_LINKS.autoeco2Performant);
    expect(offers[4]?.affiliateNetwork).toBe("2Performant Romania");
    expect(AFFILIATE_LINKS.autoeco2Performant).toContain("aff_code=244836372");
    expect(AFFILIATE_LINKS.autoeco2Performant).toContain("unique=7cf7c22ce");
  });
});
