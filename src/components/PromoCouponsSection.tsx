"use client";

import { useState } from "react";
import { PromoCoupon, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { Ticket, Copy, Check, ExternalLink, Flame, Sparkles, Clock } from "lucide-react";

interface PromoCouponsSectionProps {
  coupons: PromoCoupon[];
  userLocation: UserLocation;
}

export function PromoCouponsSection({
  coupons,
  userLocation,
}: PromoCouponsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;

  const handleCopyCode = (coupon: PromoCoupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (coupons.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-orange-200/80 rounded-3xl p-6 sm:p-8 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Coupons & Vouchers in {userLocation.countryName}</span>
              <span className="text-2xl">{currentCountryInfo.flag}</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Copy promo code and apply at store checkout for instant discounts
            </p>
          </div>
        </div>

        <span className="bg-orange-500/15 text-orange-700 font-extrabold text-xs px-3 py-1.5 rounded-full border border-orange-500/30 flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          {coupons.length} Active Codes Today
        </span>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => {
          const isCopied = copiedId === coupon.id;

          return (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {coupon.storeName}
                  </span>
                  <span className="bg-rose-100 text-rose-700 font-black text-xs px-2.5 py-0.5 rounded-full border border-rose-200">
                    {coupon.discountValue}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                  {coupon.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {coupon.description}
                </p>
              </div>

              {/* Code Box & Actions */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" /> Valid until: {coupon.expiryDate}
                  </span>
                  <span className="font-semibold text-slate-600 uppercase">{coupon.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Code box */}
                  <div className="flex-1 bg-slate-100 border border-dashed border-slate-300 rounded-xl px-3 py-2 flex items-center justify-between font-mono font-bold text-xs text-slate-800">
                    <span>{coupon.code}</span>
                    <button
                      onClick={() => handleCopyCode(coupon)}
                      className="text-slate-500 hover:text-slate-900 transition-colors"
                      title="Copy code"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Go to store button */}
                  <a
                    href={coupon.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>Use Code</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
