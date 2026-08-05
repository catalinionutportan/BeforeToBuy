import type { Product } from "@/types";
import { computeTotalPrice } from "@/lib/pricing/total-price";
import { buildPriceHistoryKey, type PriceHistoryPoint } from "@/lib/pricing/price-history-keys";
import {
  getPriceHistoryBackend,
  getPriceHistoryStore,
  resetPriceHistoryStoreForTests,
  type PriceHistoryMeta,
} from "@/lib/pricing/price-history-store";
import { getPriceTrend } from "@/lib/pricing/price-trend";

export type { PriceHistoryPoint };
export { getPriceTrend };

export async function recordProductPriceHistory(
  products: Product[],
  recordedAt: string
): Promise<number> {
  const store = getPriceHistoryStore();
  let appendedCount = 0;

  for (const product of products) {
    for (const offer of product.offers) {
      if (offer.source === "demo") continue;

      const appended = await store.appendPoint(buildPriceHistoryKey(product, offer), {
        price: offer.price,
        totalPrice: offer.totalPrice ?? computeTotalPrice(offer),
        recordedAt,
        source: offer.source,
      });

      if (appended) appendedCount += 1;
    }
  }

  return appendedCount;
}

export async function getOfferPriceHistory(
  product: Product,
  offer: Product["offers"][number]
): Promise<PriceHistoryPoint[]> {
  return getPriceHistoryStore().getPoints(buildPriceHistoryKey(product, offer));
}

export async function getPriceHistoryStats(): Promise<PriceHistoryMeta> {
  return getPriceHistoryStore().getMeta();
}

export async function clearPriceHistoryForTests(): Promise<void> {
  resetPriceHistoryStoreForTests();
  await getPriceHistoryStore().clear();
}

export { getPriceHistoryBackend };
