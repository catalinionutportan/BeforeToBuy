import assert from "node:assert/strict";
import test from "node:test";
import {
  mapToBeforeToBuyCategory,
  mapToBeforeToBuyCategoryWithMetadata,
  MIN_MAPPING_CONFIDENCE,
} from "./category-mapper";
import { UNMAPPED_CATEGORY_ID } from "./categories";
import {
  MAPPING_MERCHANT_IDS,
  validateMerchantCategoryRules,
} from "./merchant-category-rules";
import { buildMappingReport } from "./mapping-log";

const BRACK_SAMPLE_ROWS = [
  {
    merchantCategory: "Smartphones",
    title: "Apple iPhone 16 Pro 256GB Natural Titanium",
    expected: "mobile-smartphones",
    method: "merchant-exact",
  },
  {
    merchantCategory: "Laptops",
    title: "Apple MacBook Air 13 M3 256GB Midnight",
    expected: "notebooks-laptops",
    method: "merchant-exact",
  },
  {
    merchantCategory: "Headphones",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    expected: "audio-headphones",
    method: "merchant-exact",
  },
  {
    merchantCategory: "Computer Accessories",
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    expected: "peripherals-accessories",
    method: "merchant-exact",
  },
] as const;

test("merchant category rules validate without conflicts", () => {
  assert.deepEqual(validateMerchantCategoryRules(), []);
  assert.equal(MAPPING_MERCHANT_IDS.length, 6);
});

test("Brack sample feed rows map with merchant-exact rules", () => {
  for (const row of BRACK_SAMPLE_ROWS) {
    const result = mapToBeforeToBuyCategoryWithMetadata({
      merchantId: "ch-brack",
      merchantCategory: row.merchantCategory,
      title: row.title,
    });

    assert.equal(result.categoryId, row.expected, row.merchantCategory);
    assert.equal(result.method, row.method);
    assert.ok(result.confidence >= MIN_MAPPING_CONFIDENCE);
  }
});

test("Digitec merchant categories resolve deterministically", () => {
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantId: "ch-digitec",
      merchantCategory: "Mobile & Smartphones",
      title: "Samsung Galaxy",
    }),
    "mobile-smartphones"
  );
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantId: "ch-digitec",
      merchantCategory: "TV & Home Cinema",
      title: "LG OLED TV",
    }),
    "tv-televisions"
  );
});

test("Galaxus, Interdiscount, Fust and MediaMarkt have dedicated exact maps", () => {
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantId: "ch-galaxus",
      merchantCategory: "Mobile Telephony",
      title: "Phone",
    }),
    "mobile-smartphones"
  );
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantId: "ch-interdiscount",
      merchantCategory: "TV & Audio",
      title: "TV",
    }),
    "tv-televisions"
  );
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantId: "ch-fust",
      merchantCategory: "Large Household Appliances",
      title: "Washer",
    }),
    "large-fridges-freezers"
  );
  assert.equal(
    mapToBeforeToBuyCategory({
      merchantId: "ch-mediamarkt",
      merchantCategory: "Smartphones & Tablets",
      title: "Phone",
    }),
    "mobile-smartphones"
  );
});

test("unknown feed products are explicitly unmapped", () => {
  const result = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: "ch-brack",
    merchantCategory: "Unknown merchant aisle",
    title: "ZXQ item without a recognized product type",
  });

  assert.equal(result.categoryId, UNMAPPED_CATEGORY_ID);
  assert.equal(result.method, "unmapped");
  assert.equal(result.confidence, 0);
});

test("low-confidence keyword matches fall below threshold into unmapped", () => {
  const result = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: "ch-brack",
    merchantCategory: "Miscellaneous",
    title: "Generic USB cable accessory",
    description: "A simple cable",
  });

  assert.equal(result.categoryId, UNMAPPED_CATEGORY_ID);
  assert.equal(result.method, "below-threshold");
  assert.ok(result.proposedCategoryId);
  assert.ok(result.confidence < MIN_MAPPING_CONFIDENCE);
});

test("mapping report aggregates review queue for manual checks", () => {
  const mapped = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: "ch-brack",
    merchantCategory: "Smartphones",
    title: "Phone",
  });
  const unmapped = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: "ch-brack",
    merchantCategory: "Mystery aisle",
    title: "Unknown widget",
  });

  const report = buildMappingReport([
    {
      productId: "feed-1",
      merchantId: "ch-brack",
      title: "Phone",
      rawCategory: "Smartphones",
      categoryId: mapped.categoryId,
      method: mapped.method,
      confidence: mapped.confidence,
      mappedAt: new Date().toISOString(),
    },
    {
      productId: "feed-2",
      merchantId: "ch-brack",
      title: "Unknown widget",
      rawCategory: "Mystery aisle",
      categoryId: unmapped.categoryId,
      method: unmapped.method,
      confidence: unmapped.confidence,
      mappedAt: new Date().toISOString(),
    },
  ]);

  assert.equal(report.summary.total, 2);
  assert.equal(report.summary.mapped, 1);
  assert.equal(report.summary.unmapped, 1);
  assert.equal(report.reviewQueue.length, 1);
  assert.equal(report.reviewQueue[0]?.productId, "feed-2");
});

test("legacy global patterns still work without merchant id", () => {
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
