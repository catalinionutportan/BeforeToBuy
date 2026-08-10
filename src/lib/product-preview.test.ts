import { beforeEach, describe, expect, it } from "vitest";
import { SAFE_IMAGE_FALLBACK } from "@/lib/feed-url-policy";
import {
  clearProductPreview,
  enrichProductPreview,
  getProductPreview,
  readStoredProductPreview,
  saveProductPreview,
} from "@/lib/product-preview";

const STORAGE_KEY = "btb:product-preview";

function basePreview(image?: string) {
  return {
    id: "prod-1",
    title: "Sample",
    brand: "Brand",
    currencySymbol: "€",
    image,
  };
}

describe("product-preview image sanitization", () => {
  beforeEach(() => {
    clearProductPreview();
    sessionStorage.clear();
  });

  it("sanitizes unapproved HTTPS hosts on saveProductPreview", () => {
    saveProductPreview(
      basePreview("https://evil.example/product.jpg")
    );
    expect(getProductPreview()?.image).toBe(SAFE_IMAGE_FALLBACK);
  });

  it("keeps approved HTTPS merchant hosts on saveProductPreview", () => {
    const approved = "https://www.rowenta.ro/media/catalog/product/x.jpg";
    saveProductPreview(basePreview(approved));
    expect(getProductPreview()?.image).toContain("www.rowenta.ro");
  });

  it("sanitizes manipulated sessionStorage previews on read", () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(basePreview("http://evil.example/product.jpg"))
    );
    const preview = readStoredProductPreview();
    expect(preview?.image).toBe(SAFE_IMAGE_FALLBACK);
  });

  it("sanitizes protocol-relative URLs on enrichProductPreview", () => {
    enrichProductPreview({
      ...basePreview("//evil.example/product.jpg"),
    });
    expect(getProductPreview()?.image).toBe(SAFE_IMAGE_FALLBACK);
  });
});
