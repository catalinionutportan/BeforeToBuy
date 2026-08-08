import { CountryCode, OfferSource, Product } from "@/types";
import type { FeedConfig } from "@/lib/merchant-integrations";
import {
  parseAwinCsvFeed,
  parseGalaxusJsonFeed,
  parseAwinCsvFeedStream,
  parseGalaxusJsonFeedStream,
} from "@/lib/feed-parser";
import {
  parseGoogleMerchantXmlFeed,
  parseGoogleMerchantXmlFeedStream,
} from "@/lib/google-merchant-feed-parser";
import { parseTwoPerformantCsvFeedStream } from "@/lib/two-performant-feed-parser";
import type { MappingLogEntry } from "@/lib/mapping-log";
import { Readable } from "node:stream";

type StreamParser = (
  content: NodeJS.ReadableStream,
  country: CountryCode,
  merchantId: string,
  offerSource: Extract<OfferSource, "production-live" | "sample">
) => Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }>;

type StringParser = (
  content: string,
  country: CountryCode,
  merchantId: string,
  offerSource: Extract<OfferSource, "production-live" | "sample">
) => { products: Product[]; mappingLog: MappingLogEntry[] };

const FEED_PARSERS: Record<
  FeedConfig["provider"],
  { stream: StreamParser; string: StringParser }
> = {
  AWIN: {
    stream: parseAwinCsvFeedStream,
    string: parseAwinCsvFeed,
  },
  GALAXUS: {
    stream: parseGalaxusJsonFeedStream,
    string: parseGalaxusJsonFeed,
  },
  GOOGLE_MERCHANT: {
    stream: parseGoogleMerchantXmlFeedStream,
    string: parseGoogleMerchantXmlFeed,
  },
  TWO_PERFORMANT: {
    stream: parseTwoPerformantCsvFeedStream,
    string: () => ({ products: [], mappingLog: [] }),
  },
};

export async function parseConfiguredFeed(
  feed: FeedConfig,
  content: NodeJS.ReadableStream | string,
  country: CountryCode,
  offerSource: Extract<OfferSource, "production-live" | "sample">
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }> {
  if (feed.provider === "TWO_PERFORMANT") {
    const stream = typeof content === "string" ? Readable.from([content]) : content;
    return parseTwoPerformantCsvFeedStream(stream, country, feed.merchantId, offerSource, {
      categoryHint: feed.categoryHint,
    });
  }

  const parsers = FEED_PARSERS[feed.provider];
  if (!parsers) {
    throw new Error(`Unsupported feed provider: ${feed.provider}`);
  }

  if (typeof content === "string") {
    // Prefer stream path when possible so CSV/JSON parsing stays unified.
    if (feed.provider === "AWIN" || feed.provider === "GALAXUS" || feed.provider === "GOOGLE_MERCHANT") {
      return parsers.stream(Readable.from([content]), country, feed.merchantId, offerSource);
    }
    return parsers.string(content, country, feed.merchantId, offerSource);
  }

  return parsers.stream(content, country, feed.merchantId, offerSource);
}
