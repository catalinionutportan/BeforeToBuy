import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchMergedProductsForLocation } from "@/lib/product-service";
import {
  clampProductListLimit,
  DEFAULT_PRODUCT_LIST_LIMIT,
  parseProductListOffset,
} from "@/lib/product-list-options";
import { getPrimaryLiveBrowseCountry } from "@/lib/live-browse-market";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/locales";
import { stripUnsafeQueryChars } from "@/lib/utils/sanitization";

/** evoMAG catalogue pull + parse needs headroom on Vercel Pro. */
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const homeUi = HOME_UI[DEFAULT_LOCALE];

function sanitizeQueryParam(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  return stripUnsafeQueryChars(input);
}

const VALID_COUNTRIES = new Set<CountryCode>(Object.keys(COUNTRIES) as CountryCode[]);

function parseCountry(value: string | null): CountryCode {
  // Default to the primary live catalogue (RO) — DEFAULT_COUNTRY is still CH
  // and returns an empty feed set, which looks like a broken homepage.
  if (!value) return getPrimaryLiveBrowseCountry();
  const code = value.toUpperCase() as CountryCode;
  return VALID_COUNTRIES.has(code) ? code : getPrimaryLiveBrowseCountry();
}

function buildUserLocation(
  countryCode: CountryCode,
  lat: string | null,
  lng: string | null
): UserLocation {
  const country = COUNTRIES[countryCode] || COUNTRIES[getPrimaryLiveBrowseCountry()];
  const parsedLat = lat ? Number(lat) : country.defaultCoordinates.lat;
  const parsedLng = lng ? Number(lng) : country.defaultCoordinates.lng;

  return {
    latitude: Number.isFinite(parsedLat) ? parsedLat : country.defaultCoordinates.lat,
    longitude: Number.isFinite(parsedLng) ? parsedLng : country.defaultCoordinates.lng,
    countryCode,
    countryName: country.name,
    city: country.defaultCoordinates.city,
    isGps: false,
  };
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  // Homepage SSR + client refetch + navigation can burn a low budget quickly.
  const rateLimit = await checkRateLimit(`products:${clientIp}`, 300, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.productApiTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const countryCode = parseCountry(searchParams.get("country"));
  const query = sanitizeQueryParam(searchParams.get("q"));
  const category = sanitizeQueryParam(searchParams.get("category"));
  const locale = normalizeLocale(searchParams.get("locale")) ?? DEFAULT_LOCALE;
  const limit = clampProductListLimit(
    searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
    DEFAULT_PRODUCT_LIST_LIMIT
  );
  const offset = parseProductListOffset(
    searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined
  );
  const includePriceHistory = searchParams.get("priceHistory") === "1";
  const userLocation = buildUserLocation(
    countryCode,
    searchParams.get("lat"),
    searchParams.get("lng")
  );

  try {
    const result = await fetchMergedProductsForLocation(userLocation, query, category, locale, {
      limit,
      offset,
      includePriceHistory,
      compact: true,
    });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch (error) {
    const trackingId = randomUUID();
    console.error(`Product fetch failed (Tracking ID: ${trackingId}):`, error);
    return NextResponse.json(
      { error: formatUi(homeUi.productFetchError, {}) , trackingId },
      { status: 500 }
    );
  }
}
