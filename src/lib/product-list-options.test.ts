import { describe, expect, it } from "vitest";
import {
  clampProductListLimit,
  DEFAULT_PRODUCT_LIST_LIMIT,
  MAX_PRODUCT_LIST_LIMIT,
  parseProductListOffset,
} from "@/lib/product-list-options";

describe("product list options", () => {
  it("clamps limit to safe browse bounds", () => {
    expect(clampProductListLimit(undefined, DEFAULT_PRODUCT_LIST_LIMIT)).toBe(
      DEFAULT_PRODUCT_LIST_LIMIT
    );
    expect(clampProductListLimit(12, DEFAULT_PRODUCT_LIST_LIMIT)).toBe(12);
    expect(clampProductListLimit(9999, DEFAULT_PRODUCT_LIST_LIMIT)).toBe(MAX_PRODUCT_LIST_LIMIT);
    expect(clampProductListLimit(0, DEFAULT_PRODUCT_LIST_LIMIT)).toBe(1);
  });

  it("parses non-negative offsets", () => {
    expect(parseProductListOffset(undefined)).toBe(0);
    expect(parseProductListOffset(-3)).toBe(0);
    expect(parseProductListOffset(96.7)).toBe(96);
  });
});
