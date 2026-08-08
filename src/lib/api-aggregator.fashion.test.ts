import { describe, it, expect } from "vitest";
import { fetchProductsForLocation } from "./api-aggregator";

describe("Fashion Aggregator Logic", () => {
  it("hardcoded demo catalog is disabled for CH", async () => {
    const chProducts = await fetchProductsForLocation({
      latitude: 47.3769,
      longitude: 8.5417,
      countryCode: "CH",
      countryName: "Switzerland",
      city: "Zurich",
      isGps: false,
    });

    expect(chProducts).toEqual([]);
  });

  it("hardcoded demo catalog is disabled outside CH (feeds only)", async () => {
    const deProducts = await fetchProductsForLocation({
      latitude: 52.52,
      longitude: 13.405,
      countryCode: "DE",
      countryName: "Germany",
      city: "Berlin",
      isGps: false,
    });

    expect(deProducts).toEqual([]);
    expect(deProducts.some((product) => product.id === "prod-nike-air-max")).toBe(false);
  });
});
