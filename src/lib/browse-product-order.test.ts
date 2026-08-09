import { describe, expect, it } from "vitest";
import { sortProductsForBrowse } from "@/lib/browse-product-order";
import type { Product } from "@/types";

function product(
  id: string,
  category: string,
  rawCategory = category
): Product {
  return {
    id,
    title: id,
    brand: "Test",
    image: "https://example.com/x.jpg",
    category,
    description: id,
    categoryAssignment: {
      method: "merchant-exact",
      confidence: 0.98,
      rawCategory,
    },
    offers: [],
    targetCountries: ["GB"],
  };
}

describe("sortProductsForBrowse", () => {
  it("puts laptop bags after real notebooks", () => {
    const sorted = sortProductsForBrowse([
      product("bag", "notebooks-laptops", "Genti si Huse laptop"),
      product("laptop", "notebooks-laptops", "Laptopuri / Notebook"),
      product("battery", "notebooks-laptops", "Baterii si Acumulatori Laptop"),
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["laptop", "bag", "battery"]);
  });

  it("orders All browse by market hub then leaf aisle", () => {
    const sorted = sortProductsForBrowse(
      [
        product("dress", "fashion-women-dresses"),
        product("phone", "mobile-smartphones"),
        product("vacuum", "cleaning-vacuums"),
        product("watch", "wearables-smartwatch"),
      ],
      "default",
      { countryCode: "GB" }
    );
    // Electronics hub first (phone, watch), then home (vacuum), then fashion (dress).
    expect(sorted.map((p) => p.id)).toEqual(["phone", "watch", "vacuum", "dress"]);
  });

  it("keeps API order when searching across departments", () => {
    const sorted = sortProductsForBrowse(
      [
        product("dress", "fashion-women-dresses"),
        product("phone", "mobile-smartphones"),
        product("tyre", "diy-power-tools"),
      ],
      "default",
      { countryCode: "GB", preserveApiOrder: true }
    );
    expect(sorted.map((p) => p.id)).toEqual(["dress", "phone", "tyre"]);
  });
});
