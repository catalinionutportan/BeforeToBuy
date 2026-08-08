import type { Product } from "@/types";

/**
 * Soft-cap sampling for huge catalogues (evoMAG ~100k).
 *
 * Plain round-robin across 500+ aisles starves high-intent categories
 * (e.g. Telefoane ≈717 → only ~8 in a 4k slice). Prefer weighted quotas:
 * priority aisles get a floor + higher share; noisy accessory aisles are capped.
 */

type AisleQuotaRule = {
  /** Match against normalized raw merchant category */
  match: RegExp;
  /** Relative weight vs normal aisles (default weight = 1) */
  weight: number;
  /** Minimum products to keep when the aisle has that many */
  min: number;
  /** Hard ceiling so giant accessory aisles cannot dominate */
  max: number;
};

const DEFAULT_AISLE_MAX = 40;

/** Shopper-facing aisles that must stay visible under the soft cap. */
const PRIORITY_AISLE_RULES: AisleQuotaRule[] = [
  // Take essentially the full handset aisle (~717 in live My Feeds CSV).
  { match: /^telefoane$/i, weight: 20, min: 700, max: 900 },
  { match: /^telefoane seniori$/i, weight: 3, min: 12, max: 24 },
  { match: /^tablete$/i, weight: 8, min: 80, max: 140 },
  { match: /^laptopuri/i, weight: 10, min: 160, max: 240 },
  { match: /^televizoare/i, weight: 8, min: 80, max: 140 },
  { match: /^smartwatch$/i, weight: 5, min: 40, max: 80 },
  { match: /^monitoare led/i, weight: 5, min: 40, max: 80 },
  { match: /^aspiratoare/i, weight: 4, min: 30, max: 70 },
  { match: /^masini de spalat/i, weight: 4, min: 24, max: 60 },
  { match: /^aparate de aer conditionat/i, weight: 4, min: 24, max: 60 },
  { match: /^frigidere/i, weight: 4, min: 24, max: 60 },
  { match: /^jocuri video/i, weight: 3, min: 20, max: 50 },
  { match: /^controllere/i, weight: 2, min: 12, max: 40 },
  // Accessories stay present but cannot crowd out handsets.
  { match: /^huse telefoane/i, weight: 1, min: 16, max: 48 },
  { match: /^folii protectie telefoane/i, weight: 1, min: 12, max: 40 },
  { match: /^incarcatoare$/i, weight: 1, min: 12, max: 40 },
];

function normalizeAisle(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function aisleKey(product: Product): string {
  return (
    normalizeAisle(product.categoryAssignment?.rawCategory || "") ||
    product.category ||
    "unknown"
  );
}

function ruleForAisle(aisle: string): AisleQuotaRule | null {
  for (const rule of PRIORITY_AISLE_RULES) {
    if (rule.match.test(aisle)) return rule;
  }
  return null;
}

function quotaForBucket(aisle: string, size: number, cap: number, totalProducts: number): number {
  const rule = ruleForAisle(aisle);
  const weight = rule?.weight ?? 1;
  const min = rule?.min ?? 4;
  const max = rule?.max ?? DEFAULT_AISLE_MAX;

  // Base proportional share, scaled by aisle weight.
  const proportional = Math.round((size / Math.max(totalProducts, 1)) * cap * weight);
  const target = Math.max(min, proportional);
  return Math.min(size, max, target, cap);
}

/**
 * Select up to `cap` products with weighted aisle quotas.
 * Exported for unit tests.
 */
export function diversifyProductCap(products: Product[], cap: number): Product[] {
  if (products.length <= cap) return products;

  const buckets = new Map<string, Product[]>();
  for (const product of products) {
    const key = aisleKey(product);
    const list = buckets.get(key);
    if (list) list.push(product);
    else buckets.set(key, [product]);
  }

  const totalProducts = products.length;
  const quotas = new Map<string, number>();
  let quotaSum = 0;
  for (const [aisle, list] of buckets) {
    const q = quotaForBucket(aisle, list.length, cap, totalProducts);
    quotas.set(aisle, q);
    quotaSum += q;
  }

  // Scale down if mins/weights overshoot the soft cap (priority aisles first).
  if (quotaSum > cap) {
    const entries = [...quotas.entries()].sort((a, b) => {
      const wa = ruleForAisle(a[0])?.weight ?? 1;
      const wb = ruleForAisle(b[0])?.weight ?? 1;
      return wa - wb; // reduce low-priority first
    });
    let overflow = quotaSum - cap;
    for (const [aisle, q] of entries) {
      if (overflow <= 0) break;
      const rule = ruleForAisle(aisle);
      const floor = Math.min(rule?.min ?? 2, q);
      const reducible = Math.max(0, q - floor);
      const cut = Math.min(reducible, overflow);
      quotas.set(aisle, q - cut);
      overflow -= cut;
    }
  }

  const selected: Product[] = [];
  const remainders: Product[] = [];

  for (const [aisle, list] of buckets) {
    const take = quotas.get(aisle) ?? 0;
    if (take > 0) selected.push(...list.slice(0, take));
    if (list.length > take) remainders.push(...list.slice(take));
  }

  // Fill any leftover slots round-robin from leftovers (keeps long-tail aisles).
  if (selected.length < cap && remainders.length > 0) {
    const need = cap - selected.length;
    selected.push(...remainders.slice(0, need));
  }

  return selected.slice(0, cap);
}
