import { roundMoney } from "@/lib/pricing/total-price";

/** Free delivery only when cost is explicitly reported as 0 or less — null/undefined means unknown. */
export function isExplicitFreeDelivery(deliveryCost: number | null | undefined): boolean {
  return deliveryCost != null && deliveryCost <= 0;
}

/** CSV columns that carry a monetary delivery/shipping cost (never generic `delivery` / `shipping`). */
export const MONETARY_DELIVERY_COST_COLUMNS = [
  "delivery_cost",
  "shipping_cost",
  /** Google Merchant `<g:shipping><g:price>` mapped at import time */
  "shipping_price",
  "delivery_price",
] as const;

const FREE_DELIVERY_COST_PATTERN = /^(free|gratis|gratuit|0(?:[.,]0+)?)$/i;

/** True when the cell looks like a delivery-time phrase, not a price. */
export function looksLikeDeliveryTime(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (/\d+\s*-\s*\d+/.test(lower)) return true;
  if (/\b(days?|zile|lucratoare|working|weeks?|ore|hours?)\b/.test(lower)) return true;
  if (/\bdelivery\s+in\b/.test(lower)) return true;
  if (/\bin\s+\d+\s+(days?|zile)\b/.test(lower)) return true;
  return false;
}

export function parseOptionalDeliveryCost(raw: string | undefined | null): number | undefined {
  if (raw == null) return undefined;
  const trimmed = String(raw).trim();
  if (!trimmed) return undefined;

  if (FREE_DELIVERY_COST_PATTERN.test(trimmed.replace(/\s+/g, " "))) {
    return 0;
  }

  if (looksLikeDeliveryTime(trimmed)) {
    return undefined;
  }

  const normalized = trimmed.replace(",", ".");
  if (/[^\d.\-+]/.test(normalized.replace(/\s/g, ""))) {
    return undefined;
  }

  const amount = Number.parseFloat(normalized.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(amount)) return undefined;
  return amount;
}

export function parseOptionalDeliveryTime(raw: string | undefined | null): string | undefined {
  const trimmed = raw?.trim();
  return trimmed ? trimmed.slice(0, 48) : undefined;
}

function firstMonetaryDeliveryCostRaw(
  row: Record<string, string | undefined>
): string | undefined {
  for (const column of MONETARY_DELIVERY_COST_COLUMNS) {
    const value = row[column]?.trim();
    if (value) return value;
  }
  return undefined;
}

function firstDeliveryTimeRaw(row: Record<string, string | undefined>): string | undefined {
  const explicit =
    row.delivery_time?.trim() ||
    row.delivery_time_days?.trim() ||
    row.shipping_time?.trim();
  if (explicit) return explicit.slice(0, 48);

  const generic = row.delivery?.trim() || row.shipping?.trim();
  if (generic && looksLikeDeliveryTime(generic)) return generic.slice(0, 48);
  return undefined;
}

export type ParsedRowDelivery = {
  deliveryCost?: number;
  deliveryTime?: string;
  totalPrice?: number;
};

/** Derive persisted delivery fields from a CSV row when the feed supplies them. */
export function deriveRowDeliveryFields(
  row: Record<string, string | undefined>,
  price: number
): ParsedRowDelivery {
  const deliveryCost = parseOptionalDeliveryCost(firstMonetaryDeliveryCostRaw(row));
  const deliveryTime = firstDeliveryTimeRaw(row);

  const result: ParsedRowDelivery = {};
  if (deliveryCost !== undefined) {
    result.deliveryCost = deliveryCost;
    result.totalPrice = roundMoney(price + deliveryCost);
  }
  if (deliveryTime) result.deliveryTime = deliveryTime;
  return result;
}
