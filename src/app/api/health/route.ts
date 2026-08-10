import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import {
  getEnabledMerchantFeeds,
  getIntegrationSummary,
  MERCHANT_FEEDS,
} from "@/lib/merchant-integrations";
import { fetchMergedProductsForLocation } from "@/lib/product-service";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import type { CountryCode } from "@/types";
import { LEGAL_DOCUMENT_VERSION, LEGAL_LAST_UPDATED } from "@/lib/legal-config";
import { getPriceHistoryBackend, getPriceHistoryStats } from "@/lib/pricing/price-history";
import { SITE_PHASE } from "@/lib/site-config";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { isInternalApiAuthorized } from "@/lib/internal-api-auth";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const dynamic = "force-dynamic";

async function checkSupabaseCatalogue() {
  if (!process.env.DATABASE_URL?.trim()) {
    return { status: "warn" as const, productCount: 0, message: "DATABASE_URL unset" };
  }
  try {
    const productCount = await prisma.product.count({
      where: { targetCountries: { has: "RO" } },
    });
    return {
      status: productCount > 0 ? ("ok" as const) : ("warn" as const),
      productCount,
    };
  } catch (error) {
    return {
      status: "error" as const,
      productCount: 0,
      message: error instanceof Error ? error.message.slice(0, 180) : homeUi.healthCheckUnknownError,
    };
  }
}

async function checkSampleFeedFiles() {
  const results = await Promise.all(
    MERCHANT_FEEDS.filter((feed) => feed.sampleFile).map(async (feed) => {
      try {
        const filePath = path.join(process.cwd(), "src", "data", feed.sampleFile!);
        const content = await fs.readFile(filePath, "utf8");
        const rows =
          feed.sampleFormat === "json"
            ? (JSON.parse(content) as unknown[]).length
            : feed.sampleFormat === "xml"
              ? (content.match(/<entry\b/gi) || []).length
              : Math.max(0, content.trim().split("\n").filter(Boolean).length - 1);

        return {
          merchantId: feed.merchantId,
          status: rows > 0 ? ("ok" as const) : ("error" as const),
          rows,
        };
      } catch {
        return {
          merchantId: feed.merchantId,
          status: "error" as const,
          rows: 0,
        };
      }
    })
  );

  const okCount = results.filter((item) => item.status === "ok").length;
  return {
    status: okCount === results.length ? ("ok" as const) : ("error" as const),
    merchants: results,
    rows: results.reduce((sum, item) => sum + item.rows, 0),
  };
}

async function checkProductsMerge() {
  try {
    const enabledCountries = [
      ...new Set(getEnabledMerchantFeeds().map((feed) => feed.country)),
    ] as CountryCode[];
    const probeCode = enabledCountries[0] ?? DEFAULT_COUNTRY;
    const country = COUNTRIES[probeCode] || COUNTRIES[DEFAULT_COUNTRY];
    const result = await fetchMergedProductsForLocation({
      countryCode: probeCode,
      countryName: country.name,
    });

    const ok = result.products.length > 0;
    return {
      status: ok ? ("ok" as const) : ("error" as const),
      productCount: result.products.length,
      productionOfferCount: result.meta.productionOfferCount,
      sampleOfferCount: result.meta.sampleOfferCount,
      probedCountry: probeCode,
    };
  } catch (error) {
    return {
      status: "error" as const,
      productCount: 0,
      productionOfferCount: 0,
      sampleOfferCount: 0,
      message: error instanceof Error ? error.message : homeUi.healthCheckUnknownError,
    };
  }
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(`health:${clientIp}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.productApiTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const authorized = isInternalApiAuthorized(request);
  const startedAt = Date.now();

  // Public health: cheap, cacheable, no Supabase/Redis/deep diagnostics.
  if (!authorized) {
    const enabledFeedCount = getEnabledMerchantFeeds().length;
    const integrations = getIntegrationSummary();
    const overallStatus: "healthy" | "degraded" | "unhealthy" =
      integrations.hasProductionFeed && enabledFeedCount > 0
        ? "healthy"
        : "degraded";

    return NextResponse.json(
      {
        status: overallStatus,
        sitePhase: SITE_PHASE,
        legalDocumentVersion: LEGAL_DOCUMENT_VERSION,
        legalLastUpdated: LEGAL_LAST_UPDATED,
        checks: {
          app: { status: "ok" as const },
          feedsConfigured: {
            status: enabledFeedCount > 0 ? ("ok" as const) : ("warn" as const),
            hasProductionFeed: integrations.hasProductionFeed,
          },
        },
        responseMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
        detailLevel: "public" as const,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=45, stale-while-revalidate=30",
        },
      }
    );
  }

  const integrations = getIntegrationSummary();
  const enabledFeedCount = getEnabledMerchantFeeds().length;

  const [sampleFeed, productsMerge, supabaseCatalogue, priceHistoryStats] = await Promise.all([
    checkSampleFeedFiles(),
    checkProductsMerge(),
    checkSupabaseCatalogue(),
    getPriceHistoryStats().catch(() => ({
      trackedOffers: 0,
      totalPoints: 0,
      lastSnapshotAt: undefined,
      backend: getPriceHistoryBackend(),
    })),
  ]);

  const hasError =
    sampleFeed.status === "error" ||
    productsMerge.status === "error" ||
    supabaseCatalogue.status === "error";
  const overallStatus = hasError
    ? "unhealthy"
    : integrations.hasProductionFeed
      ? "healthy"
      : "degraded";

  return NextResponse.json(
    {
      status: overallStatus,
      sitePhase: SITE_PHASE,
      legalDocumentVersion: LEGAL_DOCUMENT_VERSION,
      legalLastUpdated: LEGAL_LAST_UPDATED,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      checks: {
        app: { status: "ok" as const },
        sampleFeed,
        productsMerge,
        supabaseCatalogue,
        integrations: {
          status: integrations.hasProductionFeed ? ("ok" as const) : ("warn" as const),
          feedMerchantIds: integrations.feedMerchantIds,
          productionMerchantIds: integrations.productionMerchantIds,
          hasProductionFeed: integrations.hasProductionFeed,
          sampleFeeds: integrations.sampleFeeds,
          merchants: integrations.merchants,
          enabledFeedCount,
        },
        priceHistory: {
          status: priceHistoryStats.totalPoints > 0 ? ("ok" as const) : ("warn" as const),
          backend: priceHistoryStats.backend ?? getPriceHistoryBackend(),
          trackedOffers: priceHistoryStats.trackedOffers,
          totalPoints: priceHistoryStats.totalPoints,
          lastSnapshotAt: priceHistoryStats.lastSnapshotAt ?? null,
        },
      },
      responseMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      detailLevel: "internal" as const,
    },
    {
      status: hasError ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
