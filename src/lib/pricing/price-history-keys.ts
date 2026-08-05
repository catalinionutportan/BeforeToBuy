import type { OfferSource } from "@/types";

export interface PriceHistoryPoint {
  price: number;
  totalPrice: number;
  recordedAt: string;
  source: OfferSource;
}

export const MAX_PRICE_HISTORY_POINTS = 48;

export function buildPriceHistoryKey(
  product: { canonicalKey?: string; id: string },
  offer: {
    id: string;
    storeName: string;
    type: string;
    feedMerchantId?: string;
  }
): string {
  const productKey = product.canonicalKey || product.id;
  const offerKey = `${offer.feedMerchantId || offer.storeName}:${offer.type}:${offer.id}`;
  return `${productKey}:${offerKey}`;
}

export function encodePriceHistoryKvKey(historyKey: string): string {
  return `ph:v1:${Buffer.from(historyKey, "utf8").toString("base64url")}`;
}

export const PRICE_HISTORY_INDEX_KEY = "ph:v1:index";
export const PRICE_HISTORY_META_KEY = "ph:v1:meta";
