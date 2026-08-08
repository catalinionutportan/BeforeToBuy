import { NextResponse } from "next/server";
import { CountryCode } from "@/types";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getFeedMappingReport } from "@/lib/merchant-feeds";
import { isInternalApiAuthorized } from "@/lib/internal-api-auth";
import { getPrimaryLiveBrowseCountry } from "@/lib/live-browse-market";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

const VALID_COUNTRIES = new Set<CountryCode>(["CH", "DE", "FR", "RO", "GB", "US"]);

function parseCountry(value: string | null): CountryCode {
  const fallback = getPrimaryLiveBrowseCountry();
  const code = (value || fallback).toUpperCase() as CountryCode;
  return VALID_COUNTRIES.has(code) ? code : fallback;
}

export async function GET(request: Request) {
  if (!isInternalApiAuthorized(request)) {
    return NextResponse.json({ error: homeUi.unauthorized }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await checkRateLimit(`mapping-report:${clientIp}`, 30, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: homeUi.mappingReportTooManyRequests },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const countryCode = parseCountry(searchParams.get("country"));
  const merchantId = searchParams.get("merchant") || undefined;
  const includeEntries = searchParams.get("entries") === "1";

  try {
    const report = await getFeedMappingReport(countryCode, merchantId);
    return NextResponse.json(
      includeEntries
        ? report
        : {
            summary: report.summary,
            reviewQueue: report.reviewQueue,
            generatedAt: report.generatedAt,
          },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      }
    );
  } catch (error) {
    console.error("Mapping report failed:", error);
    return NextResponse.json({ error: homeUi.mappingReportUnableToBuild }, { status: 500 });
  }
}
