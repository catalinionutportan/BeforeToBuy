import { describe, expect, it } from "vitest";
import {
  shouldBypassImageOptimization,
  shouldUseNativeProductImage,
} from "@/lib/utils/product-image";

describe("shouldBypassImageOptimization", () => {
  it("flags evoMAG CDN hosts", () => {
    expect(
      shouldBypassImageOptimization(
        "https://static2.evomag.ro/img?extend=white&file=products%2F74%2F74187%2FCC-HDMI4-6.jpg&type=auto&width=500&sign=abc"
      )
    ).toBe(true);
  });

  it("keeps path-based merchant images off the bypass list", () => {
    expect(
      shouldBypassImageOptimization(
        "https://www.rowenta.ro/media/catalog/product/a/s/aspirator.jpg"
      )
    ).toBe(false);
  });
});

describe("shouldUseNativeProductImage", () => {
  it("never forces native img — Next/Image proxy is required for evoMAG CDN", () => {
    expect(
      shouldUseNativeProductImage(
        "https://static2.evomag.ro/img?extend=white&file=x.jpg&sign=abc"
      )
    ).toBe(false);
    expect(
      shouldUseNativeProductImage(
        "https://www.rowenta.ro/media/catalog/product/a/s/aspirator.jpg"
      )
    ).toBe(false);
  });
});
