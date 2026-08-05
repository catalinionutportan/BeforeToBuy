"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CountryCode, Product, PromoCoupon, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  CONSENT_UPDATED_EVENT,
  getConsentPreferences,
  openConsentPreferences,
} from "@/lib/consent";
import { detectUserLocationGps, getLocationFromIp } from "@/lib/geolocation";
import { getActiveCouponsForCountry } from "@/lib/feed-parser";
import type { ProductFetchMeta } from "@/lib/product-service";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Header } from "@/components/Header";
import { LocationBanner } from "@/components/LocationBanner";
import { ProductCard } from "@/components/ProductCard";
import { PromoCouponsSection } from "@/components/PromoCouponsSection";
import { AffiliateDisclosureModal } from "@/components/AffiliateDisclosureModal";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import {
  CollectionNavigation,
  isActiveCollectionSelection,
} from "@/components/CollectionNavigation";
import { OfferFilters } from "@/components/OfferFilters";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import {
  CATEGORY_UI,
  formatCategoryUi,
  getLocalizedCategoryLabel,
  localeFromCountry,
} from "@/lib/category-i18n";
import {
  applyOfferFilters,
  collectBrandOptions,
  hasActiveOfferFilters,
  parseOfferFiltersFromSearchParams,
  writeOfferFiltersToSearchParams,
  type OfferFilterCriteria,
} from "@/lib/offers/offer-filters";
import {
  Info,
  SearchX,
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
  const [offerFilters, setOfferFilters] = useState<OfferFilterCriteria>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);
  const [catalogMeta, setCatalogMeta] = useState<ProductFetchMeta | null>(null);

  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const browseLocale = localeFromCountry(userLocation.countryCode);
  const categoryUi = CATEGORY_UI[browseLocale];
  const crossBorderCollectionActive = selectedCategory === "compare-cross-border";
  const domainFilterMerchants = currentCountryInfo.merchantDomains.filter(
    (merchant) => crossBorderCollectionActive || !merchant.isCrossBorder
  );
  const activeOfferFilters: OfferFilterCriteria = {
    ...offerFilters,
    domain: selectedDomain,
  };

  // IP location only after Location consent (no auto-GPS)
  useEffect(() => {
    async function initIpLocation() {
      setIsLocating(true);
      const loc = await getLocationFromIp();
      setUserLocation(loc);
      setIsLocating(false);
    }

    const prefs = getConsentPreferences();
    if (prefs?.location) {
      initIpLocation();
    }

    const onConsentUpdated = () => {
      const updated = getConsentPreferences();
      if (updated?.location) {
        initIpLocation();
      }
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, []);

  // Read shareable browse state and respond to browser back/forward navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readBrowseState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(params.get("category") || ALL_CATEGORIES_ID);
      setSearchInput(params.get("q") || "");
      const parsed = parseOfferFiltersFromSearchParams(params);
      setSelectedDomain(parsed.domain || "all");
      setOfferFilters({
        brand: parsed.brand,
        inStockOnly: parsed.inStockOnly,
        freeDeliveryOnly: parsed.freeDeliveryOnly,
        maxTotalPrice: parsed.maxTotalPrice,
        hasGtinOnly: parsed.hasGtinOnly,
      });
    };

    readBrowseState();
    window.addEventListener("popstate", readBrowseState);
    return () => window.removeEventListener("popstate", readBrowseState);
  }, []);

  // Keep `q` shareable in the URL after debounce.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const nextQ = debouncedSearchQuery.trim();
    const currentQ = url.searchParams.get("q") || "";
    if (nextQ === currentQ) return;
    if (nextQ) url.searchParams.set("q", nextQ);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [debouncedSearchQuery]);

  // Fetch products when location, debounced search, or category changes
  useEffect(() => {
    async function loadProductsAndCoupons() {
      setIsLoadingProducts(true);

      try {
        const params = new URLSearchParams({
          country: userLocation.countryCode,
          lat: String(userLocation.latitude),
          lng: String(userLocation.longitude),
        });

        if (debouncedSearchQuery.trim()) {
          params.set("q", debouncedSearchQuery.trim());
        }

        if (selectedCategory !== ALL_CATEGORIES_ID) {
          params.set("category", selectedCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Product API request failed");
        }

        const data = (await response.json()) as {
          products: Product[];
          meta: ProductFetchMeta;
        };

        setProducts(data.products || []);
        setCatalogMeta(data.meta || null);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
        setCatalogMeta(null);
      }

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

  const syncBrowseUrl = (
    categoryId: string,
    domain: string,
    filters: OfferFilterCriteria,
    query?: string
  ) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (categoryId === ALL_CATEGORIES_ID) url.searchParams.delete("category");
    else url.searchParams.set("category", categoryId);

    const q = (query ?? debouncedSearchQuery).trim();
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");

    writeOfferFiltersToSearchParams(url, { ...filters, domain });
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    syncBrowseUrl(categoryId, selectedDomain, offerFilters);
  };

  const handleCollectionChange = (filterId: string) => {
    handleCategoryChange(filterId === ALL_CATEGORIES_ID ? ALL_CATEGORIES_ID : filterId);
  };

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    syncBrowseUrl(selectedCategory, domain, offerFilters);
  };

  const handleOfferFiltersChange = (next: OfferFilterCriteria) => {
    const { domain: _ignored, ...rest } = next;
    setOfferFilters(rest);
    syncBrowseUrl(selectedCategory, selectedDomain, rest);
  };

  const resetAllFilters = () => {
    setSearchInput("");
    setSelectedDomain("all");
    setOfferFilters({});
    setSelectedCategory(ALL_CATEGORIES_ID);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("category");
      url.searchParams.delete("q");
      writeOfferFiltersToSearchParams(url, {});
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  // Drop cross-border domain chip selection when leaving that collection.
  useEffect(() => {
    if (crossBorderCollectionActive || selectedDomain === "all") return;
    const selected = currentCountryInfo.merchantDomains.find(
      (merchant) => merchant.domain === selectedDomain
    );
    if (selected?.isCrossBorder) {
      setSelectedDomain("all");
      syncBrowseUrl(selectedCategory, "all", offerFilters);
    }
  }, [crossBorderCollectionActive, currentCountryInfo, selectedDomain]);

  // GPS only on explicit user action and with Location consent
  const handleRefreshGps = async () => {
    const prefs = getConsentPreferences();
    if (!prefs?.location) {
      openConsentPreferences();
      return;
    }

    setIsLocating(true);
    const loc = await detectUserLocationGps();
    setUserLocation(loc);
    setIsLocating(false);
  };

  const brandOptions = collectBrandOptions(products);
  const displayedProducts = applyOfferFilters(products, activeOfferFilters);
  const filtersActiveBeyondCategory = hasActiveOfferFilters(activeOfferFilters);

  const showCategoryEmptyState =
    !isLoadingProducts &&
    displayedProducts.length === 0 &&
    selectedCategory !== ALL_CATEGORIES_ID &&
    debouncedSearchQuery.trim() === "" &&
    !filtersActiveBeyondCategory;

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
        onDomainChange={handleDomainChange}
        isLocating={isLocating}
      />

      {/* GPS & Country Location Banner */}
      <LocationBanner
        userLocation={userLocation}
        onCountryChange={handleCountryChange}
        onRefreshGps={handleRefreshGps}
        isLocating={isLocating}
        productionOfferCount={catalogMeta?.productionOfferCount || 0}
        sampleOfferCount={catalogMeta?.sampleOfferCount || 0}
      />

      {/* Merchant Stores & Integrated Domains Banner Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            <span className="font-extrabold text-emerald-400 shrink-0 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Filter Domain:
            </span>

            <button
              onClick={() => handleDomainChange("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                selectedDomain === "all"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              All Stores ({domainFilterMerchants.length})
            </button>

            {domainFilterMerchants.map((merchant) => (
              <button
                key={merchant.id}
                onClick={() => handleDomainChange(merchant.domain)}
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
            onCategoryChange={handleCategoryChange}
            categoryCounts={catalogMeta?.categoryCounts}
            locale={browseLocale}
          />

          <CollectionNavigation
            selectedCategory={selectedCategory}
            onCollectionChange={handleCollectionChange}
            collectionCounts={catalogMeta?.collectionCounts}
            locale={browseLocale}
          />

          <OfferFilters
            criteria={activeOfferFilters}
            brandOptions={brandOptions}
            currencySymbol={currentCountryInfo.currency}
            onChange={handleOfferFiltersChange}
          />
        </div>

        {/* Results Bar Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Comparing Deals in {userLocation.countryName}</span>
              {selectedCategory !== ALL_CATEGORIES_ID && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md border border-emerald-300">
                  {getLocalizedCategoryLabel(selectedCategory, browseLocale)}
                </span>
              )}
              {selectedDomain !== "all" && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md border border-emerald-300">
                  Store Domain: {selectedDomain}
                </span>
              )}
              {offerFilters.brand && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  Brand: {offerFilters.brand}
                </span>
              )}
              {offerFilters.maxTotalPrice != null && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  ≤ {offerFilters.maxTotalPrice} {currentCountryInfo.currency}
                </span>
              )}
              {offerFilters.inStockOnly && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  In stock
                </span>
              )}
              {offerFilters.freeDeliveryOnly && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  Free delivery
                </span>
              )}
              {offerFilters.hasGtinOnly && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  Has GTIN
                </span>
              )}
              <span className="text-slate-400 font-normal text-sm">({displayedProducts.length} items found)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {catalogMeta &&
              (catalogMeta.productionOfferCount > 0 || catalogMeta.sampleOfferCount > 0) ? (
                <>
                  Hybrid catalog for <strong className="text-slate-800">{userLocation.city}</strong> —{" "}
                  {catalogMeta.productionOfferCount > 0 && (
                    <><strong className="text-emerald-700">{catalogMeta.productionOfferCount} production-feed offer(s)</strong>.{" "}</>
                  )}
                  {catalogMeta.sampleOfferCount > 0 && (
                    <><strong className="text-amber-700">{catalogMeta.sampleOfferCount} sample offer(s)</strong> are illustrative and not live.{" "}</>
                  )}
                  Other merchants remain demo. Confirm final price on the merchant site.
                </>
              ) : (
                <>
                  Demo catalog prices for <strong className="text-slate-800">{userLocation.city}</strong> — confirm final price on the merchant site
                </>
              )}
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
        ) : showCategoryEmptyState ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">{categoryUi.emptyCategoryTitle}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {formatCategoryUi(categoryUi.emptyCategoryBody, {
                country: userLocation.countryName,
              })}
            </p>
            <p className="text-[11px] text-slate-400">
              {getLocalizedCategoryLabel(selectedCategory, browseLocale)}
              {isActiveCollectionSelection(selectedCategory)
                ? " · comparison collection"
                : ""}
            </p>
            <button
              onClick={resetAllFilters}
              className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              {categoryUi.resetFilters}
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">No products found</h4>
            <p className="text-xs text-slate-500">
              No offers matching
              {debouncedSearchQuery.trim() ? ` "${debouncedSearchQuery}"` : " the current filters"}
              {selectedDomain !== "all" ? ` on ${selectedDomain}` : ""} in {userLocation.countryName}.
              Try resetting filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              {categoryUi.resetFilters}
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
