import { cookies, headers } from "next/headers";
import { defaultLocaleFromCountry, normalizeLocale, type SiteLocale } from "@/lib/i18n/locales";
import { LANG_COOKIE_KEY } from "@/lib/i18n/preference";
import { getRequestMarketCountry } from "@/lib/request-market";

type SearchParamValue = string | string[] | undefined;

export type LocaleSearchParams =
  | Promise<Record<string, SearchParamValue>>
  | Record<string, SearchParamValue>
  | undefined;

function firstSearchParamValue(value: SearchParamValue): string | null {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : null;
  }
  return typeof value === "string" ? value : null;
}

export async function resolvePageLocale(searchParams?: LocaleSearchParams): Promise<SiteLocale> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const fromQuery = normalizeLocale(firstSearchParamValue(resolvedSearchParams?.lang));
  if (fromQuery) {
    return fromQuery;
  }

  const requestHeaders = await headers();
  const fromProxy = normalizeLocale(requestHeaders.get("x-btb-locale"));
  if (fromProxy) {
    return fromProxy;
  }

  const cookieStore = await cookies();
  const fromCookie = normalizeLocale(cookieStore.get(LANG_COOKIE_KEY)?.value);
  if (fromCookie) {
    return fromCookie;
  }

  const countryCode = await getRequestMarketCountry();
  return defaultLocaleFromCountry(countryCode);
}
