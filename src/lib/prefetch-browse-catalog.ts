import { DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { SiteLocale } from "@/lib/i18n/locales";
import type { CountryCode, Product } from "@/types";

/** Markets with a real catalogue — keep first pages warm in this tab. */
export const PREFETCH_BROWSE_MARKETS: CountryCode[] = ["CH", "RO", "GB", "US"];

export type SessionBrowsePage = {
  products: Product[];
  meta: ProductFetchMeta;
};

const sessionPages = new Map<string, SessionBrowsePage>();

function sessionKey(countryCode: CountryCode, locale: SiteLocale): string {
  return `${countryCode.toUpperCase()}:${locale}`;
}

export function getSessionBrowsePage(
  countryCode: CountryCode,
  locale: SiteLocale
): SessionBrowsePage | null {
  return sessionPages.get(sessionKey(countryCode, locale)) ?? null;
}

export function setSessionBrowsePage(
  countryCode: CountryCode,
  locale: SiteLocale,
  page: SessionBrowsePage
): void {
  sessionPages.set(sessionKey(countryCode, locale), page);
}

/** Test helper. */
export function resetSessionBrowsePagesForTests(): void {
  sessionPages.clear();
}

export function prefetchBrowseCatalog(countryCode: CountryCode, locale: SiteLocale): void {
  if (typeof window === "undefined") return;
  if (getSessionBrowsePage(countryCode, locale)) return;
  const params = new URLSearchParams({
    country: countryCode,
    locale,
    limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
    offset: "0",
  });
  void fetch(`/api/products?${params.toString()}`)
    .then((response) => (response.ok ? response.json() : null))
    .then((data: SessionBrowsePage | null) => {
      if (!data?.products || !data.meta) return;
      setSessionBrowsePage(countryCode, locale, {
        products: data.products,
        meta: data.meta,
      });
    })
    .catch(() => undefined);
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
