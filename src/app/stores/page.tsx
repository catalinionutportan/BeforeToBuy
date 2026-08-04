"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_MERCHANT_DOMAINS, COUNTRIES } from "@/lib/countries";
import { CountryCode, MerchantDomainInfo } from "@/types";
import {
  Store,
  Globe,
  Search,
  ExternalLink,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Filter,
  ArrowRight,
  Layers,
  Sparkles,
  Building2,
} from "lucide-react";

export default function StoresDirectoryPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterNetwork, setFilterNetwork] = useState<string>("all");

  const filteredDomains = ALL_MERCHANT_DOMAINS.filter((merchant) => {
    // Country filter
    if (selectedCountry !== "all" && merchant.countryCode !== selectedCountry) {
      return false;
    }

    // Network filter
    if (
      filterNetwork !== "all" &&
      !merchant.affiliateNetwork.toLowerCase().includes(filterNetwork.toLowerCase())
    ) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        merchant.name.toLowerCase().includes(q) ||
        merchant.domain.toLowerCase().includes(q) ||
        merchant.category.toLowerCase().includes(q) ||
        merchant.description.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all"
          >
            ← Back to BeforeToBuy.com
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Integrated Merchant Domains Directory
          </span>
        </div>

        {/* Hero Header */}
        <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Merchant Directory
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Integrated Store Domains & Merchant Directory
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            BeforeToBuy.com directly indexes and aggregates live price comparison data, flash vouchers, and local Click & Collect stock from top verified merchant domains across Switzerland, Germany, France, Romania, UK, and USA.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span><strong>{ALL_MERCHANT_DOMAINS.length} Verified Domains</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>6 Primary Countries (CH, DE, FR, RO, GB, US)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AWIN, Amazon, Galaxus, 2Performant & CJ Networks</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Domain Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant domain e.g. digitec.ch, amazon.de, brack.ch, emag.ro..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full px-2 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Network Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Network:
              </span>
              <select
                value={filterNetwork}
                onChange={(e) => setFilterNetwork(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">All Affiliate Networks</option>
                <option value="galaxus">Galaxus Merchant</option>
                <option value="awin">AWIN Network</option>
                <option value="amazon">Amazon Associates</option>
                <option value="2performant">2Performant Romania</option>
                <option value="cj">CJ Affiliate</option>
              </select>
            </div>

          </div>

          {/* Country Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedCountry("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCountry === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Regions ({ALL_MERCHANT_DOMAINS.length})
            </button>

            {Object.values(COUNTRIES).map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedCountry === country.code
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-[10px] opacity-75">({country.merchantDomains.length})</span>
              </button>
            ))}
          </div>

        </div>

        {/* Merchant Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.map((merchant) => {
            const countryInfo = COUNTRIES[merchant.countryCode];

            return (
              <div
                key={merchant.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  
                  {/* Top Bar: Country & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-200/80">
                      <span>{countryInfo?.flag}</span>
                      <span>{countryInfo?.name}</span>
                    </span>

                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {merchant.status}
                    </span>
                  </div>

                  {/* Domain Title & URL */}
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                        {merchant.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {merchant.domain}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {merchant.description}
                    </p>
                  </div>

                  {/* Badges & Meta Details */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-400">Category:</span>
                      <span className="font-bold text-slate-800">{merchant.category}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-400">Network:</span>
                      <span className="font-bold text-emerald-800">{merchant.affiliateNetwork}</span>
                    </div>

                    {merchant.hasClickAndCollect && (
                      <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-bold pt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supports Local GPS Click & Collect Pickup</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={merchant.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Visit Site</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <Link
                    href={`/?q=${encodeURIComponent(merchant.domain.split(".")[0])}`}
                    className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>Compare Deals</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {filteredDomains.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <Store className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No merchant domains found</h3>
            <p className="text-xs text-slate-500">
              No integrated merchant store matches "{searchQuery}". Try changing your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCountry("all");
                setFilterNetwork("all");
              }}
              className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Reset Domain Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
