import { describe, it, expect } from 'vitest';
import {
  COMPARISON_COLLECTION_FILTERS,
  SHOPPING_CATEGORIES,
  SHOPPING_COLLECTIONS,
  getParentCategoryId,
  isCollectionFilter,
  productMatchesCategoryFilter,
  resolveCategoryAlias,
  UNMAPPED_CATEGORY_ID,
} from './categories';
import {
  mapToBeforeToBuyCategory,
  mapToBeforeToBuyCategoryWithMetadata,
} from './category-mapper';
import { getDepartmentLabel, getCollectionLabel, localeFromCountry } from './category-i18n';
import { ALL_MERCHANT_DOMAINS, MERCHANT_ID_ALIASES } from './countries';

const baseProduct = {
  title: "Example product",
  description: "Comparable product",
  brand: "Example",
  category: "audio-headphones",
  offers: [],
};

describe('Category and Collection Logic', () => {
  it("taxonomy v2 has unique stable department and leaf ids", () => {
    expect(SHOPPING_CATEGORIES.length).toBe(18);
    expect(new Set(SHOPPING_CATEGORIES.map((category) => category.id)).size).toBe(18);

    const leafIds = SHOPPING_CATEGORIES.flatMap((category) =>
      category.subcategories.map((subcategory) => subcategory.id)
    );
    expect(new Set(leafIds).size).toBe(leafIds.length);
    expect(SHOPPING_CATEGORIES.some((category) => category.id === "sale")).toBeFalsy();
    expect(SHOPPING_CATEGORIES.some((category) => category.id === "used")).toBeFalsy();
    expect(SHOPPING_COLLECTIONS.some((collection) => collection.id === "deals")).toBeTruthy();
  });

  it("legacy category ids resolve without changing old links", () => {
    expect(resolveCategoryAlias("notebooks-pcs")).toBe("computers-tablets");
    expect(resolveCategoryAlias("photo-video")).toBe("photo-video-drones-optics");
    expect(resolveCategoryAlias("mobile-smartwatch-phone")).toBe("wearables-smartwatch");
    expect(getParentCategoryId("audio-headphones")).toBe("audio");
  });

  it("parent filters use tree membership instead of id prefixes", () => {
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "peripherals-webcam" },
        "computers-tablets"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "peripherals-webcam" },
        "audio"
      )
    ).toBe(false);
  });

  it("legacy mixed home category remains backward compatible", () => {
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "home-personal-care" },
        "home-kitchen"
      )
    ).toBe(true);
    // Coarse legacy leaves must not collide with the old parent filter id.
    expect(resolveCategoryAlias("home-kitchen")).toBe("kitchen-coffee-machines");
    expect(resolveCategoryAlias("home-appliances")).toBe("cleaning-vacuums");
    expect(getParentCategoryId("care-shaving-hair-removal")).toBe("personal-care-health-baby");
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "care-shaving-hair-removal" },
        "kitchen-coffee-machines"
      )
    ).toBe(false);
  });

  it("deal collection requires verified production discount metadata", () => {
    expect(
      productMatchesCategoryFilter(
        {
          ...baseProduct,
          offers: [{ source: "demo", originalPrice: 200, discountPercentage: 20 }],
        },
        "sale"
      )
    ).toBe(false);
    expect(
      productMatchesCategoryFilter(
        {
          ...baseProduct,
          offers: [{ source: "production-live", originalPrice: 200 }],
        },
        "sale"
      )
    ).toBe(true);
  });

  it("unknown feed products are explicitly unmapped", () => {
    const result = mapToBeforeToBuyCategoryWithMetadata({
      merchantCategory: "Unknown merchant aisle",
      title: "ZXQ item without a recognized product type",
    });

    expect(result.categoryId).toBe(UNMAPPED_CATEGORY_ID);
    expect(result.method).toBe("unmapped");
    expect(result.confidence).toBe(0);
  });

  it("known merchant categories retain deterministic mappings", () => {
    expect(
      mapToBeforeToBuyCategory({
        merchantCategory: "Smartphones",
        title: "Apple iPhone",
      })
    ).toBe("mobile-smartphones");
    expect(
      mapToBeforeToBuyCategory({
        merchantCategory: "Laptops",
        title: "Lenovo ThinkPad notebook",
      })
    ).toBe("notebooks-laptops");
  });

  it("comparison collections stay separate from product taxonomy", () => {
    expect(COMPARISON_COLLECTION_FILTERS.length).toBe(4);
    expect(isCollectionFilter("compare-local-pickup")).toBe(true);
    expect(isCollectionFilter("audio-headphones")).toBe(false);
  });

  it("localized labels resolve by country locale", () => {
    expect(localeFromCountry("CH")).toBe("de");
    expect(localeFromCountry("FR")).toBe("fr");
    expect(getDepartmentLabel("audio", "fr")).toBe("Audio");
    expect(getCollectionLabel("sale", "ro"), "Oferte & reduceri"); // Removed `assert.equal` and added a direct `expect` call
  });

  it("Swiss merchant registry retires Microspot in favor of active retailers", () => {
    const swissMerchantIds = new Set(
      ALL_MERCHANT_DOMAINS.filter((merchant) => merchant.countryCode === "CH").map(
        (merchant) => merchant.id
      )
    );

    expect(swissMerchantIds.has("ch-microspot")).toBeFalsy();
    expect(swissMerchantIds.has("ch-interdiscount")).toBeTruthy();
    expect(swissMerchantIds.has("ch-fust")).toBeTruthy();
    expect(MERCHANT_ID_ALIASES["ch-microspot"]).toBe("ch-interdiscount");
  });

  it("Amazon.de is not listed as a Swiss merchant domain", () => {
    const swissDomains = ALL_MERCHANT_DOMAINS.filter((merchant) => merchant.countryCode === "CH");
    expect(swissDomains.some((merchant) => merchant.id === "ch-amazon-de")).toBeFalsy();
    expect(swissDomains.some((merchant) => merchant.domain === "amazon.de")).toBeFalsy();
    expect(
      ALL_MERCHANT_DOMAINS.some(
        (merchant) => merchant.id === "de-amazon" && merchant.countryCode === "DE"
      )
    ).toBeTruthy();
  });

  it("Swiss registry includes verified Nettoshop and Conrad as planned integrations", () => {
    const swissById = new Map(
      ALL_MERCHANT_DOMAINS.filter((merchant) => merchant.countryCode === "CH").map((merchant) => [
        merchant.id,
        merchant,
      ])
    );

    expect(swissById.get("ch-nettoshop")?.domain).toBe("nettoshop.ch");
    expect(swissById.get("ch-nettoshop")?.status).toBe("Planned Integration");
    expect(swissById.get("ch-conrad")?.domain).toBe("conrad.ch");
    expect(swissById.get("ch-conrad")?.status).toBe("Planned Integration");
    expect(swissById.has("ch-melectronics")).toBeFalsy();
  });
});