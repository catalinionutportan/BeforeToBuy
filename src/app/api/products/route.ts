import { NextResponse } from "next/server";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { fetchMergedProductsForLocation } from "@/lib/product-service";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

// Simple UUID v4 generator for tracking errors
function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const VALID_COUNTRIES = new Set<CountryCode>(Object.keys(COUNTRIES) as CountryCode[]);

function parseCountry(value: string | null): CountryCode {
  const code = (value || DEFAULT_COUNTRY).toUpperCase() as CountryCode;
  return VALID_COUNTRIES.has(code) ? code : DEFAULT_COUNTRY;
}

function buildUserLocation(
  countryCode: CountryCode,
  lat: string | null,
  lng: string | null
): UserLocation {
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
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
  const rateLimit = checkRateLimit(`products:${clientIp}`, 60, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many product requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const countryCode = parseCountry(searchParams.get("country"));
  const query = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const userLocation = buildUserLocation(
    countryCode,
    searchParams.get("lat"),
    searchParams.get("lng")
  );

  try {
    const result = await fetchMergedProductsForLocation(userLocation, query, category);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, max-age=30",
      },
    });
  } catch (error) {
    const trackingId = generateUuid();
    console.error(`Product fetch failed (Tracking ID: ${trackingId}):`, error);
    return NextResponse.json(
      { error: formatUi(HOME_UI[DEFAULT_LOCALE].productFetchError, {}) , trackingId },
      { status: 500 }
    );
  }
}
