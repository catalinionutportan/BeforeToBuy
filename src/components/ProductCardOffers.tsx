import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { openConsentPreferences } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";
import { computeTotalPrice } from "@/lib/pricing/total-price";
import { getPriceTrend } from "@/lib/pricing/price-trend";
import { defaultLocaleFromCountry, type SiteLocale } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import {
  ExternalLink,
  Truck,
  Store,
  Globe,
  ShoppingBag,
  Info,
} from "lucide-react";

interface ProductCardOffersProps {
  product: Product;
  userLocation: UserLocation;
  onSelectOffer: (product: Product, offer: Offer) => void;
  locale?: SiteLocale;
  sortedOffers: Offer[];
  lowestFeedTotal?: number;
}

export function ProductCardOffers({
  product,
  userLocation,
  onSelectOffer,
  locale,
  sortedOffers,
  lowestFeedTotal,
}: ProductCardOffersProps) {
  const { affiliate } = useConsent();
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.RO;
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
    // Explicit open helps when the browser treats the click as a soft navigation.
    if (offer.purchaseUrl && offer.purchaseUrl !== "#") {
      event.preventDefault();
      window.open(offer.purchaseUrl, "_blank", "noopener,noreferrer");
    }
    onSelectOffer(product, offer);
  };

  const handleAffiliateAuxClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!affiliate) {
      event.preventDefault();
      openConsentPreferences();
    }
  };

  return (
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

          return (
            <div
              key={offer.id}
              className={`p-2.5 rounded-xl border text-xs flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between transition-all min-w-0 ${
                isLowestFeed
                  ? "bg-emerald-50/50 border-emerald-300/80 hover:bg-emerald-100/50"
                  : "bg-slate-50 border-slate-200/60 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {offer.type === "local_pickup" ? (
                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : offer.type === "cross_border" ? (
                  <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                )}

                <div className="min-w-0">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span className="break-words">{offer.storeName}</span>
                    <span
                      className={`font-bold text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wide ${
                        offer.source === "production-live"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : offer.badge
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : offer.source === "sample"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-slate-200 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {offer.source === "production-live"
                        ? ui.liveOfferLabel
                        : offer.badge
                          ? offer.badge
                        : offer.source === "sample"
                          ? ui.sampleOfferLabel
                          : ui.demoOfferLabel}
                    </span>
                    {isLowestFeed && (
                      <span className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded">
                        {ui.lowestTotalLabel}
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

              <div className="text-left sm:text-right flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pl-6 sm:pl-0">
                <div className="min-w-0">
                  <div className="font-black text-sm text-slate-900">
                    {currentCountryInfo.currencySymbol}
                    {totalPrice.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium break-words">
                    {offer.source === "demo"
                      ? ui.illustrativeTotalDisclaimer
                      : offer.deliveryCost === 0
                        ? `${currentCountryInfo.currencySymbol}${offer.price.toLocaleString()} + free ${ui.delivery.toLowerCase()}`
                        : `${currentCountryInfo.currencySymbol}${offer.price.toLocaleString()} + ${offer.deliveryCost} ${ui.delivery}`}
                  </div>
                </div>

                <a
                  href={affiliate ? offer.purchaseUrl : "#"}
                  target={affiliate ? "_blank" : undefined}
                  rel={affiliate ? "noopener noreferrer sponsored nofollow" : undefined}
                  onClick={(event) => handleAffiliateClick(event, offer)}
                  onAuxClick={handleAffiliateAuxClick}
                  className="bg-slate-900 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] shadow-xs group/btn shrink-0"
                  title={affiliate ? undefined : ui.acceptAffiliateCookiesHint}
                  aria-label={
                    affiliate
                      ? `${offer.source === "production-live" ? ui.viewOfferButton : ui.searchStoreButton} for ${offer.storeName}`
                      : ui.acceptAffiliateCookiesHint
                  }
                >
                  <span>
                    {affiliate
                      ? offer.source === "production-live"
                        ? ui.viewOfferButton
                        : ui.searchStoreButton
                      : ui.enableAffiliateToOpen}
                  </span>
                  <ExternalLink className="w-3 h-3 opacity-80 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-slate-400 space-y-1 pt-1.5">
        <div className="flex items-start gap-1">
          <Info className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
          <span>{ui.priceDisclaimer}</span>
        </div>
        <p className="pl-4">{ui.rankingDisclosure}</p>
      </div>
    </div>
  );
}
