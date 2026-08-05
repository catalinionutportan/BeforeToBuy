import type { Offer, OfferSource, Product } from "@/types";
import { computeTotalPrice } from "@/lib/pricing/total-price";
import { offerDedupeKey } from "@/lib/product-identity/canonical-key";

export interface PriceHistoryPoint {
  price: number;
  totalPrice: number;
  recordedAt: string;
  source: OfferSource;
}

const MAX_POINTS = 24;
const history = new Map<string, PriceHistoryPoint[]>();

function historyKey(product: Product, offer: Offer): string {
  const productKey = product.canonicalKey || product.id;
  return `${productKey}:${offerDedupeKey(offer)}`;
}

export function recordProductPriceHistory(products: Product[], recordedAt: string): void {
  for (const product of products) {
    for (const offer of product.offers) {
      if (offer.source === "demo") continue;

      const key = historyKey(product, offer);
      const totalPrice = offer.totalPrice ?? computeTotalPrice(offer);
      const points = history.get(key) ?? [];
      const last = points[points.length - 1];

      if (
        last &&
        last.price === offer.price &&
        last.totalPrice === totalPrice &&
        last.source === offer.source
      ) {
        continue;
      }

      points.push({
        price: offer.price,
        totalPrice,
        recordedAt,
        source: offer.source,
      });

      if (points.length > MAX_POINTS) {
        points.splice(0, points.length - MAX_POINTS);
      }

      history.set(key, points);
    }
  }
}

export function getOfferPriceHistory(product: Product, offer: Offer): PriceHistoryPoint[] {
  return [...(history.get(historyKey(product, offer)) ?? [])];
}

export function getPriceTrend(
  points: PriceHistoryPoint[]
): "down" | "up" | "stable" | undefined {
  if (points.length < 2) return undefined;

  const previous = points[points.length - 2]!.totalPrice;
  const current = points[points.length - 1]!.totalPrice;
  const delta = current - previous;

  if (Math.abs(delta) < 0.01) return "stable";
  return delta < 0 ? "down" : "up";
}

export function clearPriceHistoryForTests(): void {
  history.clear();
}

export function getPriceHistoryStats(): { trackedOffers: number; totalPoints: number } {
  let totalPoints = 0;
  for (const points of history.values()) {
    totalPoints += points.length;
  }
  return { trackedOffers: history.size, totalPoints };
}
