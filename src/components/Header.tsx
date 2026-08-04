"use client";

import Link from "next/link";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import {
  MapPin,
  Navigation,
  ShoppingBag,
  Globe,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";

interface HeaderProps {
  userLocation: UserLocation;
  onCountryChange: (countryCode: CountryCode) => void;
  onRefreshGps: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDomain?: string;
  onDomainChange?: (domain: string) => void;
  isLocating: boolean;
}

export function Header({
  userLocation,
  onCountryChange,
  onRefreshGps,
  searchQuery,
  onSearchChange,
  selectedDomain = "all",
  onDomainChange,
  isLocating,
}: HeaderProps) {
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro bar for free app & affiliate disclosure notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">100% Free Price Comparison & GPS Engine</span>
          </div>
          <span>•</span>
          <Link
            href="/stores"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline underline-offset-2"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Integrated Store Domains ({currentCountryInfo.merchantDomains.length} in {currentCountryInfo.code})</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400">
            Detected: <strong className="text-white">{userLocation.city}, {userLocation.countryName} {currentCountryInfo.flag}</strong>
          </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
            Beta Demo
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 bg-clip-text text-transparent">
                  BeforeToBuy.com
                </h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  GPS-Driven Local & Online Price Match
                </p>
              </div>
            </Link>

            {/* Mobile Country Selector */}
            <div className="md:hidden flex items-center gap-2">
              <select
                value={userLocation.countryCode}
                onChange={(e) => onCountryChange(e.target.value as CountryCode)}
                className="bg-slate-100 text-xs border-0 rounded-lg py-1.5 px-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar with Store Domain Filter */}
          <div className="flex-1 max-w-2xl flex items-center gap-2">
            
            {/* Merchant Domain Filter Selector */}
            {onDomainChange && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 px-2 py-2 rounded-xl border border-slate-200 shrink-0">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedDomain}
                  onChange={(e) => onDomainChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-0 outline-none cursor-pointer max-w-[130px] truncate"
                >
                  <option value="all">All Domains</option>
                  {currentCountryInfo.merchantDomains.map((m) => (
                    <option key={m.id} value={m.domain}>
                      {m.domain}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={
                  selectedDomain && selectedDomain !== "all"
                    ? `Search products on ${selectedDomain}`
                    : `Search products in ${userLocation.countryName}`
                }
                placeholder={
                  selectedDomain && selectedDomain !== "all"
                    ? `Search products on ${selectedDomain}...`
                    : `Search products, electronics, stores in ${userLocation.countryName}...`
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

          </div>

          {/* Desktop Country Selector & GPS Refresh Button */}
          <div className="hidden md:flex items-center gap-3">
            {/* GPS Refresh Button */}
            <button
              onClick={onRefreshGps}
              disabled={isLocating}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
              title="Rescan current GPS location"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-emerald-600" : "text-emerald-600"}`} />
              <span>{isLocating ? "Locating GPS..." : userLocation.isGps ? "GPS Active" : "Detect GPS"}</span>
            </button>

            {/* Country Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <Globe className="w-4 h-4 text-slate-500 ml-1" />
              <select
                value={userLocation.countryCode}
                onChange={(e) => onCountryChange(e.target.value as CountryCode)}
                className="bg-transparent text-xs font-semibold text-slate-800 border-0 outline-none pr-1 cursor-pointer"
              >
                {Object.values(COUNTRIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.currency})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
