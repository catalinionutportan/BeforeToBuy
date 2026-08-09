import { describe, it, expect } from "vitest";
import { fetchProductsForLocation } from "./api-aggregator";

describe("Fashion Aggregator Logic", () => {
  it("hardcoded demo catalog is disabled for CH", async () => {
    const chProducts = await fetchProductsForLocation({
      countryCode: "CH",
      countryName: "Switzerland",
    });

    expect(chProducts).toEqual([]);
  });

  it("hardcoded demo catalog is disabled outside CH (feeds only)", async () => {
    const deProducts = await fetchProductsForLocation({
      countryCode: "DE",
      countryName: "Germany",
    });

    expect(deProducts).toEqual([]);
    expect(deProducts.some((product) => product.id === "prod-nike-air-max")).toBe(false);
  });
});
