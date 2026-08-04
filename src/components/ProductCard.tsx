"use client";

import Image from "next/image";
import { Offer, Product, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { openConsentPreferences } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";
import {
  ExternalLink,
  MapPin,
  Truck,
  Star,
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
}

export function ProductCard({
  product,
  userLocation,
  onSelectOffer,
}: ProductCardProps) {
  const { affiliate } = useConsent();
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;

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

  const sortedOffers = [...product.offers].sort((a, b) => a.price - b.price);
  const bestOffer = sortedOffers[0];
  const lowestPrice = bestOffer ? bestOffer.price : 0;

  const pickupOffer = product.offers.find(
    (o) => o.type === "local_pickup" && o.nearbyBranch
  );

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
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

          {bestOffer?.badge && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {bestOffer.badge}
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-800 shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{product.rating}</span>
          <span className="text-slate-400 font-normal text-[10px]">({product.reviewsCount})</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-2 hover:text-emerald-700 transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
        </div>

        {pickupOffer && pickupOffer.nearbyBranch && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Click & Collect in {userLocation.city}</span>
                <span className="bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded text-[10px]">
                  {pickupOffer.nearbyBranch.distanceKm} km away
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
            <span>Offers in {currentCountryInfo.name}</span>
            <span>{product.offers.length} stores compare</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {product.offers.map((offer) => {
              const isCheapest = offer.price === lowestPrice;

              return (
                <div
                  key={offer.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isCheapest
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
                            offer.source === "live"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-slate-200 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {offer.source === "live" ? "Live" : "Demo"}
                        </span>
                        {isCheapest && (
                          <span className="bg-emerald-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded">
                            BEST PRICE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        <span>{offer.deliveryTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-black text-sm text-slate-900">
                        {currentCountryInfo.currencySymbol}
                        {offer.price.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        {offer.deliveryCost === 0 ? "Free Shipping" : `+${offer.deliveryCost} delivery`}
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
                      <span>Search Store</span>
                      <ExternalLink className="w-3 h-3 opacity-80 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1.5">
            <Info className="w-3 h-3 shrink-0 text-slate-400" aria-hidden="true" />
            <span>Beta/Demo prices only. Confirm availability and final price on the merchant website before buying.</span>
          </div>
        </div>
      </div>
    </article>
  );
}
