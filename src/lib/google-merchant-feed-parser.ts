import { Readable } from "node:stream";
import { CountryCode, Offer, OfferSource, Product } from "@/types";
import { mapToBeforeToBuyCategoryWithMetadata } from "@/lib/category-mapper";
import { createMappingLogEntry, type MappingLogEntry } from "@/lib/mapping-log";
import { resolveGtin } from "@/lib/product-identity/gtin";
import { enrichProductIdentity } from "@/lib/product-identity/merge-products";
import { enrichOfferPricing } from "@/lib/pricing/total-price";
import { wrapScule365AffiliateUrl } from "@/lib/affiliate-links";

export interface RawGoogleMerchantItem {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: string;
  salePrice?: string;
  availability: string;
  brand: string;
  gtin?: string;
  mpn?: string;
  productType?: string;
  shippingPrice?: string;
}

function decodeXmlText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function readTag(entryXml: string, tag: string): string | undefined {
  const escaped = tag.replace(/:/g, "\\:");
  const match = entryXml.match(
    new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, "i")
  );
  if (!match?.[1]) return undefined;
  const value = decodeXmlText(match[1]);
  return value || undefined;
}

function parseMoney(value?: string): { amount: number; currency: string } | null {
  if (!value) return null;
  const match = value.trim().match(/^([\d.,]+)\s*([A-Z]{3})$/i);
  if (!match) return null;
  const amount = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(amount)) return null;
  return { amount, currency: match[2].toUpperCase() };
}

function parseEntry(entryXml: string): RawGoogleMerchantItem | null {
  const id = readTag(entryXml, "g:id");
  const title = readTag(entryXml, "g:title");
  const link = readTag(entryXml, "g:link");
  if (!id || !title || !link) return null;

  const shippingBlock = readTag(entryXml, "g:shipping");
  const shippingPrice = shippingBlock ? readTag(shippingBlock, "g:price") : undefined;

  return {
    id,
    title,
    description: readTag(entryXml, "g:description") || title,
    link,
    imageLink: readTag(entryXml, "g:image_link") || "",
    price: readTag(entryXml, "g:price") || "",
    salePrice: readTag(entryXml, "g:sale_price"),
    availability: readTag(entryXml, "g:availability") || "",
    brand: readTag(entryXml, "g:brand") || "Generic",
    gtin: readTag(entryXml, "g:gtin"),
    mpn: readTag(entryXml, "g:mpn"),
    productType: readTag(entryXml, "g:product_type"),
    shippingPrice,
  };
}

function splitEntries(xmlContent: string): string[] {
  const entries: string[] = [];
  const re = /<entry\b[\s\S]*?<\/entry>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xmlContent)) !== null) {
    entries.push(match[0]);
  }
  return entries;
}

function storeNameForMerchant(feedMerchantId: string): string {
  if (feedMerchantId === "ro-scule365") return "Scule365.ro";
  return "Google Merchant";
}

function affiliateNetworkForMerchant(feedMerchantId: string): string {
  if (feedMerchantId === "ro-scule365") return "2Performant Romania";
  return "Google Merchant feed";
}

function wrapPurchaseUrl(feedMerchantId: string, productUrl: string): string {
  if (feedMerchantId === "ro-scule365") return wrapScule365AffiliateUrl(productUrl);
  return productUrl;
}

function buildOffer(
  item: RawGoogleMerchantItem,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): Offer | null {
  const sale = parseMoney(item.salePrice);
  const list = parseMoney(item.price);
  const priceInfo = sale ?? list;
  if (!priceInfo || priceInfo.amount <= 0) return null;

  const originalPrice =
    source === "production-live" && sale && list && list.amount > sale.amount
      ? list.amount
      : undefined;
  const discountPercentage =
    originalPrice && originalPrice > priceInfo.amount
      ? Math.round(((originalPrice - priceInfo.amount) / originalPrice) * 100)
      : undefined;
  const shipping = parseMoney(item.shippingPrice);
  const isProduction = source === "production-live";

  return enrichOfferPricing({
    id: `gm-${feedMerchantId}-${item.id}`,
    storeName: storeNameForMerchant(feedMerchantId),
    price: priceInfo.amount,
    originalPrice,
    discountPercentage,
    currency: priceInfo.currency,
    inStock: /in[_ ]?stock/i.test(item.availability),
    deliveryTime: "2-5 zile lucrătoare",
    deliveryCost: shipping?.amount ?? 0,
    purchaseUrl: wrapPurchaseUrl(feedMerchantId, item.link),
    affiliateNetwork: affiliateNetworkForMerchant(feedMerchantId),
    type: "online",
    source,
    feedMerchantId,
    merchantProductId: item.id,
    badge: isProduction
      ? discountPercentage && discountPercentage >= 20
        ? `-${discountPercentage}% feed discount`
        : "Production feed"
      : "Sample feed",
  });
}

function ingestItem(
  item: RawGoogleMerchantItem,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">,
  productsMap: Map<string, Product>,
  mappingLog: MappingLogEntry[]
): void {
  const offer = buildOffer(item, feedMerchantId, source);
  if (!offer) return;

  const gtin = resolveGtin(item.gtin);
  const productId = gtin ? `feed-gtin-${gtin}` : `feed-${feedMerchantId}-${item.id}`;
  const existing = productsMap.get(productId);
  if (existing) {
    existing.offers.push(offer);
    return;
  }

  const categoryMapping = mapToBeforeToBuyCategoryWithMetadata({
    merchantId: feedMerchantId,
    merchantCategory: item.productType,
    title: item.title,
    description: item.description,
    brand: item.brand,
  });

  mappingLog.push(
    createMappingLogEntry({
      productId,
      merchantId: feedMerchantId,
      title: item.title,
      rawCategory: item.productType,
      mapping: categoryMapping,
    })
  );

  productsMap.set(productId, {
    id: productId,
    title: item.title,
    description: item.description,
    gtin,
    category: categoryMapping.categoryId,
    categoryAssignment: {
      method: categoryMapping.method,
      confidence: categoryMapping.confidence,
      rawCategory: categoryMapping.rawCategory,
      proposedCategoryId: categoryMapping.proposedCategoryId,
    },
    brand: item.brand,
    image:
      item.imageLink ||
      "https://images.unsplash.com/photo-1581166397057-235af2e37a9f?w=600",
    targetCountries: [targetCountry],
    isFlashDeal:
      source === "production-live" && Boolean(offer.discountPercentage && offer.discountPercentage >= 15),
    catalogSource: source,
    offers: [offer],
  });
}

export function parseGoogleMerchantXmlFeed(
  xmlContent: string,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): { products: Product[]; mappingLog: MappingLogEntry[] } {
  const productsMap = new Map<string, Product>();
  const mappingLog: MappingLogEntry[] = [];

  for (const entryXml of splitEntries(xmlContent)) {
    const item = parseEntry(entryXml);
    if (!item) continue;
    ingestItem(item, targetCountry, feedMerchantId, source, productsMap, mappingLog);
  }

  return {
    products: Array.from(productsMap.values()).map(enrichProductIdentity),
    mappingLog,
  };
}

export async function parseGoogleMerchantXmlFeedStream(
  xmlStream: NodeJS.ReadableStream,
  targetCountry: CountryCode,
  feedMerchantId: string,
  source: Extract<OfferSource, "production-live" | "sample">
): Promise<{ products: Product[]; mappingLog: MappingLogEntry[] }> {
  const chunks: Buffer[] = [];
  for await (const chunk of xmlStream as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return parseGoogleMerchantXmlFeed(
    Buffer.concat(chunks).toString("utf8"),
    targetCountry,
    feedMerchantId,
    source
  );
}

/** Helper for tests that pass a string through the stream path. */
export function googleMerchantXmlAsStream(xml: string): NodeJS.ReadableStream {
  return Readable.from([xml]);
}
