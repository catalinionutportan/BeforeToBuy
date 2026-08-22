import { ALL_CATEGORIES_ID } from "@/lib/categories";
import { DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { SiteLocale } from "@/lib/i18n/locales";
import type { CountryCode, Product } from "@/types";

/** Markets with a real catalogue — keep first pages warm in this tab. */
export const PREFETCH_BROWSE_MARKETS: CountryCode[] = ["CH", "RO", "GB", "US"];

/** Homepage listens so the category flyout does not remount the page. */
export const BROWSE_CATEGORY_EVENT = "btb-browse-category";

const STORAGE_PREFIX = "btb-browse-page:v2:";
const STORAGE_TTL_MS = 15 * 60 * 1000;

export type SessionBrowsePage = {
  products: Product[];
  meta: ProductFetchMeta;
};

type PersistedBrowsePage = {
  savedAt: number;
  page: SessionBrowsePage;
};

const sessionPages = new Map<string, SessionBrowsePage>();
const inflightPages = new Map<string, Promise<SessionBrowsePage | null>>();

function sessionCategoryKey(category?: string | null): string {
  const trimmed = category?.trim();
  if (!trimmed || trimmed === ALL_CATEGORIES_ID) return "_all";
  return trimmed;
}

function sessionKey(countryCode: CountryCode, category?: string | null): string {
  return `${countryCode.toUpperCase()}:${sessionCategoryKey(category)}`;
}

function readPersistedPage(key: string): SessionBrowsePage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBrowsePage;
    if (!parsed?.page?.products?.length || !parsed.page.meta) return null;
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    return parsed.page;
  } catch {
    return null;
  }
}

function persistPage(key: string, page: SessionBrowsePage): void {
  if (typeof window === "undefined" || page.products.length === 0) return;
  try {
    const payload: PersistedBrowsePage = { savedAt: Date.now(), page };
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

export function getSessionBrowsePage(
  countryCode: CountryCode,
  _locale?: SiteLocale,
  category?: string | null
): SessionBrowsePage | null {
  const key = sessionKey(countryCode, category);
  const local = sessionPages.get(key);
  if (local) return local;
  const persisted = readPersistedPage(key);
  if (persisted) {
    sessionPages.set(key, persisted);
    return persisted;
  }
  return null;
}

export function setSessionBrowsePage(
  countryCode: CountryCode,
  _locale: SiteLocale,
  page: SessionBrowsePage,
  category?: string | null
): void {
  const key = sessionKey(countryCode, category);
  sessionPages.set(key, page);
  persistPage(key, page);
}

/** Test helper — clear process-local browse cache between cases. */
export function resetSessionBrowsePagesForTests(): void {
  sessionPages.clear();
  inflightPages.clear();
  if (typeof window === "undefined") return;
  const stale: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) stale.push(key);
  }
  for (const key of stale) window.localStorage.removeItem(key);
}

/** Test helper — drop memory so the next read must use localStorage. */
export function clearSessionBrowseMemoryForTests(): void {
  sessionPages.clear();
}

function browseUrl(
  countryCode: CountryCode,
  locale: SiteLocale,
  category?: string | null
): string {
  const params = new URLSearchParams({
    country: countryCode,
    locale,
    limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
    offset: "0",
  });
  const aisle = sessionCategoryKey(category);
  if (aisle !== "_all") params.set("category", aisle);
  return `/api/products?${params.toString()}`;
}

/** One in-flight request per market/aisle — country or category switch reuses it. */
export function ensureBrowseCatalog(
  countryCode: CountryCode,
  locale: SiteLocale,
  category?: string | null
): Promise<SessionBrowsePage | null> {
  const cached = getSessionBrowsePage(countryCode, locale, category);
  if (cached) return Promise.resolve(cached);
  if (typeof window === "undefined") return Promise.resolve(null);

  const key = sessionKey(countryCode, category);
  const pending = inflightPages.get(key);
  if (pending) return pending;

  const request = fetch(browseUrl(countryCode, locale, category))
    .then((response) => (response.ok ? response.json() : null))
    .then((data: SessionBrowsePage | null) => {
      if (!data?.products || !data.meta) return null;
      const page = { products: data.products, meta: data.meta };
      setSessionBrowsePage(countryCode, locale, page, category);
      return page;
    })
    .catch(() => null)
    .finally(() => {
      inflightPages.delete(key);
    });

  inflightPages.set(key, request);
  return request;
}

export function prefetchBrowseCatalog(
  countryCode: CountryCode,
  locale: SiteLocale,
  category?: string | null
): void {
  void ensureBrowseCatalog(countryCode, locale, category);
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

export function requestBrowseCategory(categoryId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<{ categoryId: string }>(BROWSE_CATEGORY_EVENT, {
      detail: { categoryId },
    })
  );
}
