import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPARISON_COLLECTION_FILTERS,
  SHOPPING_CATEGORIES,
  SHOPPING_COLLECTIONS,
  getParentCategoryId,
  isCollectionFilter,
  productMatchesCategoryFilter,
  resolveCategoryAlias,
  UNMAPPED_CATEGORY_ID,
} from "./categories";
import {
  mapToBeforeToBuyCategory,
  mapToBeforeToBuyCategoryWithMetadata,
} from "./category-mapper";
import { getDepartmentLabel, getCollectionLabel, localeFromCountry } from "./category-i18n";
import { ALL_MERCHANT_DOMAINS, MERCHANT_ID_ALIASES } from "./countries";

const baseProduct = {
  title: "Example product",
  description: "Comparable product",
  brand: "Example",
  category: "audio-headphones",
  offers: [],
};

test("taxonomy v2 has unique stable department and leaf ids", () => {
  assert.equal(SHOPPING_CATEGORIES.length, 18);
  assert.equal(new Set(SHOPPING_CATEGORIES.map((category) => category.id)).size, 18);

  const leafIds = SHOPPING_CATEGORIES.flatMap((category) =>
    category.subcategories.map((subcategory) => subcategory.id)
  );
  assert.equal(new Set(leafIds).size, leafIds.length);
  assert.ok(!SHOPPING_CATEGORIES.some((category) => category.id === "sale"));
  assert.ok(!SHOPPING_CATEGORIES.some((category) => category.id === "used"));
  assert.ok(SHOPPING_COLLECTIONS.some((collection) => collection.id === "deals"));
});

test("legacy category ids resolve without changing old links", () => {
  assert.equal(resolveCategoryAlias("notebooks-pcs"), "computers-tablets");
  assert.equal(resolveCategoryAlias("photo-video"), "photo-video-drones-optics");
  assert.equal(resolveCategoryAlias("mobile-smartwatch-phone"), "wearables-smartwatch");
  assert.equal(getParentCategoryId("audio-headphones"), "audio");
});

test("parent filters use tree membership instead of id prefixes", () => {
  assert.equal(
    productMatchesCategoryFilter(
      { ...baseProduct, category: "peripherals-webcam" },
      "computers-tablets"
    ),
    true
  );
  assert.equal(
    productMatchesCategoryFilter(
      { ...baseProduct, category: "peripherals-webcam" },
      "audio"
    ),
    false
  );
});

test("legacy mixed home category remains backward compatible", () => {
  assert.equal(
    productMatchesCategoryFilter(
      { ...baseProduct, category: "home-personal-care" },
      "home-kitchen"
    ),
    true
  );
  // Coarse legacy leaves must not collide with the old parent filter id.
  assert.equal(resolveCategoryAlias("home-kitchen"), "kitchen-coffee-machines");
  assert.equal(resolveCategoryAlias("home-appliances"), "cleaning-vacuums");
  assert.equal(getParentCategoryId("care-shaving-hair-removal"), "personal-care-health-baby");
  assert.equal(
    productMatchesCategoryFilter(
      { ...baseProduct, category: "care-shaving-hair-removal" },
      "kitchen-coffee-machines"
    ),
    false
  );
});

test("deal collection requires verified production discount metadata", () => {
  assert.equal(
    productMatchesCategoryFilter(
      {
        ...baseProduct,
        offers: [{ source: "demo", originalPrice: 200, discountPercentage: 20 }],
      },
      "sale"
    ),
    false
  );
  assert.equal(
    productMatchesCategoryFilter(
      {
        ...baseProduct,
        offers: [{ source: "production-live", originalPrice: 200 }],
      },
      "sale"
    ),
    true
  );
});

test("unknown feed products are explicitly unmapped", () => {
  const result = mapToBeforeToBuyCategoryWithMetadata({
    merchantCategory: "Unknown merchant aisle",
    title: "ZXQ item without a recognized product type",
  });

  assert.equal(result.categoryId, UNMAPPED_CATEGORY_ID);
  assert.equal(result.method, "unmapped");
  assert.equal(result.confidence, 0);
});

test("known merchant categories retain deterministic mappings", () => {
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantCategory: "Smartphones",
      title: "Apple iPhone",
    }),
    "mobile-smartphones"
  );
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantCategory: "Laptops",
      title: "Lenovo ThinkPad notebook",
    }),
    "notebooks-laptops"
  );
});

test("comparison collections stay separate from product taxonomy", () => {
  assert.equal(COMPARISON_COLLECTION_FILTERS.length, 4);
  assert.ok(isCollectionFilter("compare-local-pickup"));
  assert.ok(!isCollectionFilter("audio-headphones"));
});

test("localized labels resolve by country locale", () => {
  assert.equal(localeFromCountry("CH"), "de");
  assert.equal(localeFromCountry("FR"), "fr");
  assert.equal(getDepartmentLabel("audio", "fr"), "Audio");
  assert.equal(getCollectionLabel("sale", "ro"), "Oferte & reduceri");
});

test("Swiss merchant registry retires Microspot in favor of active retailers", () => {
  const swissMerchantIds = new Set(
    ALL_MERCHANT_DOMAINS.filter((merchant) => merchant.countryCode === "CH").map(
      (merchant) => merchant.id
    )
  );

  assert.ok(!swissMerchantIds.has("ch-microspot"));
  assert.ok(swissMerchantIds.has("ch-interdiscount"));
  assert.ok(swissMerchantIds.has("ch-fust"));
  assert.equal(MERCHANT_ID_ALIASES["ch-microspot"], "ch-interdiscount");
});

test("Amazon.de is not listed as a Swiss merchant domain", () => {
  const swissDomains = ALL_MERCHANT_DOMAINS.filter((merchant) => merchant.countryCode === "CH");
  assert.ok(!swissDomains.some((merchant) => merchant.id === "ch-amazon-de"));
  assert.ok(!swissDomains.some((merchant) => merchant.domain === "amazon.de"));
  assert.ok(
    ALL_MERCHANT_DOMAINS.some(
      (merchant) => merchant.id === "de-amazon" && merchant.countryCode === "DE"
    )
  );
});

test("Swiss registry includes verified Nettoshop and Conrad as planned integrations", () => {
  const swissById = new Map(
    ALL_MERCHANT_DOMAINS.filter((merchant) => merchant.countryCode === "CH").map((merchant) => [
      merchant.id,
      merchant,
    ])
  );

  assert.equal(swissById.get("ch-nettoshop")?.domain, "nettoshop.ch");
  assert.equal(swissById.get("ch-nettoshop")?.status, "Planned Integration");
  assert.equal(swissById.get("ch-conrad")?.domain, "conrad.ch");
  assert.equal(swissById.get("ch-conrad")?.status, "Planned Integration");
  assert.ok(!swissById.has("ch-melectronics"));
});
