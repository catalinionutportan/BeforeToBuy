import { DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";
import type { SiteLocale } from "@/lib/i18n/locales";
import type { CountryCode } from "@/types";

/** Markets with a real catalogue — prefetch so GB→CH is not a cold 7–8s wait. */
export const PREFETCH_BROWSE_MARKETS: CountryCode[] = ["CH", "RO", "GB", "US"];

export function prefetchBrowseCatalog(countryCode: CountryCode, locale: SiteLocale): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams({
    country: countryCode,
    locale,
    limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
    offset: "0",
  });
  void fetch(`/api/products?${params.toString()}`);
}

export function prefetchOtherBrowseMarkets(
  currentCountry: CountryCode,
  locale: SiteLocale
): void {
  for (const countryCode of PREFETCH_BROWSE_MARKETS) {
    if (countryCode === currentCountry) continue;
    prefetchBrowseCatalog(countryCode, locale);
  }
}
