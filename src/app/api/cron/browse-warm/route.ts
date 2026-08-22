import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/internal-api-auth";
import { COUNTRIES } from "@/lib/countries";
import { warmBrowseMetaForCountry } from "@/lib/db-service";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { setCachedFirstBrowsePage } from "@/lib/catalog-browse-cache";
import { PREFETCH_BROWSE_MARKETS } from "@/lib/prefetch-browse-catalog";
import { fetchMergedProductsForLocation } from "@/lib/product-service";
import { BROWSE_LIST_OPTIONS, DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const homeUi = HOME_UI[DEFAULT_LOCALE];

/**
 * Keep first-page CH/RO/GB/US catalogues hot in Redis so country switches
 * do not wait on a cold 86k-row cover scan after the CDN TTL expires.
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: homeUi.unauthorized }, { status: 401 });
  }

  const warmed: string[] = [];
  const failed: string[] = [];

  for (const countryCode of PREFETCH_BROWSE_MARKETS) {
    const country = COUNTRIES[countryCode];
    try {
      const page = await fetchMergedProductsForLocation(
        { countryCode, countryName: country.name },
        undefined,
        undefined,
        DEFAULT_LOCALE,
        { ...BROWSE_LIST_OPTIONS, limit: DEFAULT_PRODUCT_LIST_LIMIT }
      );
      if (page.products.length > 0) {
        await setCachedFirstBrowsePage(countryCode, DEFAULT_PRODUCT_LIST_LIMIT, {
          products: page.products,
          meta: page.meta,
        });
      }
      await warmBrowseMetaForCountry(countryCode);
      warmed.push(countryCode);
    } catch (error) {
      console.error(`[cron/browse-warm] ${countryCode} failed:`, error);
      failed.push(countryCode);
    }
  }

  return NextResponse.json(
    { ok: failed.length === 0, warmed, failed },
    { status: failed.length === 0 ? 200 : 207, headers: { "Cache-Control": "no-store" } }
  );
}
