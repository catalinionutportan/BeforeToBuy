import { notFound } from "next/navigation";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  defaultLocaleFromCountry,
  isSiteLocale,
  type SiteLocale,
} from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { getProductById, inferCountryFromProductId } from "@/lib/product-lookup";
import { getOffersPriceHistoryBatch } from "@/lib/pricing/price-history";
import { buildPriceHistoryKey } from "@/lib/pricing/price-history-keys";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import {
  ProductModalHandoff,
  type ProductModalHandoffPayload,
} from "@/components/ProductModalHandoff";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; lang?: string }>;
};

export default async function ProductModal({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { lang } = await searchParams;
  const product = await getProductById(id);
  if (!product) notFound();

  const batchedHistories = await getOffersPriceHistoryBatch([product]);
  product.offers = product.offers.map((offer) => {
    if (offer.source === "demo") return offer;
    const history = batchedHistories.get(buildPriceHistoryKey(product, offer));
    return { ...offer, priceHistory: history ?? [] };
  });

  const countryCode =
    product.targetCountries[0] ||
    inferCountryFromProductId(product.id) ||
    DEFAULT_COUNTRY;
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  // Prefer browse UI language from the card link — same chrome as the instant shell.
  const locale: SiteLocale = isSiteLocale(lang)
    ? lang
    : defaultLocaleFromCountry(countryCode);
  const ui = HOME_UI[locale];
  const sortedOffers = sortOffersByTotalPrice(product.offers);

  const payload: ProductModalHandoffPayload = {
    id: product.id,
    title: product.title,
    brand: product.brand,
    description: product.description,
    image: product.image,
    currencySymbol: country.currencySymbol,
    compareHeading: ui.productOfferHeading,
    compareTip: ui.compareViaBalanceTip,
    gtinLabel: ui.gtinLabel,
    gtin: product.gtin || undefined,
    offers: sortedOffers.map((offer) => {
      const total = offer.totalPrice ?? computeTotalPrice(offer);
      const isLive = offer.source === "production-live";
      return {
        id: offer.id,
        storeName: offer.storeName,
        priceLabel: `${country.currencySymbol}${total.toLocaleString()}`,
        sourceLabel: isLive
          ? ui.liveOfferLabel
          : offer.source === "sample"
            ? ui.sampleOfferLabel
            : ui.demoOfferLabel,
        purchaseUrl: offer.purchaseUrl,
        isLive,
        ctaLabel: isLive ? ui.viewOfferButton : ui.searchStoreButton,
      };
    }),
  };

  return <ProductModalHandoff payload={payload} />;
}
