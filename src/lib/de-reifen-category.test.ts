import { describe, expect, it } from "vitest";
import type { Product } from "@/types";
import {
  classifyDeReifenProducts,
  hasUsableDeReifenImage,
  looksLikeAtvTyreSize,
  looksLikeMotorcycleTyreSize,
} from "@/lib/de-reifen-category";

function product(id: string, title: string, description: string, category = "auto-tires-wheels"): Product {
  return {
    id,
    title,
    description,
    brand: "Generic",
    category,
    image: "https://example.com/product.jpg",
    catalogSource: "production-live",
    targetCountries: ["DE"],
    offers: [],
  };
}

describe("Reifen.de category refinement", () => {
  it("rejects missing and AWIN no-image placeholders", () => {
    expect(hasUsableDeReifenImage({ image: "" })).toBe(false);
    expect(
      hasUsableDeReifenImage({ image: "https://images2.productserve.com/noimage.gif" })
    ).toBe(false);
    expect(
      hasUsableDeReifenImage({
        image: "https://images2.productserve.com/?w=200&url=ssl%3Aexample.com%2Ftyre.jpg",
      })
    ).toBe(true);
  });

  it("recognizes motorcycle and ATV sizes without stealing passenger 4x4 tyres", () => {
    expect(looksLikeMotorcycleTyreSize("140/80 B18 70H")).toBe(true);
    expect(looksLikeMotorcycleTyreSize("110/90 D13 56P")).toBe(true);
    expect(looksLikeMotorcycleTyreSize("225/45 R17 94Y")).toBe(false);
    expect(looksLikeAtvTyreSize("27x11.00 D14 57M")).toBe(true);
    expect(looksLikeAtvTyreSize("31x10.50 R15 109R")).toBe(false);
  });

  it("includes radial variants of a motorcycle model and preserves rims", () => {
    const classified = classifyDeReifenProducts([
      product("moto-bias", "Angel Scooter", "120/70 D14 55P"),
      product("moto-radial", "Angel Scooter", "130/70 R16 61S"),
      product("car", "AllSeasonContact", "195/50 R15 86H"),
      product("rim", "SUPERTURISMO GT", "", "auto-rims"),
    ]);
    expect(classified.map((item) => item.category)).toEqual([
      "auto-motorcycle-tires",
      "auto-motorcycle-tires",
      "auto-tires-wheels",
      "auto-rims",
    ]);
  });
});
