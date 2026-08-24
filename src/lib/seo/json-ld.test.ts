import { describe, expect, it } from "vitest";
import { brandedTitle } from "@/lib/metadata";
import { buildOrganizationJsonLd, buildProductJsonLd, buildWebSiteJsonLd } from "@/lib/seo/json-ld";
import type { Product } from "@/types";

describe("search identity", () => {
  it("puts BeforeToBuy.com on titles that would otherwise look like a merchant page", () => {
    expect(brandedTitle("17 Fritz 10 0x22 5x112 ET20")).toBe(
      "17 Fritz 10 0x22 5x112 ET20 | BeforeToBuy.com"
    );
    expect(brandedTitle("Before To Buy - Smart Price Comparison")).toBe(
      "Before To Buy - Smart Price Comparison"
    );
  });

  it("ties Organization and WebSite schema to the BeforeToBuy domain", () => {
    const org = buildOrganizationJsonLd();
    const site = buildWebSiteJsonLd();
    expect(org.url).toContain("beforetobuy.com");
    expect(org.logo.url).toContain("beforetobuy-logo.png");
    expect(org.sameAs).toEqual(expect.arrayContaining(["https://portanx.com"]));
    expect(site.publisher).toEqual({ "@id": org["@id"] });
    expect(site.url).toBe(org.url);
  });

  it("marks product pages as published by BeforeToBuy, not only the merchant", () => {
    const product = {
      id: "rim-1",
      title: "17 Fritz 10 0x22",
      description: "",
      brand: "Carmani",
      category: "auto-complete-wheels",
      image: "https://www.reifen.com/rim.png",
      catalogSource: "production-live",
      targetCountries: ["CH"],
      offers: [
        {
          id: "o1",
          storeName: "Reifen.com CH",
          price: 309,
          currency: "CHF",
          inStock: true,
          purchaseUrl: "https://www.awin1.com/pclick.php?p=1",
          source: "production-live",
        },
      ],
    } as Product;
    const jsonLd = buildProductJsonLd(product, { countryCode: "CH" });
    expect(jsonLd.publisher["@id"]).toContain("#organization");
    expect(jsonLd.mainEntityOfPage.name).toContain("BeforeToBuy.com");
    expect(jsonLd.description).toContain("BeforeToBuy.com");
  });
});
