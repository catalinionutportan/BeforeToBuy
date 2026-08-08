import { describe, expect, it } from "vitest";
import { sortProductsForBrowse } from "@/lib/browse-product-order";
import type { Product } from "@/types";

function product(id: string, rawCategory: string): Product {
  return {
    id,
    title: id,
    brand: "Test",
    image: "https://example.com/x.jpg",
    category: "notebooks-laptops",
    description: id,
    categoryAssignment: {
      method: "merchant-exact",
      confidence: 0.98,
      rawCategory,
    },
    offers: [],
    targetCountries: ["RO"],
  };
}

describe("sortProductsForBrowse", () => {
  it("puts laptop bags after real notebooks", () => {
    const sorted = sortProductsForBrowse([
      product("bag", "Genti si Huse laptop"),
      product("laptop", "Laptopuri / Notebook"),
      product("battery", "Baterii si Acumulatori Laptop"),
    ]);
    expect(sorted.map((p) => p.id)).toEqual(["laptop", "bag", "battery"]);
  });
});
