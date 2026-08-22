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
const inflightPages = new Map<string, Promise<SessionBrowsePage | null>>();

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
  inflightPages.clear();
}

function browseUrl(countryCode: CountryCode, locale: SiteLocale): string {
  const params = new URLSearchParams({
    country: countryCode,
    locale,
    limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
    offset: "0",
  });
  return `/api/products?${params.toString()}`;
}

/** One in-flight request per market — country switch reuses the homepage prefetch. */
export function ensureBrowseCatalog(
  countryCode: CountryCode,
  locale: SiteLocale
): Promise<SessionBrowsePage | null> {
  const cached = getSessionBrowsePage(countryCode, locale);
  if (cached) return Promise.resolve(cached);
  if (typeof window === "undefined") return Promise.resolve(null);

  const key = sessionKey(countryCode, locale);
  const pending = inflightPages.get(key);
  if (pending) return pending;

  const request = fetch(browseUrl(countryCode, locale))
    .then((response) => (response.ok ? response.json() : null))
    .then((data: SessionBrowsePage | null) => {
      if (!data?.products || !data.meta) return null;
      const page = { products: data.products, meta: data.meta };
      setSessionBrowsePage(countryCode, locale, page);
      return page;
    })
    .catch(() => null)
    .finally(() => {
      inflightPages.delete(key);
    });

  inflightPages.set(key, request);
  return request;
}

export function prefetchBrowseCatalog(countryCode: CountryCode, locale: SiteLocale): void {
  void ensureBrowseCatalog(countryCode, locale);
}

export function prefetchOtherBrowseMarkets(
  currentCountry: CountryCode,
  locale: SiteLocale
): void {
  const queued = PREFETCH_BROWSE_MARKETS.filter((code) => code !== currentCountry).sort(
    (left, right) => Number(right === "CH") - Number(left === "CH")
  );
  for (const countryCode of queued) {
    prefetchBrowseCatalog(countryCode, locale);
  }
}
