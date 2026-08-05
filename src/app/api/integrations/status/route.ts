import { NextResponse } from "next/server";
import { getIntegrationSummary } from "@/lib/merchant-integrations";
import { isInternalApiAuthorized } from "@/lib/internal-api-auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export async function GET(request: Request) {
  if (!isInternalApiAuthorized(request)) {
    return NextResponse.json({ error: homeUi.unauthorized }, { status: 401 });
  }

  return NextResponse.json(getIntegrationSummary(), {
    headers: {
      "Cache-Control": "private, max-age=300",
    },
  });
}
