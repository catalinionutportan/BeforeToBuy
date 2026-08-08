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
  walkSubcategories,
} from './categories';
import {
  mapToBeforeToBuyCategory,
  mapToBeforeToBuyCategoryWithMetadata,
} from './category-mapper';
import { getDepartmentLabel, getCollectionLabel, getSubcategoryLabel, localeFromCountry } from './category-i18n';
import { SITE_LOCALES } from './i18n/locales';
import { SUBCATEGORY_LABELS } from './i18n/subcategory-labels';
import {
  ALL_MERCHANT_DOMAINS,
  CH_MERCHANTS_PENDING_APPROVAL,
  DEMO_MERCHANTS_PENDING_APPROVAL,
  MERCHANT_ID_ALIASES,
} from './countries';

const baseProduct = {
  title: "Example product",
  description: "Comparable product",
  brand: "Example",
  category: "audio-headphones",
  offers: [],
};

describe('Category and Collection Logic', () => {
  it("taxonomy v2 has unique stable department and leaf ids", () => {
    expect(SHOPPING_CATEGORIES.length).toBe(12);
    expect(new Set(SHOPPING_CATEGORIES.map((category) => category.id)).size).toBe(12);
    expect(SHOPPING_CATEGORIES.map((category) => category.id)).toEqual([
      "electronics",
      "fashion-lifestyle",
      "appliances",
      "furniture",
      "home-textiles",
      "office-stationery",
      "beverages-alcohol",
      "diy-tools",
      "garden",
      "mobility-sport-outdoor",
      "auto-parts",
      "toys-hobby-rc",
    ]);
    expect(getParentCategoryId("media-books")).toBe("office-stationery");
    expect(resolveCategoryAlias("books-games-media")).toBe("office-stationery");
    expect(getParentCategoryId("vehicle-accessories")).toBe("auto-parts");
    expect(getParentCategoryId("software-os")).toBe("electronics");
    expect(getParentCategoryId("care-shaving-hair-removal")).toBe("appliances");

    const leafIds = SHOPPING_CATEGORIES.flatMap((category) =>
      walkSubcategories(category.subcategories).map((subcategory) => subcategory.id)
    );
    expect(new Set(leafIds).size).toBe(leafIds.length);
    expect(getParentCategoryId("fashion-shoes-sneakers")).toBe("fashion-lifestyle");
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "fashion-shoes-sneakers" },
        "fashion-shoes"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "fashion-shoes-men-sneakers" },
        "fashion-shoes-men"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "fashion-shoes-kids-school" },
        "fashion-shoes"
      )
    ).toBe(true);
    expect(SHOPPING_CATEGORIES.some((category) => category.id === "sale")).toBeFalsy();
    expect(SHOPPING_CATEGORIES.some((category) => category.id === "used")).toBeFalsy();
    expect(SHOPPING_COLLECTIONS.some((collection) => collection.id === "deals")).toBeTruthy();
  });

  it("legacy category ids resolve without changing old links", () => {
    expect(resolveCategoryAlias("notebooks-pcs")).toBe("electronics");
    expect(resolveCategoryAlias("photo-video")).toBe("electronics");
    expect(resolveCategoryAlias("mobile-smartwatch-phone")).toBe("wearables-smartwatch");
    expect(getParentCategoryId("audio-headphones")).toBe("electronics");
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
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "peripherals-webcam" },
        "electronics"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { ...baseProduct, category: "large-fridges-freezers" },
        "appliances"
      )
    ).toBe(true);
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
    expect(getParentCategoryId("care-shaving-hair-removal")).toBe("appliances");
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
    expect(COMPARISON_COLLECTION_FILTERS.length).toBe(3);
    expect(isCollectionFilter("compare-local-pickup")).toBe(false);
    expect(isCollectionFilter("sale")).toBe(true);
    expect(isCollectionFilter("audio-headphones")).toBe(false);
  });

  it("localized labels resolve by country locale", () => {
    expect(localeFromCountry("CH")).toBe("de");
    expect(localeFromCountry("FR")).toBe("fr");
    expect(getDepartmentLabel("electronics", "fr")).toBe("Électronique");
    expect(getDepartmentLabel("appliances", "ro")).toBe("Electrocasnice");
    expect(getCollectionLabel("sale", "ro")).toBe("Oferte & reduceri");
    expect(getSubcategoryLabel("fashion-shoes-women", "ro")).toBe("Pantofi damă");
    expect(getSubcategoryLabel("office-group-books", "it")).toBe("Libreria");
    expect(getSubcategoryLabel("audio-headphones", "fr")).toBe("Casques & écouteurs");
  });

  it("every taxonomy leaf has menu labels in all site locales", () => {
    const ids = SHOPPING_CATEGORIES.flatMap((category) =>
      walkSubcategories(category.subcategories).map((subcategory) => subcategory.id)
    );
    for (const id of ids) {
      const labels = SUBCATEGORY_LABELS[id];
      expect(labels, id).toBeTruthy();
      for (const locale of SITE_LOCALES) {
        expect(labels[locale]?.trim().length, `${id}:${locale}`).toBeGreaterThan(0);
      }
    }
  });

  it("Swiss merchants stay pending approval and off the public registry", () => {
    expect(ALL_MERCHANT_DOMAINS.filter((m) => m.countryCode === "CH")).toHaveLength(0);

    const pendingIds = new Set(CH_MERCHANTS_PENDING_APPROVAL.map((m) => m.id));
    expect(pendingIds.has("ch-microspot")).toBeFalsy();
    expect(pendingIds.has("ch-interdiscount")).toBeTruthy();
    expect(pendingIds.has("ch-fust")).toBeTruthy();
    expect(pendingIds.has("ch-nettoshop")).toBeTruthy();
    expect(pendingIds.has("ch-conrad")).toBeTruthy();
    expect(MERCHANT_ID_ALIASES["ch-microspot"]).toBe("ch-interdiscount");
  });

  it("public registry exposes live RO merchants and Seentat UK affiliate", () => {
    expect(ALL_MERCHANT_DOMAINS.map((m) => m.id).sort()).toEqual([
      "gb-seentat",
      "ro-rowenta",
      "ro-scule365",
    ]);
    expect(
      CH_MERCHANTS_PENDING_APPROVAL.some((merchant) => merchant.domain === "amazon.de")
    ).toBeFalsy();
    expect(
      DEMO_MERCHANTS_PENDING_APPROVAL.some(
        (merchant) => merchant.id === "de-amazon" && merchant.countryCode === "DE"
      )
    ).toBeTruthy();
  });
});