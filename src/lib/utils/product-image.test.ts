import { describe, expect, it } from "vitest";
import {
  shouldBypassImageOptimization,
  shouldUseNativeProductImage,
} from "@/lib/utils/product-image";

describe("shouldBypassImageOptimization", () => {
  it("flags evoMAG CDN hosts for native image rendering", () => {
    expect(
      shouldBypassImageOptimization(
        "https://static2.evomag.ro/img?extend=white&file=products%2F74%2F74187%2FCC-HDMI4-6.jpg&type=auto&width=500&sign=abc"
      )
    ).toBe(true);
    expect(
      shouldUseNativeProductImage(
        "https://static2.evomag.ro/img?extend=white&file=x.jpg&sign=abc"
      )
    ).toBe(true);
  });

  it("keeps optimization for path-based merchant images", () => {
    expect(
      shouldBypassImageOptimization(
        "https://www.rowenta.ro/media/catalog/product/a/s/aspirator.jpg"
      )
    ).toBe(false);
  });
});
