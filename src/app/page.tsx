"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CountryCode, Offer, Product, PromoCoupon, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { detectUserLocation } from "@/lib/geolocation";
import { fetchProductsForLocation } from "@/lib/api-aggregator";
import { getActiveCouponsForCountry } from "@/lib/feed-parser";
import { Header } from "@/components/Header";
import { LocationBanner } from "@/components/LocationBanner";
import { ProductCard } from "@/components/ProductCard";
import { PromoCouponsSection } from "@/components/PromoCouponsSection";
import { AffiliateDisclosureModal } from "@/components/AffiliateDisclosureModal";
import {
  Laptop,
  Shirt,
  Home as HomeIcon,
  Car,
  SlidersHorizontal,
  Info,
  MapPin,
  Shield,
  Layers,
  SearchX,
  Flame,
  Building2,
  FileText,
  Lock,
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<"all" | "pickup" | "deals">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);

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

  // Fetch products & active vouchers when location, search, or category changes
  useEffect(() => {
    async function loadProductsAndCoupons() {
      setIsLoadingProducts(true);
      const prods = await fetchProductsForLocation(userLocation, searchQuery, selectedCategory);
      setProducts(prods);

      const activeCoupons = getActiveCouponsForCountry(userLocation.countryCode);
      setCoupons(activeCoupons);

      setIsLoadingProducts(false);
    }
    loadProductsAndCoupons();
  }, [userLocation, searchQuery, selectedCategory]);

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
  };

  // Handle live GPS re-scan
  const handleRefreshGps = async () => {
    setIsLocating(true);
    const loc = await detectUserLocation();
    setUserLocation(loc);
    setIsLocating(false);
  };

  const categories = [
    { id: "all", label: "All Categories", icon: Layers },
    { id: "electronics", label: "Electronics & Tech", icon: Laptop },
    { id: "fashion", label: "Fashion & Shoes", icon: Shirt },
    { id: "home", label: "Home & Appliances", icon: HomeIcon },
    { id: "auto", label: "Auto & Tires", icon: Car },
  ];

  // Filter products by pickup or deals view
  const displayedProducts = products.filter((prod) => {
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLocating={isLocating}
      />

      {/* GPS & Country Location Banner */}
      <LocationBanner
        userLocation={userLocation}
        onCountryChange={handleCountryChange}
        onRefreshGps={handleRefreshGps}
        isLocating={isLocating}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Promos & Vouchers Section Highlighted at Top */}
        <PromoCouponsSection coupons={coupons} userLocation={userLocation} />

        {/* Category & Filter Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 lg:pb-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Offer Filter */}
          <div className="flex items-center gap-2 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 shrink-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
            </span>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
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
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Comparing Deals in {userLocation.countryName}</span>
              <span className="text-slate-400 font-normal text-sm">({displayedProducts.length} items found)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prices & stock matched in real-time for <strong className="text-slate-800">{userLocation.city}</strong>
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
              No offers matching "{searchQuery}" in {userLocation.countryName}. Try clearing your search query or switching country filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
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
                onSelectOffer={(prod, offer) => {
                  console.log(`Redirecting to affiliate URL for ${prod.title} at ${offer.storeName}: ${offer.purchaseUrl}`);
                }}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                B2B
              </div>
              <div>
                <span className="text-white font-bold text-base block">BeforeToBuy.com</span>
                <span className="text-[10px] text-slate-500">
                  Operated by{" "}
                  <a href="https://portanx.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-semibold">
                    PortanX - Catalin Portan
                  </a>{" "}
                  (CHE-373.501.736)
                </span>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <Link href="/impressum" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Impressum
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Datenschutz / Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Terms (AGB)
              </Link>
              <span>•</span>
              <button onClick={() => setIsDisclosureOpen(true)} className="hover:text-emerald-400 text-slate-300 transition-colors">
                Affiliate Disclosure
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>
              © 2026 BeforeToBuy.com | PortanX - Catalin Portan, Flurstrasse 24, 3014 Bern, Switzerland. All rights reserved.
            </p>
            <p className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Powered by AWIN, Digitec Galaxus Merchant, Amazon Associates, 2Performant & CJ API Streams.
            </p>
          </div>
        </div>
      </footer>

      {/* Affiliate Disclosure Modal */}
      <AffiliateDisclosureModal
        isOpen={isDisclosureOpen}
        onClose={() => setIsDisclosureOpen(false)}
      />
    </div>
  );
}
