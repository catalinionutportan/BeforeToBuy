import { NextRequest, NextResponse } from "next/server";
import { runPriceSnapshotJob } from "@/lib/pricing/price-snapshot-job";
import { isCronAuthorized } from "@/lib/internal-api-auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: homeUi.unauthorized }, { status: 401 });
  }

  try {
    // Snapshot live catalogue markets (RO + GB). CH stays empty until Swiss feeds launch.
    const result = await runPriceSnapshotJob(["RO", "GB"]);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Price snapshot cron failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: homeUi.priceSnapshotFailed,
      },
      { status: 500 }
    );
  }
}
