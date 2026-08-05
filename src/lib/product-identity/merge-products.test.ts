import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@/types";
import { extractVariantKey } from "./variant-key";
import {
  mergeFeedAndDemoProducts,
  mergeFeedProductsByIdentity,
} from "./merge-products";

function sampleFeedProduct(input: {
  id: string;
  gtin?: string;
  title: string;
  brand: string;
  storeName: string;
  feedMerchantId: string;
  price?: number;
}): Product {
  return {
    id: input.id,
    title: input.title,
    description: input.title,
    gtin: input.gtin,
    brand: input.brand,
    category: "mobile-smartphones",
    image: "https://example.com/image.jpg",
    targetCountries: ["CH"],
    catalogSource: "sample",
    offers: [
      {
        id: `${input.feedMerchantId}-${input.id}`,
        storeName: input.storeName,
        price: input.price ?? 999,
        currency: "CHF",
        inStock: true,
        deliveryTime: "1-2 days",
        deliveryCost: 0,
        purchaseUrl: "https://example.com",
        affiliateNetwork: "Test",
        type: "online",
        source: "sample",
        feedMerchantId: input.feedMerchantId,
      },
    ],
  };
}

test("extractVariantKey separates storage and color", () => {
  const keyA = extractVariantKey("Samsung Galaxy S24 Ultra 256GB Titanium Gray");
  const keyB = extractVariantKey("Samsung Galaxy S24 Ultra 512GB Titanium Black");
  assert.notEqual(keyA, keyB);
});

test("mergeFeedProductsByIdentity merges same GTIN across merchants", () => {
  const feedProducts = [
    sampleFeedProduct({
      id: "feed-brack",
      gtin: "7612345678901",
      title: "Apple MacBook Air 13 M3 256GB Midnight",
      brand: "Apple",
      storeName: "Brack.ch",
      feedMerchantId: "ch-brack",
      price: 1049,
    }),
    sampleFeedProduct({
      id: "feed-digitec",
      gtin: "7612345678901",
      title: "Apple MacBook Air 13 M3 256GB Midnight",
      brand: "Apple",
      storeName: "Digitec.ch",
      feedMerchantId: "ch-digitec",
      price: 1049,
    }),
  ];

  const merged = mergeFeedProductsByIdentity(feedProducts);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]?.offers.length, 2);
  assert.equal(merged[0]?.gtin, "07612345678901");
});

test("mergeFeedAndDemoProducts links demo catalog via GTIN map", () => {
  const demoProducts: Product[] = [
    {
      id: "prod-macbook-air-m3",
      title: "Apple MacBook Air 13 M3 256GB Midnight",
      description: "Demo laptop",
      brand: "Apple",
      category: "laptops-notebooks",
      image: "https://example.com/macbook.jpg",
      targetCountries: ["CH"],
      offers: [
        {
          id: "demo-amazon",
          storeName: "Amazon.de",
          price: 1099,
          currency: "EUR",
          inStock: true,
          deliveryTime: "2-3 days",
          deliveryCost: 0,
          purchaseUrl: "https://example.com",
          affiliateNetwork: "Amazon",
          type: "cross_border",
          source: "demo",
        },
      ],
    },
  ];

  const feedProducts = [
    sampleFeedProduct({
      id: "feed-brack",
      gtin: "7612345678901",
      title: "Apple MacBook Air 13 M3 256GB Midnight",
      brand: "Apple",
      storeName: "Brack.ch",
      feedMerchantId: "ch-brack",
    }),
  ];

  const merged = mergeFeedAndDemoProducts(demoProducts, feedProducts);
  const macbook = merged.find((product) => product.id === "prod-macbook-air-m3");
  assert.ok(macbook);
  assert.equal(macbook?.gtin, "07612345678901");
  assert.ok(macbook?.offers.some((offer) => offer.storeName === "Brack.ch"));
  assert.ok(macbook?.offers.some((offer) => offer.storeName === "Amazon.de"));
});

test("mergeFeedAndDemoProducts keeps different variants separate", () => {
  const demoProducts: Product[] = [
    {
      id: "prod-samsung-s24-ultra",
      title: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
      description: "Demo phone",
      brand: "Samsung",
      category: "mobile-smartphones",
      image: "https://example.com/s24.jpg",
      targetCountries: ["CH"],
      offers: [],
    },
  ];

  const feedProducts = [
    sampleFeedProduct({
      id: "feed-galaxus",
      gtin: "7612345678912",
      title: "Samsung Galaxy S24 Ultra 256GB Titanium Gray",
      brand: "Samsung",
      storeName: "Galaxus.ch",
      feedMerchantId: "ch-galaxus",
    }),
  ];

  const merged = mergeFeedAndDemoProducts(demoProducts, feedProducts);
  assert.equal(merged.length, 2);
});
