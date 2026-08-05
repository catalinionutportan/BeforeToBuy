import type { PriceHistoryPoint } from "@/lib/pricing/price-history-keys";

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
