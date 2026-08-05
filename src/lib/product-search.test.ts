import { describe, it, expect } from 'vitest';
import { productMatchesSearchQuery } from './product-search';

const product = {
  title: "Sony WH-1000XM5",
  brand: "Sony",
  description: "Wireless headphones",
  gtin: "00045487361453",
};

describe('Product Search', () => {
  it("search matches title brand description and GTIN digits", () => {
    expect(productMatchesSearchQuery(product, "wh-1000")).toBe(true);
    expect(productMatchesSearchQuery(product, "sony")).toBe(true);
    expect(productMatchesSearchQuery(product, "45487361453")).toBe(true);
    expect(productMatchesSearchQuery(product, "00045487361453")).toBe(true);
    expect(productMatchesSearchQuery(product, "bosch")).toBe(false);
  });
});