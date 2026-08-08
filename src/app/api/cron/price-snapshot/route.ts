import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runPriceSnapshotJob } from "@/lib/pricing/price-snapshot-job";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

const homeUi = HOME_UI[DEFAULT_LOCALE];

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const tokenBuf = Buffer.from(token);
    const secretBuf = Buffer.from(cronSecret);
    if (tokenBuf.length !== secretBuf.length) return false;
    return timingSafeEqual(tokenBuf, secretBuf);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: homeUi.unauthorized }, { status: 401 });
  }

  try {
    const result = await runPriceSnapshotJob(["CH"]);
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
