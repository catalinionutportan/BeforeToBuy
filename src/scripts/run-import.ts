/**
 * Offline catalogue import into Supabase (2Performant CSV → Product/Offer).
 *
 * Catalogue focus today: GB Seentat via `src/scripts/import-gb-seentat.ts`.
 *
 * Add RO (or other) merchants ONE AT A TIME to FEEDS below, then:
 *   ALLOW_RO_IMPORT=1 npm run feeds:import -- --merchant=<merchantId>
 *
 * Do NOT restore a bulk 9-feed list and `--all` until the site is stable.
 *
 * Why evoMAG (~100k SKUs) was painful:
 * - CSV is ~200MB; Vercel request/SSR cannot download/parse it live
 * - image hosts must be allowlisted (or use native <img>) or cards look empty
 * - soft caps / Redis warm path still struggle at that size without dedicated infra
 * Re-add evoMAG only after a capped/import-offline plan — never on the request path.
 */
import { sync2PerformantFeed } from "./sync-feeds";
import { prisma } from "../lib/db";

type FeedSpec = {
  envVar: string;
  merchantId: string;
  storeName: string;
  countryCode: string;
  currency: string;
};

/**
 * Add RO merchants one at a time (checked feeds only).
 * Import one merchant:
 *   ALLOW_RO_IMPORT=1 npm run feeds:import -- --merchant=ro-scule365
 */
const FEEDS: FeedSpec[] = [
  {
    envVar: "TWO_PERFORMANT_FEED_URL_RO_ROWENTA",
    merchantId: "ro-rowenta",
    storeName: "Rowenta.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    envVar: "TWO_PERFORMANT_FEED_URL_RO_SCULE365",
    merchantId: "ro-scule365",
    storeName: "Scule365.ro",
    countryCode: "RO",
    currency: "RON",
  },
];

function parseArgs(argv: string[]) {
  const all = argv.includes("--all");
  const merchantFlag = argv.find((arg) => arg.startsWith("--merchant="));
  const merchantId = merchantFlag?.slice("--merchant=".length)?.trim();
  return { all, merchantId };
}

async function main() {
  const { all, merchantId } = parseArgs(process.argv.slice(2));

  if (FEEDS.length === 0) {
    console.error(
      [
        "FEEDS is empty — no RO merchants queued for import.",
        "UK catalogue: npx tsx src/scripts/import-gb-seentat.ts",
        "When adding a RO merchant: put one entry in FEEDS, then",
        "  ALLOW_RO_IMPORT=1 npm run feeds:import -- --merchant=<id>",
      ].join("\n")
    );
    process.exit(1);
  }

  // Extra guard while catalogue stays GB-first.
  if (process.env.ALLOW_RO_IMPORT !== "1") {
    console.error(
      [
        "RO feed import is disabled (catalogue is GB-only right now).",
        "Import UK with: npx tsx src/scripts/import-gb-seentat.ts",
        "Or set ALLOW_RO_IMPORT=1 after adding one merchant to FEEDS.",
      ].join("\n")
    );
    process.exit(1);
  }

  let selected: FeedSpec[];
  if (all) {
    selected = FEEDS;
  } else if (merchantId) {
    selected = FEEDS.filter((feed) => feed.merchantId === merchantId);
    if (selected.length === 0) {
      console.error(
        `Unknown merchant "${merchantId}". Known: ${FEEDS.map((f) => f.merchantId).join(", ") || "(none)"}`
      );
      process.exit(1);
    }
  } else {
    selected = FEEDS.slice(0, 1);
  }

  console.log(
    `Importing ${selected.length} feed(s): ${selected.map((f) => f.storeName).join(", ")}`
  );

  const failures: string[] = [];
  for (const feed of selected) {
    console.log(`\n=== ${feed.storeName} (${feed.merchantId}) ===`);
    try {
      const feedUrl = process.env[feed.envVar]?.trim();
      if (!feedUrl) {
        throw new Error(`Missing required environment variable ${feed.envVar}.`);
      }
      const written = await sync2PerformantFeed(
        feedUrl,
        feed.merchantId,
        feed.storeName,
        feed.countryCode,
        feed.currency
      );
      console.log(`${feed.storeName}: ${written} offers synchronized.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${feed.storeName}: ${message}`);
      console.error(`Failed import for ${feed.storeName}:`, message);
    }
  }

  const [productCount, offerCount] = await Promise.all([
    prisma.product.count(),
    prisma.offer.count(),
  ]);
  console.log(`\nDB totals → Product: ${productCount}, Offer: ${offerCount}`);

  if (failures.length > 0) {
    throw new Error(`Import failed for ${failures.length} feed(s):\n${failures.join("\n")}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
