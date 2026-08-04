"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CountryCode, Product, PromoCoupon, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { detectUserLocation } from "@/lib/geolocation";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { getActiveCouponsForCountry } from "@/lib/feed-parser";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Header } from "@/components/Header";
import { LocationBanner } from "@/components/LocationBanner";
import { ProductCard } from "@/components/ProductCard";
import { PromoCouponsSection } from "@/components/PromoCouponsSection";
import { AffiliateDisclosureModal } from "@/components/AffiliateDisclosureModal";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import { ALL_CATEGORIES_ID, getCategoryLabel } from "@/lib/categories";
import {
  SlidersHorizontal,
  Info,
  MapPin,
  SearchX,
  Flame,
  Store,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.lat,
    longitude: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.lng,
    countryCode: DEFAULT_COUNTRY,
    countryName: COUNTRIES[DEFAULT_COUNTRY].name,
    city: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.city,
    isGps: false,
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearchQuery = useDebouncedValue(searchInput, 350);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_ID);
  const [filterType, setFilterType] = useState<"all" | "pickup" | "deals">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);

  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;

  // Initialize GPS or IP Location on mount
  useEffect(() => {
    async function initLocation() {
      setIsLocating(true);
      const loc = await detectUserLocation();
      setUserLocation(loc);
      setIsLocating(false);
    }
    initLocation();
  }, []);

  // Read ?category= or ?q= from URL (links from /categories and /stores pages)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const q = params.get("q");
    if (cat) setSelectedCategory(cat);
    if (q) setSearchInput(q);
  }, []);

  // Fetch products when location, debounced search, or category changes
  useEffect(() => {
    async function loadProductsAndCoupons() {
      setIsLoadingProducts(true);
      const prods = await fetchProductsForLocation(userLocation, debouncedSearchQuery, selectedCategory);
      setProducts(prods);

      const activeCoupons = getActiveCouponsForCountry(userLocation.countryCode);
      setCoupons(activeCoupons);

      setIsLoadingProducts(false);
    }
    loadProductsAndCoupons();
  }, [userLocation, debouncedSearchQuery, selectedCategory]);

  // Handle manual country change
  const handleCountryChange = (countryCode: CountryCode) => {
    const targetCountry = COUNTRIES[countryCode] || COUNTRIES.CH;
    setUserLocation((prev) => ({
      ...prev,
      countryCode,
      countryName: targetCountry.name,
      city: targetCountry.defaultCoordinates.city,
      latitude: targetCountry.defaultCoordinates.lat,
      longitude: targetCountry.defaultCoordinates.lng,
      isGps: false,
    }));
    setSelectedDomain("all");
  };

  // Handle live GPS re-scan
  const handleRefreshGps = async () => {
    setIsLocating(true);
    const loc = await detectUserLocation();
    setUserLocation(loc);
    setIsLocating(false);
  };

  // Filter products by pickup, deals, or domain view
  const displayedProducts = products.filter((prod) => {
    // Filter by specific merchant domain if selected
    if (selectedDomain !== "all") {
      const hasOfferInDomain = prod.offers.some((o) =>
        o.storeName.toLowerCase().includes(selectedDomain.split(".")[0].toLowerCase()) ||
        o.purchaseUrl.toLowerCase().includes(selectedDomain.toLowerCase())
      );
      if (!hasOfferInDomain) return false;
    }

    if (filterType === "pickup") {
      return prod.offers.some((o) => o.type === "local_pickup");
    }
    if (filterType === "deals") {
      return prod.offers.some((o) => o.originalPrice || o.discountPercentage);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        userLocation={userLocation}
        onCountryChange={handleCountryChange}
        onRefreshGps={handleRefreshGps}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedDomain={selectedDomain}
        onDomainChange={setSelectedDomain}
        isLocating={isLocating}
      />

      {/* GPS & Country Location Banner */}
      <LocationBanner
        userLocation={userLocation}
        onCountryChange={handleCountryChange}
        onRefreshGps={handleRefreshGps}
        isLocating={isLocating}
      />

      {/* Merchant Stores & Integrated Domains Banner Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            <span className="font-extrabold text-emerald-400 shrink-0 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Filter Domain:
            </span>

            <button
              onClick={() => setSelectedDomain("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                selectedDomain === "all"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              All Stores ({currentCountryInfo.merchantDomains.length})
            </button>

            {currentCountryInfo.merchantDomains.map((merchant) => (
              <button
                key={merchant.id}
                onClick={() => setSelectedDomain(merchant.domain)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer border ${
                  selectedDomain === merchant.domain
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                }`}
              >
                {merchant.domain}
              </button>
            ))}
          </div>

          <Link
            href="/stores"
            className="text-slate-300 hover:text-emerald-400 font-bold shrink-0 inline-flex items-center gap-1 text-[11px] hover:underline"
          >
            <span>Full Stores Directory ({COUNTRIES.CH.merchantDomains.length + COUNTRIES.DE.merchantDomains.length}+)</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </Link>

        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Promos & Vouchers Section Highlighted at Top */}
        <PromoCouponsSection coupons={coupons} userLocation={userLocation} />

        {/* BeforeToBuy category modules + comparison filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <CategoryNavigation
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Quick Offer Filter */}
          <div className="flex items-center gap-2 border-t border-slate-100 pt-3 shrink-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
            </span>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 flex-wrap">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All Offers
              </button>
              <button
                onClick={() => setFilterType("deals")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "deals"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Price Drops & Deals</span>
              </button>
              <button
                onClick={() => setFilterType("pickup")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  filterType === "pickup"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Click & Collect Nearby</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Bar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Comparing Deals in {userLocation.countryName}</span>
              {selectedCategory !== ALL_CATEGORIES_ID && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md border border-emerald-300">
                  {getCategoryLabel(selectedCategory)}
                </span>
              )}
              {selectedDomain !== "all" && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md border border-emerald-300">
                  Store Domain: {selectedDomain}
                </span>
              )}
              <span className="text-slate-400 font-normal text-sm">({displayedProducts.length} items found)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Demo catalog prices for <strong className="text-slate-800">{userLocation.city}</strong> — confirm final price on the merchant site
            </p>
          </div>

          <button
            onClick={() => setIsDisclosureOpen(true)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5" />
            <span>How Commissions Work (100% Free)</span>
          </button>
        </div>

        {/* Products Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-6 h-96 animate-pulse flex flex-col justify-between space-y-4"
              >
                <div className="bg-slate-200 rounded-xl h-48 w-full" />
                <div className="space-y-2">
                  <div className="bg-slate-200 h-4 rounded w-3/4" />
                  <div className="bg-slate-200 h-3 rounded w-1/2" />
                </div>
                <div className="bg-slate-200 h-10 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">No products found</h4>
            <p className="text-xs text-slate-500">
              No offers matching "{debouncedSearchQuery}" {selectedDomain !== "all" ? `on ${selectedDomain}` : ""} in {userLocation.countryName}. Try resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchInput("");
                setSelectedDomain("all");
                setSelectedCategory(ALL_CATEGORIES_ID);
                setFilterType("all");
              }}
              className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                userLocation={userLocation}
                onSelectOffer={() => {
                  // Affiliate redirect handled by the browser via purchaseUrl
                }}
              />
            ))}
          </div>
        )}

      </main>

      <AffiliateDisclosureModal
        isOpen={isDisclosureOpen}
        onClose={() => setIsDisclosureOpen(false)}
      />
    </div>
  );
}
