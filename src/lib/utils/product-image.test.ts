import { describe, expect, it } from "vitest";
import {
  shouldBypassImageOptimization,
  shouldUseNativeProductImage,
} from "@/lib/utils/product-image";

describe("shouldBypassImageOptimization", () => {
  it("flags hosts outside the optimizer allowlist for native rendering", () => {
    expect(
      shouldBypassImageOptimization(
        "https://static2.evomag.ro/img?extend=white&file=products%2F74%2F74187%2FCC-HDMI4-6.jpg&type=auto&width=500&sign=abc"
      )
    ).toBe(true);
    expect(
      shouldUseNativeProductImage(
        "https://www.soundhouse.ro/uploads/galleries/2022/12/15/photo.jpg"
      )
    ).toBe(true);
  });

  it("keeps optimization for whitelisted merchant images", () => {
    expect(
      shouldBypassImageOptimization(
        "https://www.rowenta.ro/media/catalog/product/a/s/aspirator.jpg"
      )
    ).toBe(false);
    expect(
      shouldUseNativeProductImage(
        "https://www.rowenta.ro/media/catalog/product/a/s/aspirator.jpg"
      )
    ).toBe(false);
  });
});
