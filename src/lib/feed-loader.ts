import { CountryCode, OfferSource, Product } from "@/types";
import type { FeedConfig } from "@/lib/merchant-integrations";
import { parseAwinCsvFeed, parseGalaxusJsonFeed, parseAwinCsvFeedStream, parseGalaxusJsonFeedStream } from "@/lib/feed-parser";
import csv from "csv-parser";
import type { MappingLogEntry } from "@/lib/mapping-log";

export async function parseConfiguredFeed(
  feed: FeedConfig,
  content: NodeJS.ReadableStream | string,
  country: CountryCode,
  offerSource: Extract<OfferSource, "production-live" | "sample">
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }> {
  if (typeof content !== 'string' && feed.provider === "AWIN") {
    return await parseAwinCsvFeedStream(content, country, feed.merchantId, offerSource);
  } else if (typeof content === 'string' && feed.provider === "AWIN") {
    return parseAwinCsvFeed(content, country, feed.merchantId, offerSource);
  } else if (typeof content !== 'string' && feed.provider === "GALAXUS") {
    return await parseGalaxusJsonFeedStream(content, country, feed.merchantId, offerSource);
  } else if (typeof content === 'string' && feed.provider === "GALAXUS") {
    return parseGalaxusJsonFeed(content, country, feed.merchantId, offerSource);
  }
  throw new Error("Unsupported feed provider or content type");
}
