import type { CategoryMappingResult } from "@/lib/category-mapper";
import { UNMAPPED_CATEGORY_ID } from "@/lib/categories";

export interface MappingLogEntry {
  productId: string;
  merchantId: string;
  title: string;
  rawCategory?: string;
  categoryId: string;
  method: CategoryMappingResult["method"];
  confidence: number;
  mappedAt: string;
}

export interface MappingReportSummary {
  total: number;
  mapped: number;
  unmapped: number;
  belowThreshold: number;
  byMethod: Record<string, number>;
  byMerchant: Record<
    string,
    {
      total: number;
      mapped: number;
      unmapped: number;
      belowThreshold: number;
    }
  >;
}

export interface MappingReport {
  summary: MappingReportSummary;
  reviewQueue: MappingLogEntry[];
  generatedAt: string;
}

function isReviewRequired(entry: MappingLogEntry): boolean {
  return (
    entry.categoryId === UNMAPPED_CATEGORY_ID ||
    entry.method === "below-threshold" ||
    entry.method === "unmapped"
  );
}

export function buildMappingReport(entries: MappingLogEntry[]): MappingReport {
  const summary: MappingReportSummary = {
    total: entries.length,
    mapped: 0,
    unmapped: 0,
    belowThreshold: 0,
    byMethod: {},
    byMerchant: {},
  };

  for (const entry of entries) {
    summary.byMethod[entry.method] = (summary.byMethod[entry.method] ?? 0) + 1;

    if (!summary.byMerchant[entry.merchantId]) {
      summary.byMerchant[entry.merchantId] = {
        total: 0,
        mapped: 0,
        unmapped: 0,
        belowThreshold: 0,
      };
    }

    const merchantStats = summary.byMerchant[entry.merchantId];
    merchantStats.total += 1;

    if (entry.method === "below-threshold") {
      summary.belowThreshold += 1;
      merchantStats.belowThreshold += 1;
    } else if (entry.categoryId === UNMAPPED_CATEGORY_ID || entry.method === "unmapped") {
      summary.unmapped += 1;
      merchantStats.unmapped += 1;
    } else {
      summary.mapped += 1;
      merchantStats.mapped += 1;
    }
  }

  return {
    summary,
    reviewQueue: entries.filter(isReviewRequired),
    generatedAt: new Date().toISOString(),
  };
}

export function createMappingLogEntry(input: {
  productId: string;
  merchantId: string;
  title: string;
  rawCategory?: string;
  mapping: CategoryMappingResult;
}): MappingLogEntry {
  return {
    productId: input.productId,
    merchantId: input.merchantId,
    title: input.title,
    rawCategory: input.rawCategory,
    categoryId: input.mapping.categoryId,
    method: input.mapping.method,
    confidence: input.mapping.confidence,
    mappedAt: new Date().toISOString(),
  };
}
