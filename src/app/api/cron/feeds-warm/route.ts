import { NextRequest, NextResponse } from "next/server";
import { warmMerchantFeeds } from "@/lib/merchant-feeds";
import { isCronAuthorized } from "@/lib/internal-api-auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const dynamic = "force-dynamic";
/** Heavy CSV warm needs headroom (outside user requests). */
export const maxDuration = 300;

/**
 * Offline feed warm — downloads heavy catalogues and writes Redis.
 * Secured by CRON_SECRET Bearer token only (not INTERNAL_API_SECRET).
 * Vercel Cron: Authorization: Bearer $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: homeUi.unauthorized }, { status: 401 });
  }

  const heavyOnly = request.nextUrl.searchParams.get("all") !== "1";

  try {
    const result = await warmMerchantFeeds({ heavyOnly });
    return NextResponse.json(result, {
      status: result.ok ? 200 : 207,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[cron/feeds-warm] failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "feeds warm failed",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
