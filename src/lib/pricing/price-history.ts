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
  const appendPromises: Promise<boolean>[] = [];

  for (const product of products) {
    for (const offer of product.offers) {
      if (offer.source === "demo") continue;

      appendPromises.push(
        store.appendPoint(buildPriceHistoryKey(product, offer), {
          price: offer.price,
          totalPrice: offer.totalPrice ?? computeTotalPrice(offer),
          recordedAt,
          source: offer.source,
        })
      );
    }
  }

  const results = await Promise.all(appendPromises);
  const appendedCount = results.filter(Boolean).length;

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
