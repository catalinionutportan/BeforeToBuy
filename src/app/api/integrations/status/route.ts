import { NextResponse } from "next/server";
import { getIntegrationSummary } from "@/lib/merchant-integrations";

export async function GET() {
  return NextResponse.json(getIntegrationSummary(), {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
