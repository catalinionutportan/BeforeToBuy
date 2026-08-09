/**
 * Offline catalogue import into Supabase.
 *
 * Usage:
 *   npm run feeds:import -- --merchant=ro-rowenta
 *   npm run feeds:import -- --merchant=ro-scule365
 *   npm run feeds:import -- --merchant=ro-evomag
 *   npm run feeds:import -- --all
 *
 * Default (no flags): imports only the first feed in FEEDS.
 */
import { sync2PerformantFeed } from "./sync-feeds";
import { prisma } from "../lib/db";

type FeedSpec = {
  url: string;
  merchantId: string;
  storeName: string;
  countryCode: string;
  currency: string;
};

/** Known RO 2Performant feeds — add new merchants here one by one. */
const FEEDS: FeedSpec[] = [
  {
    url: "https://api.2performant.com/feed/c55b99d30.csv",
    merchantId: "ro-rowenta",
    storeName: "Rowenta.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/fcdbb3e99.csv",
    merchantId: "ro-scule365",
    storeName: "Scule365.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/9519e6c41.csv",
    merchantId: "ro-evomag",
    storeName: "evoMAG.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/f8f8ae236.csv",
    merchantId: "ro-gsmnet",
    storeName: "gsmnet.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/6111d323a.csv",
    merchantId: "ro-paa-home",
    storeName: "paa-home.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/86d0f944f.csv",
    merchantId: "ro-micul-meserias",
    storeName: "Micul Meserias",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/22c615c7e.csv",
    merchantId: "ro-automobilus",
    storeName: "automobilus.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/b1d791b60.csv",
    merchantId: "ro-autoeco",
    storeName: "autoeco.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/e90d7744f.csv",
    merchantId: "ro-autobob",
    storeName: "autobob.ro",
    countryCode: "RO",
    currency: "RON",
  },
  {
    url: "https://api.2performant.com/feed/b70e1e08e.csv",
    merchantId: "ro-aquiline",
    storeName: "aquiline.ro",
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

  let selected: FeedSpec[];
  if (all) {
    selected = FEEDS;
  } else if (merchantId) {
    selected = FEEDS.filter((feed) => feed.merchantId === merchantId);
    if (selected.length === 0) {
      console.error(
        `Unknown merchant "${merchantId}". Known: ${FEEDS.map((f) => f.merchantId).join(", ")}`
      );
      process.exit(1);
    }
  } else {
    selected = FEEDS.slice(0, 1);
  }

  console.log(
    `Importing ${selected.length} feed(s): ${selected.map((f) => f.storeName).join(", ")}`
  );

  for (const feed of selected) {
    console.log(`\n=== ${feed.storeName} (${feed.merchantId}) ===`);
    try {
      await sync2PerformantFeed(
        feed.url,
        feed.merchantId,
        feed.storeName,
        feed.countryCode,
        feed.currency
      );
    } catch (err) {
      console.error(`Failed import for ${feed.storeName}:`, err);
    }
  }

  const [productCount, offerCount] = await Promise.all([
    prisma.product.count(),
    prisma.offer.count(),
  ]);
  console.log(`\nDB totals → Product: ${productCount}, Offer: ${offerCount}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
