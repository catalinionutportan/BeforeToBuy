import { NextResponse } from "next/server";
import { CountryCode } from "@/types";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getFeedMappingReport } from "@/lib/merchant-feeds";

const VALID_COUNTRIES = new Set<CountryCode>(["CH", "DE", "FR", "RO", "GB", "US"]);

function parseCountry(value: string | null): CountryCode {
  const code = (value || DEFAULT_COUNTRY).toUpperCase() as CountryCode;
  return VALID_COUNTRIES.has(code) ? code : DEFAULT_COUNTRY;
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`mapping-report:${clientIp}`, 30, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many mapping report requests. Please try again later." },
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
    return NextResponse.json({ error: "Unable to build mapping report." }, { status: 500 });
  }
}
