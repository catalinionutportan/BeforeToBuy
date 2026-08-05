import { CountryCode, OfferSource, Product } from "@/types";
import type { FeedConfig } from "@/lib/merchant-integrations";
import { parseAwinCsvFeed, parseGalaxusJsonFeed } from "@/lib/feed-parser";
import type { MappingLogEntry } from "@/lib/mapping-log";

export function parseConfiguredFeed(
  feed: FeedConfig,
  content: string,
  country: CountryCode,
  offerSource: Extract<OfferSource, "production-live" | "sample">
): { products: Product[]; mappingLog: MappingLogEntry[] } {
  if (feed.provider === "GALAXUS") {
    return parseGalaxusJsonFeed(content, country, feed.merchantId, offerSource);
  }

  return parseAwinCsvFeed(content, country, feed.merchantId, offerSource);
}
