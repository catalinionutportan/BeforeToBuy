/**
 * Offline catalogue import into Supabase (2Performant CSV → Product/Offer).
 *
 * Catalogue focus: GB Seentat / Geepas, US Ottocast, CH baby-walz, plus RO offline imports.
 *
 * Add RO (or other) merchants ONE AT A TIME to FEEDS below, then:
 *   ALLOW_RO_IMPORT=1 npm run feeds:import -- --merchant=<merchantId>
 *
 * Do NOT restore a bulk 9-feed list and `--all` until the site is stable.
 *
 * evoMAG: import only small 2Performant *category* CSVs (VIDEO, Laptopuri, …).
 * Put multiple URLs in TWO_PERFORMANT_FEED_URL_RO_EVOMAG (comma-separated) so
 * stale cleanup keeps every slice in stock. Never use the full ~78k catalogue.
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

/** One URL, or several category slices separated by comma / whitespace. */
function parseFeedUrls(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

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
  {
    envVar: "TWO_PERFORMANT_FEED_URL_RO_EVOMAG",
    merchantId: "ro-evomag",
    storeName: "evoMAG.ro",
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
  const skipped: string[] = [];
  let imported = 0;

  for (const feed of selected) {
    console.log(`\n=== ${feed.storeName} (${feed.merchantId}) ===`);
    try {
      const feedUrls = parseFeedUrls(process.env[feed.envVar] || "");
      if (feedUrls.length === 0) {
        // `--merchant=` is explicit: fail. `--all` skips unset secrets so one
        // missing URL does not fail the nightly job.
        if (merchantId) {
          throw new Error(`Missing required environment variable ${feed.envVar}.`);
        }
        console.warn(`Skipping ${feed.storeName}: ${feed.envVar} is not set.`);
        skipped.push(feed.envVar);
        continue;
      }
      if (feedUrls.length > 1) {
        console.log(`Category slices: ${feedUrls.length}`);
      }
      const written = await sync2PerformantFeed(
        feedUrls,
        feed.merchantId,
        feed.storeName,
        feed.countryCode,
        feed.currency
      );
      imported += 1;
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

  if (skipped.length > 0) {
    console.warn(`Skipped ${skipped.length} feed(s) without URL:\n${skipped.join("\n")}`);
  }

  if (failures.length > 0) {
    throw new Error(`Import failed for ${failures.length} feed(s):\n${failures.join("\n")}`);
  }

  if (imported === 0) {
    throw new Error(
      [
        "No feeds imported — add these as GitHub Actions secrets:",
        ...(skipped.length > 0 ? skipped : selected.map((feed) => feed.envVar)),
        "Settings → Secrets and variables → Actions → New repository secret",
      ].join("\n")
    );
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
