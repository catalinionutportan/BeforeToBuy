import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchProductsForLocation, generateOffersForLocation } from "./api-aggregator";
import type { UserLocation } from "@/types";
import * as chOffers from "./offers/ch-offers";
import * as deOffers from "./offers/de-offers";
import * as frOffers from "./offers/fr-offers";
import * as roOffers from "./offers/ro-offers";
import * as gbOffers from "./offers/gb-offers";
import * as usOffers from "./offers/us-offers";

vi.mock("./offers/ch-offers");
vi.mock("./offers/de-offers");
vi.mock("./offers/fr-offers");
vi.mock("./offers/ro-offers");
vi.mock("./offers/gb-offers");
vi.mock("./offers/us-offers");

const mockCountryPriceMultipliers = {
  CH: 1.15,
  DE: 1.0,
  FR: 1.02,
  RO: 4.98,
  GB: 0.85,
  US: 1.05,
};

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockCountryPriceMultipliers),
  } as Response)
);

describe("API Aggregator", () => {
  beforeEach(() => {
    vi.spyOn(chOffers, "getChOffers").mockResolvedValue([]);
    vi.spyOn(deOffers, "getDeOffers").mockResolvedValue([]);
    vi.spyOn(frOffers, "getFrOffers").mockResolvedValue([]);
    vi.spyOn(roOffers, "getRoOffers").mockResolvedValue([]);
    vi.spyOn(gbOffers, "getGbOffers").mockResolvedValue([]);
    vi.spyOn(usOffers, "getUsOffers").mockResolvedValue([]);
    delete process.env.ALLOW_DEMO_DEFAULT_OFFERS;
  });

  it("does not serve hardcoded demo catalog for any country", async () => {
    for (const countryCode of ["CH", "DE", "FR", "RO", "GB", "US"] as const) {
      const products = await fetchProductsForLocation({
        latitude: 0,
        longitude: 0,
        countryCode,
        countryName: countryCode,
        city: "Test",
        isGps: false,
      });
      expect(products, countryCode).toEqual([]);
    }
    expect(chOffers.getChOffers).not.toHaveBeenCalled();
    expect(deOffers.getDeOffers).not.toHaveBeenCalled();
  });

  it("does not invent default demo offers unless explicitly allowed", async () => {
    const mockProduct = {
      id: "test-product",
      basePrice: 100,
      targetCountries: ["DE"],
    } as any;
    const mockUserLocation: UserLocation = {
      latitude: 52.52,
      longitude: 13.405,
      countryCode: "DE",
      countryName: "Germany",
      city: "Berlin",
      isGps: false,
    };

    const offers = await generateOffersForLocation(mockProduct, mockUserLocation);
    expect(offers).toEqual([]);
    expect(deOffers.getDeOffers).toHaveBeenCalled();
  });

  it("uses country price multipliers when a loader returns offers", async () => {
    const mockProduct = {
      id: "test-product",
      basePrice: 100,
      targetCountries: ["DE"],
    } as any;
    const mockUserLocation: UserLocation = {
      latitude: 52.52,
      longitude: 13.405,
      countryCode: "DE",
      countryName: "Germany",
      city: "Berlin",
      isGps: false,
    };

    vi.spyOn(deOffers, "getDeOffers").mockResolvedValueOnce([
      {
        id: "offer-de-dynamic",
        storeName: "Dynamic Mock Store DE",
        price: 0,
        currency: "EUR",
        inStock: true,
        deliveryCost: 0,
        purchaseUrl: "http://mock.de/dynamic",
        affiliateNetwork: "Mock Network",
        source: "production-live",
        type: "online",
        deliveryTime: "1-2 days",
      },
    ]);

    const offers = await generateOffersForLocation(mockProduct, mockUserLocation);
    expect(offers[0].price).toBe(100);
    expect(deOffers.getDeOffers).toHaveBeenCalled();
  });
});
