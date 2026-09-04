import { ALL_CATEGORIES_ID } from "@/lib/categories";
import {
  BROWSE_API_VERSION,
  DEFAULT_PRODUCT_LIST_LIMIT,
} from "@/lib/product-list-options";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { SiteLocale } from "@/lib/i18n/locales";
import type { CountryCode, Product } from "@/types";

/** Markets with a real catalogue — keep first pages warm in this tab. */
export const PREFETCH_BROWSE_MARKETS: CountryCode[] = ["CH", "RO", "GB", "US", "DE"];

/** Homepage listens so the category flyout does not remount the page. */
export const BROWSE_CATEGORY_EVENT = "btb-browse-category";

const STORAGE_PREFIX = "btb-browse-page:v9:";
const STORAGE_TTL_MS = 15 * 60 * 1000;

export type SessionBrowsePage = {
  products: Product[];
  meta: ProductFetchMeta;
};

/** Reject the Acer-sized page that was saved after Redis died (no aisle counts). */
export function isUsableAllBrowsePage(page: SessionBrowsePage | null | undefined): boolean {
  if (!page?.products?.length || !page.meta) return false;
  const counts = page.meta.categoryCounts;
  if (!counts || Object.keys(counts).length === 0) return false;
  const matched = Number(page.meta.totalMatched ?? 0);
  return matched > page.products.length;
}

type PersistedBrowsePage = {
  savedAt: number;
  page: SessionBrowsePage;
};

const sessionPages = new Map<string, SessionBrowsePage>();
const inflightPages = new Map<string, Promise<SessionBrowsePage | null>>();

function sessionCategoryKey(category?: string | null): string {
  const trimmed = category?.trim();
  return trimmed && trimmed !== ALL_CATEGORIES_ID && trimmed !== "all" ? trimmed : "_all";
}

function sessionKey(countryCode: CountryCode, category?: string | null): string {
  return `${countryCode.toUpperCase()}:${sessionCategoryKey(category)}`;
}

function readPersistedPage(key: string): SessionBrowsePage | null {
  if (typeof window === "undefined") return null;
  try {
    // Remove the previous cross-session cache format during the self-hosted privacy migration.
    window.localStorage.removeItem(STORAGE_PREFIX + key);
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedBrowsePage;
    if (!parsed?.page?.products?.length || !parsed.page.meta || typeof parsed.savedAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.savedAt > STORAGE_TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
    return parsed.page;
  } catch {
    return null;
  }
}

function persistPage(key: string, page: SessionBrowsePage): void {
  if (typeof window === "undefined" || !page?.products?.length) return;
  try {
    const payload: PersistedBrowsePage = { savedAt: Date.now(), page };
    window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(payload));
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
  const allAisle = sessionCategoryKey(category) === "_all";
  const local = sessionPages.get(key);
  if (local?.products?.length) {
    if (allAisle && !isUsableAllBrowsePage(local)) {
      sessionPages.delete(key);
    } else {
      return local;
    }
  }
  const persisted = readPersistedPage(key);
  if (persisted?.products?.length) {
    if (sessionCategoryKey(category) === "_all" && !isUsableAllBrowsePage(persisted)) {
      try {
        window.sessionStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        /* ignore */
      }
      return null;
    }
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
  if (!page?.products?.length) return;
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
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) stale.push(key);
  }
  for (const key of stale) window.sessionStorage.removeItem(key);
}

/** Test helper — drop memory so the next read must use this tab's sessionStorage. */
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
    v: BROWSE_API_VERSION,
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
  const allAisle = sessionCategoryKey(category) === "_all";
  if (cached?.products?.length && (!allAisle || isUsableAllBrowsePage(cached))) {
    return Promise.resolve(cached);
  }
  if (typeof window === "undefined") return Promise.resolve(null);

  const key = sessionKey(countryCode, category);
  const pending = inflightPages.get(key);
  if (pending) return pending;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8_000);
  const request = fetch(browseUrl(countryCode, locale, category), {
    signal: controller.signal,
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data: SessionBrowsePage | null) => {
      if (!data?.products || !data.meta) return null;
      const page = { products: data.products, meta: data.meta };
      setSessionBrowsePage(countryCode, locale, page, category);
      return page;
    })
    .catch(() => null)
    .finally(() => {
      window.clearTimeout(timeoutId);
      inflightPages.delete(key);
    });

  inflightPages.set(key, request);
  return request;
}

export function requestBrowseCategory(categoryId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<{ categoryId: string }>(BROWSE_CATEGORY_EVENT, {
      detail: { categoryId },
    })
  );
}
