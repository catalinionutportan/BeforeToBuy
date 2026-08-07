import { describe, expect, it } from "vitest";
import { inferCountryFromProductId } from "@/lib/product-lookup";
import { productPagePathWithReturn, safeReturnPath } from "@/lib/seo/site-url";

describe("product lookup helpers", () => {
  it("infers RO from Scule365 feed ids", () => {
    expect(inferCountryFromProductId("feed-ro-scule365-1a8fb3a3e")).toBe("RO");
    expect(inferCountryFromProductId("feed-ro-rowenta-abc")).toBe("RO");
    expect(inferCountryFromProductId("feed-ch-brack-1")).toBe("CH");
  });

  it("keeps browse return path on product links", () => {
    expect(
      productPagePathWithReturn("feed-ro-scule365-1", "/?category=hub-diy")
    ).toBe("/p/feed-ro-scule365-1?from=%2F%3Fcategory%3Dhub-diy");
  });

  it("rejects unsafe return paths", () => {
    expect(safeReturnPath("https://evil.test", "/")).toBe("/");
    expect(safeReturnPath("//evil.test", "/")).toBe("/");
    expect(safeReturnPath("/?category=hub-diy", "/")).toBe("/?category=hub-diy");
  });
});
