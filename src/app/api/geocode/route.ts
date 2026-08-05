import { NextResponse } from "next/server";
import { CountryCode } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { validateLatLng } from "@/lib/api-validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasServerConsent } from "@/lib/server-consent";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export async function GET(request: Request) {
  if (!hasServerConsent(request, "location")) {
    return NextResponse.json(
      { error: homeUi.geocodeLocationConsentRequired },
      { status: 403 }
    );
  }

  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(`geocode:${clientIp}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.geocodeTooManyRequests },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const coords = validateLatLng(searchParams.get("lat"), searchParams.get("lng"));

  if (!coords) {
    return NextResponse.json(
      { error: homeUi.geocodeInvalidCoordinates },
      { status: 400 }
    );
  }

  const { latitude, longitude } = coords;

  try {
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          "User-Agent": homeUi.userAgent,
        },
        next: { revalidate: 3600 },
      },
      { timeoutMs: 8_000, retries: 1 }
    );

    if (res.ok) {
      const data = await res.json();
      const code = (data.address?.country_code?.toUpperCase() || "CH") as CountryCode;
      const validCode: CountryCode = COUNTRIES[code] ? code : DEFAULT_COUNTRY;
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state ||
        COUNTRIES[validCode].defaultCoordinates.city;

      return NextResponse.json({
        countryCode: validCode,
        countryName: COUNTRIES[validCode].name,
        city,
      });
    }
  } catch (err) {
    console.warn("Reverse geocode server-side failed:", err);
  }

  return NextResponse.json({
    countryCode: DEFAULT_COUNTRY,
    countryName: COUNTRIES[DEFAULT_COUNTRY].name,
    city: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.city,
  });
}
