import { describe, expect, it } from "vitest";
import {
  canProxyProductImage,
  resolveProductImageSrc,
  shouldBypassImageOptimization,
  shouldUseNativeProductImage,
} from "@/lib/utils/product-image";

const EVO_IMAGE =
  "https://static2.evomag.ro/img?extend=white&file=products%2F74%2F74187%2FCC-HDMI4-6.jpg&type=auto&width=500&sign=abc";

describe("shouldBypassImageOptimization", () => {
  it("flags hosts outside the optimizer allowlist for native rendering", () => {
    expect(
      shouldBypassImageOptimization(
        EVO_IMAGE
      )
    ).toBe(true);
    expect(
      shouldUseNativeProductImage(
        "https://www.soundhouse.ro/uploads/galleries/2022/12/15/photo.jpg"
      )
    ).toBe(true);
  });

  it("routes only signed evoMAG product assets through the internal proxy", () => {
    expect(canProxyProductImage(EVO_IMAGE)).toBe(true);
    expect(resolveProductImageSrc(EVO_IMAGE)).toBe(
      `/api/product-image?src=${encodeURIComponent(EVO_IMAGE)}`
    );
    expect(
      canProxyProductImage("https://static2.evomag.ro/img?file=other/logo.png&sign=abc")
    ).toBe(false);
    expect(resolveProductImageSrc("https://example.com/image.jpg")).toBe(
      "https://example.com/image.jpg"
    );
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
