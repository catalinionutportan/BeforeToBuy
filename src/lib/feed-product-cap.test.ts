import { describe, expect, it } from "vitest";
import { diversifyProductCap } from "@/lib/feed-product-cap";
import type { Product } from "@/types";

function fakeProduct(id: string, rawCategory: string, category = "unmapped"): Product {
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
    targetCountries: ["RO"],
  };
}

describe("diversifyProductCap", () => {
  it("keeps a large Telefoane share instead of ~8 from flat round-robin", () => {
    const products: Product[] = [];
    for (let i = 0; i < 717; i++) {
      products.push(fakeProduct(`phone-${i}`, "Telefoane", "mobile-smartphones"));
    }
    // Simulate many long-tail aisles that previously stole equal slots.
    for (let a = 0; a < 200; a++) {
      for (let i = 0; i < 20; i++) {
        products.push(fakeProduct(`tail-${a}-${i}`, `Mystery aisle ${a}`));
      }
    }
    for (let i = 0; i < 500; i++) {
      products.push(fakeProduct(`case-${i}`, "Huse Telefoane", "mobile-accessories"));
    }

    const selected = diversifyProductCap(products, 4_000);
    expect(selected.length).toBe(4_000);

    const phones = selected.filter(
      (p) => p.categoryAssignment?.rawCategory === "Telefoane"
    ).length;
    const cases = selected.filter(
      (p) => p.categoryAssignment?.rawCategory === "Huse Telefoane"
    ).length;

    expect(phones).toBeGreaterThanOrEqual(200);
    expect(phones).toBeGreaterThan(cases);
  });
});
