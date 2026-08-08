import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { resolveGeoCountryCode } from "@/lib/live-browse-market";
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
  const rateLimit = await checkRateLimit(`location:${clientIp}`, 15, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.geocodeTooManyRequests },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const ipLookupUrl =
      clientIp && clientIp !== "unknown"
        ? `https://ipapi.co/${encodeURIComponent(clientIp)}/json/`
        : "https://ipapi.co/json/";

    const res = await fetchWithTimeout(
      ipLookupUrl,
      {
        headers: { "User-Agent": homeUi.userAgent },
        next: { revalidate: 3600 },
      },
      { timeoutMs: 8_000, retries: 1 }
    );

    if (res.ok) {
      const data = await res.json();
      // Never force empty CH on missing/unknown country — prefer live catalogue (RO).
      const validCode = resolveGeoCountryCode(data.country_code);

      return NextResponse.json({
        latitude: data.latitude || COUNTRIES[validCode].defaultCoordinates.lat,
        longitude: data.longitude || COUNTRIES[validCode].defaultCoordinates.lng,
        countryCode: validCode,
        countryName: COUNTRIES[validCode].name,
        city: data.city || COUNTRIES[validCode].defaultCoordinates.city,
        postalCode: data.postal,
        isGps: false,
      });
    }
  } catch (error) {
    console.warn(homeUi.serverSideIpLocationFailed, error);
  }

  // Fail soft: do not invent a CH (or any) market — client keeps cookie / primary live.
  return NextResponse.json(
    { error: homeUi.geolocationPositionUnavailable },
    { status: 503 }
  );
}
