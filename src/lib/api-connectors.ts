import { CountryCode, Offer, PromoCoupon } from "@/types";

/**
 * Amazon PA-API 5.0 Connector Interface
 */
export interface AmazonApiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string; // e.g. "geoshop-ch-21"
  region: "eu-west-1" | "us-east-1";
}

/**
 * Amazon PA-API connector placeholder. It returns no data until the signed
 * production request and response validation are implemented.
 */
export async function searchAmazonPaApi(
  keywords: string,
  country: CountryCode,
  config?: Partial<AmazonApiConfig>
): Promise<Offer[]> {
  // Deliberately return no offers until a signed PA-API request is implemented.
  // Never expose simulated prices, discounts, ratings, or stock as merchant data.
  void keywords;
  void country;
  void config;
  return [];
}

/**
 * AWIN Coupon & Promotion REST API Client
 */
export async function fetchAwinPromotions(
  publisherId: string,
  apiToken: string,
  country: CountryCode
): Promise<PromoCoupon[]> {
  // Deliberately return no promotions until the authenticated AWIN request,
  // response validation, and verified coupon mapping are implemented.
  void publisherId;
  void apiToken;
  void country;
  return [];
}

/**
 * CJ Affiliate GraphQL Product Search API
 */
export async function searchCjGraphQL(
  keywords: string,
  personalAccessToken: string
): Promise<Offer[]> {
  // Deliberately return no offers until the authenticated CJ request and
  // response validation are implemented.
  void keywords;
  void personalAccessToken;
  return [];
}
