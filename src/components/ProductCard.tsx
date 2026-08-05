"use client";

import Image from "next/image";
import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { openConsentPreferences } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { getPriceTrend } from "@/lib/pricing/price-trend";
import { formatOfferFreshness, getFreshestOfferTimestamp } from "@/lib/offers/freshness";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import {
  ExternalLink,
  MapPin,
  Truck,
  Store,
  Globe,
  Sparkles,
  ShoppingBag,
  Info,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  userLocation: UserLocation;
  onSelectOffer: (product: Product, offer: Offer) => void;
  locale?: SiteLocale;
}

export function ProductCard({
  product,
  userLocation,
  onSelectOffer,
  locale,
}: ProductCardProps) {
  const { affiliate } = useConsent();
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const ui = HOME_UI[locale ?? defaultLocaleFromCountry(userLocation.countryCode)];

  const handleAffiliateClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    offer: Offer
  ) => {
    if (!affiliate) {
      event.preventDefault();
      openConsentPreferences();
      return;
    }
    onSelectOffer(product, offer);
  };

  const sortedOffers = sortOffersByTotalPrice(product.offers);
  const feedOffers = sortedOffers.filter((offer) => offer.source !== "demo");
  const lowestFeedTotal = feedOffers[0]
    ? feedOffers[0].totalPrice ?? computeTotalPrice(feedOffers[0])
    : undefined;
  const verifiedBadgeOffer = feedOffers.find((offer) => offer.badge);

  const pickupOffer = product.offers.find(
    (o) => o.source === "production-live" && o.type === "local_pickup" && o.nearbyBranch
  );
  const freshestLabel = formatOfferFreshness(getFreshestOfferTimestamp(product.offers));

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.title,
            "image": product.image,
            "description": product.description,
            "sku": product.id,
            "mpn": product.gtin, // Assuming GTIN can be used as MPN
            "brand": {
              "@type": "Brand",
              "name": product.brand,
            },
            "offers": {
              "@type": "AggregateOffer",
              "url": `https://www.beforetobuy.com/p/${product.id}`, // Placeholder URL, needs to be dynamic
              "priceCurrency": currentCountryInfo.currency,
              "lowPrice": lowestFeedTotal,
              "highPrice": sortedOffers[sortedOffers.length - 1]?.totalPrice ?? lowestFeedTotal,
              "offerCount": product.offers.length,
              "offers": sortedOffers.map((offer) => ({
                "@type": "Offer",
                "url": offer.purchaseUrl,
                "priceCurrency": offer.currency,
                "price": offer.totalPrice ?? computeTotalPrice(offer),
                "itemCondition": "https://schema.org/NewCondition", // Assuming new condition
                "availability": offer.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": offer.storeName,
                },
              })),
            },
            ...(product.rating && product.reviewsCount
              ? {
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": product.rating,
                    "reviewCount": product.reviewsCount,
                  },
                }
              : {}),
          }),
        }}
      />
      <div className="relative bg-slate-100/60 h-60 overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            {product.brand}
          </span>

          {verifiedBadgeOffer?.badge && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {verifiedBadgeOffer.badge}
            </span>
          )}
        </div>

        {product.rating !== undefined && product.reviewsCount !== undefined && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs">
            {ui.verifiedMerchantRating} {product.rating} ({product.reviewsCount})
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
          {(product.gtin || product.variantKey || freshestLabel) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
              {product.gtin && (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold">
                  {ui.gtinLabel} {product.gtin.replace(/^0+/, "") || product.gtin}
                </span>
              )}
              {product.variantKey && (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium">
                  {product.variantKey.replace(/\+/g, " · ")}
                </span>
              )}
              {freshestLabel && (
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium">
                  {freshestLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {pickupOffer && pickupOffer.nearbyBranch && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>{ui.clickAndCollectIn} {userLocation.city}</span>
                <span className="bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
                  {pickupOffer.nearbyBranch.distanceKm} {ui.kmAway}
                </span>
              </div>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                {pickupOffer.nearbyBranch.storeName} - {pickupOffer.nearbyBranch.branchName}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>
              {formatUi(ui.offersInCountry, { country: currentCountryInfo.name })}
            </span>
            <span>
              {formatUi(ui.comparePrices, { count: product.offers.length })}
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {sortedOffers.map((offer) => {
              const totalPrice = offer.totalPrice ?? computeTotalPrice(offer);
              const isLowestFeed =
                offer.source !== "demo" && totalPrice === lowestFeedTotal;
              const priceTrend = getPriceTrend(offer.priceHistory ?? []);
              const sourceLabel =
                offer.source === "production-live"
                  ? "Production feed"
                  : offer.source === "sample"
                    ? "Sample"
                    : "Demo";

              return (
                <div
                  key={offer.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isLowestFeed
                      ? "bg-emerald-50/50 border-emerald-300/80 hover:bg-emerald-100/50"
                      : "bg-slate-50 border-slate-200/60 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {offer.type === "local_pickup" ? (
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    ) : offer.type === "cross_border" ? (
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                    )}

                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>{offer.storeName}</span>
                      <span
                          className={`font-bold text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wide ${
                            offer.source === "production-live"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : offer.source === "sample"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-slate-200 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {offer.source === "production-live"
                            ? ui.liveOfferLabel
                            : offer.source === "sample"
                              ? ui.sampleOfferLabel
                              : ui.demoOfferLabel}
                        </span>
                        {isLowestFeed && (
                          <span className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded">
                            LOWEST TOTAL
                          </span>
                        )}
                        {priceTrend === "down" && (
                          <span className="bg-green-100 text-green-800 font-bold text-[9px] px-1.5 py-0.2 rounded">
                            {ui.priceDownLabel}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        <span>
                          {offer.source === "production-live"
                            ? offer.deliveryTime
                            : offer.source === "sample"
                              ? ui.sampleDeliveryDisclaimer
                              : ui.illustrativeEntryDisclaimer}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-black text-sm text-slate-900">
                        {currentCountryInfo.currencySymbol}
                        {totalPrice.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        {offer.source === "demo"
                          ? ui.illustrativeTotalDisclaimer
                          : offer.deliveryCost === 0
                            ? `${currentCountryInfo.currencySymbol}${offer.price.toLocaleString()} + ${ui.freeDelivery}`
                            : `${currentCountryInfo.currencySymbol}${offer.price.toLocaleString()} + ${offer.deliveryCost} ${ui.delivery}`}
                      </div>
                    </div>

                    <a
                      href={offer.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored nofollow"
                      onClick={(event) => handleAffiliateClick(event, offer)}
                      className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] shadow-xs group/btn shrink-0"
                      title={affiliate ? undefined : "Accept affiliate cookies to open store links"}
                    >
                      <span>{offer.source === "production-live" ? ui.viewOfferButton : ui.searchStoreButton}</span>
                      <ExternalLink className="w-3 h-3 opacity-80 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1.5">
            <Info className="w-3 h-3 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{ui.priceDisclaimer}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
