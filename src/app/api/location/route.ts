import { NextResponse } from "next/server";
import { CountryCode } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasServerConsent } from "@/lib/server-consent";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

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

    const res = await fetch(ipLookupUrl, {
      headers: { "User-Agent": homeUi.userAgent },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const code = (data.country_code?.toUpperCase() || "CH") as CountryCode;
      const validCode: CountryCode = COUNTRIES[code] ? code : DEFAULT_COUNTRY;

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

  const def = COUNTRIES[DEFAULT_COUNTRY];
  return NextResponse.json({
    latitude: def.defaultCoordinates.lat,
    longitude: def.defaultCoordinates.lng,
    countryCode: DEFAULT_COUNTRY,
    countryName: def.name,
    city: def.defaultCoordinates.city,
    isGps: false,
  });
}
