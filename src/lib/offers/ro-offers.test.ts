import { describe, expect, it } from "vitest";
import { getRoOffers } from "@/lib/offers/ro-offers";
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
  it("returns no synthetic RO demo offers (catalog comes from live feeds)", async () => {
    const offers = await getRoOffers(product, location, null, "en");
    expect(offers).toEqual([]);
  });
});
