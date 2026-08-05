import type { Product } from "@/types";
import {
  buildProductIdentity,
  offerDedupeKey,
  type ProductIdentity,
} from "@/lib/product-identity/canonical-key";
import { enrichOfferPricing } from "@/lib/pricing/total-price";
import demoGtinMap from "@/data/demo-gtin-map.json";

export interface DemoGtinEntry {
  gtin: string;
  variantKey?: string;
}

function applyIdentity(product: Product, identity: ProductIdentity): Product {
  const id = identity.gtin
    ? `canonical-${identity.gtin}-${identity.variantKey}`
    : product.id;

  return {
    ...product,
    id,
    gtin: identity.gtin,
    variantKey: identity.variantKey,
    canonicalKey: identity.canonicalKey,
    offers: product.offers.map(enrichOfferPricing),
  };
}

export function enrichProductIdentity(product: Product): Product {
  return applyIdentity(
    product,
    buildProductIdentity({
      gtin: product.gtin,
      variantKey: product.variantKey,
      brand: product.brand,
      title: product.title,
    })
  );
}

function mergeOffers(existing: Product, incoming: Product): Product {
  const seen = new Set(existing.offers.map(offerDedupeKey));
  const mergedOffers = [...existing.offers];

  for (const offer of incoming.offers) {
    const key = offerDedupeKey(offer);
    if (seen.has(key)) continue;
    seen.add(key);
    mergedOffers.push(enrichOfferPricing(offer));
  }

  return {
    ...existing,
    title: existing.title.length >= incoming.title.length ? existing.title : incoming.title,
    description:
      existing.description.length >= incoming.description.length
        ? existing.description
        : incoming.description,
    image: existing.image.includes("unsplash.com/photo-152617")
      ? incoming.image
      : existing.image,
    offers: mergedOffers,
    isFlashDeal: existing.isFlashDeal || incoming.isFlashDeal,
    catalogSource:
      existing.catalogSource === incoming.catalogSource
        ? existing.catalogSource
        : "mixed",
  };
}

/** Merge feed rows that share GTIN + variant across merchants. */
export function mergeFeedProductsByIdentity(feedProducts: Product[]): Product[] {
  const groups = new Map<string, Product>();

  for (const rawProduct of feedProducts) {
    const product = enrichProductIdentity(rawProduct);
    const existing = groups.get(product.canonicalKey!);

    if (!existing) {
      groups.set(product.canonicalKey!, product);
      continue;
    }

    groups.set(product.canonicalKey!, mergeOffers(existing, product));
  }

  return Array.from(groups.values());
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleMatchScore(demoTitle: string, feedTitle: string): number {
  const normalizedDemo = normalizeTitle(demoTitle);
  const normalizedFeed = normalizeTitle(feedTitle);

  if (normalizedDemo === normalizedFeed) return 100;

  const demoTokens = new Set(
    normalizedDemo.split(" ").filter((token) => token.length > 2)
  );
  const feedTokens = normalizedFeed.split(" ").filter((token) => token.length > 2);
  if (feedTokens.length === 0) return 0;

  const shared = feedTokens.filter((token) => demoTokens.has(token)).length;
  return Math.round((shared / feedTokens.length) * 100);
}

function markDemoOffers(product: Product): Product {
  return {
    ...product,
    rating: undefined,
    reviewsCount: undefined,
    isFlashDeal: false,
    catalogSource: "demo",
    offers: product.offers.map((offer) => ({
      ...offer,
      source: "demo" as const,
      originalPrice: undefined,
      discountPercentage: undefined,
      promoCode: undefined,
      badge: undefined,
    })),
  };
}

function mergeFeedOffersIntoProduct(demoProduct: Product, feedProduct: Product): Product {
  const feedOffers = feedProduct.offers.filter((offer) => offer.source !== "demo");
  const feedStoreKeys = new Set(
    feedOffers.map((offer) => `${offer.feedMerchantId || offer.storeName}:${offer.type}`)
  );

  const keptDemoOffers = demoProduct.offers
    .filter(
      (offer) => !feedStoreKeys.has(`${offer.feedMerchantId || offer.storeName}:${offer.type}`)
    )
    .map((offer) => ({
      ...offer,
      source: "demo" as const,
      originalPrice: undefined,
      discountPercentage: undefined,
      promoCode: undefined,
      badge: undefined,
    }));

  const mergedOffers = [...feedOffers, ...keptDemoOffers].map(enrichOfferPricing);

  return {
    ...demoProduct,
    gtin: feedProduct.gtin ?? demoProduct.gtin,
    variantKey: feedProduct.variantKey ?? demoProduct.variantKey,
    canonicalKey: feedProduct.canonicalKey ?? demoProduct.canonicalKey,
    rating: undefined,
    reviewsCount: undefined,
    catalogSource: feedOffers.length > 0 ? "mixed" : "demo",
    offers: mergedOffers,
    isFlashDeal:
      feedProduct.offers.some((offer) => offer.source === "production-live") &&
      Boolean(feedProduct.isFlashDeal),
  };
}

function enrichDemoProductIdentity(demoProduct: Product): Product {
  const mapEntry = (demoGtinMap as Record<string, DemoGtinEntry>)[demoProduct.id];
  const enriched = mapEntry
    ? enrichProductIdentity({
        ...demoProduct,
        gtin: mapEntry.gtin,
        variantKey: mapEntry.variantKey,
      })
    : enrichProductIdentity(demoProduct);

  return {
    ...enriched,
    id: demoProduct.id,
  };
}

function findFeedMatchByCanonicalKey(
  demoProduct: Product,
  feedByCanonical: Map<string, Product>
): Product | undefined {
  if (!demoProduct.canonicalKey) return undefined;
  return feedByCanonical.get(demoProduct.canonicalKey);
}

function findSafeFuzzyFeedMatch(
  demoProduct: Product,
  feedProducts: Product[],
  matchedFeedIds: Set<string>
): Product | undefined {
  const candidates: Array<{ product: Product; score: number }> = [];

  for (const feedProduct of feedProducts) {
    if (matchedFeedIds.has(feedProduct.id)) continue;
    if (feedProduct.gtin) continue;
    if (feedProduct.brand.toLowerCase() !== demoProduct.brand.toLowerCase()) continue;

    const score = titleMatchScore(demoProduct.title, feedProduct.title);
    if (score >= 70) {
      candidates.push({ product: feedProduct, score });
    }
  }

  if (candidates.length === 0) return undefined;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0]!;
  const second = candidates[1];

  if (second && best.score - second.score < 10) {
    return undefined;
  }

  return best.product;
}

export function mergeFeedAndDemoProducts(
  demoProducts: Product[],
  feedProducts: Product[]
): Product[] {
  if (feedProducts.length === 0) {
    return demoProducts.map(enrichDemoProductIdentity).map(markDemoOffers);
  }

  const mergedFeedProducts = mergeFeedProductsByIdentity(feedProducts);
  const feedByCanonical = new Map<string, Product>();
  for (const feedProduct of mergedFeedProducts) {
    if (feedProduct.canonicalKey) {
      feedByCanonical.set(feedProduct.canonicalKey, feedProduct);
    }
  }

  const matchedFeedIds = new Set<string>();

  const merged: Product[] = demoProducts.map((rawDemoProduct) => {
    const demoProduct = enrichDemoProductIdentity(rawDemoProduct);
    const canonicalMatch = findFeedMatchByCanonicalKey(demoProduct, feedByCanonical);
    const feedMatch =
      canonicalMatch ??
      findSafeFuzzyFeedMatch(demoProduct, mergedFeedProducts, matchedFeedIds);

    if (!feedMatch) {
      return markDemoOffers(demoProduct);
    }

    matchedFeedIds.add(feedMatch.id);
    return mergeFeedOffersIntoProduct(demoProduct, feedMatch);
  });

  for (const feedProduct of mergedFeedProducts) {
    if (!matchedFeedIds.has(feedProduct.id)) {
      merged.push(feedProduct);
    }
  }

  return merged;
}

export function attachOfferTimestamps(products: Product[], fetchedAt: string): Product[] {
  return products.map((product) => ({
    ...product,
    offers: product.offers.map((offer) =>
      offer.source === "demo" ? offer : { ...offer, fetchedAt }
    ),
  }));
}
