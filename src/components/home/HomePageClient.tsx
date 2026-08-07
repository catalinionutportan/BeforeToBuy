"use client";

import { useEffect, useState, Suspense, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CountryCode, Product, PromoCoupon } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { getActiveCouponsForCountry } from "@/lib/feed-parser";
import type { ProductFetchMeta } from "@/lib/product-service";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Header } from "@/components/Header";
import { LocationBanner } from "@/components/LocationBanner";
import { MarketHubTabs } from "@/components/MarketHubTabs";
import { ProductCard } from "@/components/ProductCard";
import { PromoCouponsSection } from "@/components/PromoCouponsSection";
import { MarketEntryHero } from "@/components/MarketEntryHero";
import { PlatformExplanationBanner } from "@/components/PlatformExplanationBanner";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import {
  CollectionNavigation,
  isActiveCollectionSelection,
} from "@/components/CollectionNavigation";
import { OfferFilters } from "@/components/OfferFilters";
import { ALL_CATEGORIES_ID, productMatchesCategoryFilter } from "@/lib/categories";
import {
  MARKET_HUB_TABS,
  defaultMarketHubForCountry,
  isMarketHubId,
} from "@/lib/market-hubs";
import {
  CATEGORY_UI,
  OFFER_FILTER_UI,
  formatCategoryUi,
  getLocalizedCategoryLabel,
} from "@/lib/category-i18n";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import type { SiteLocale } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import {
  applyOfferFilters,
  collectBrandOptions,
  hasActiveOfferFilters,
  parseOfferFiltersFromSearchParams,
  writeOfferFiltersToSearchParams,
  type OfferFilterCriteria,
} from "@/lib/offers/offer-filters";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  Info,
  SearchX,
  Store,
  ArrowRight,
} from "lucide-react";
import { sanitizeString } from "@/lib/utils/sanitization";

const AffiliateDisclosureModal = dynamic(
  () =>
    import("@/components/AffiliateDisclosureModal").then((mod) => ({
      default: mod.AffiliateDisclosureModal,
    })),
  {
    ssr: false,
  }
);

interface HomePageClientProps {
  /** Server-fetched catalog for the default browse location, used for first paint. */
  initialProducts?: Product[];
  initialMeta?: ProductFetchMeta | null;
  /** Set when the server-side initial catalog fetch failed, so we can surface an error instead of an empty grid. */
  initialFetchFailed?: boolean;
}

export default function HomePageClient({
  initialProducts = [],
  initialMeta = null,
  initialFetchFailed = false,
}: HomePageClientProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearchQuery = useDebouncedValue(searchInput, 350);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_ID);
  const [visibleCount, setVisibleCount] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [offerFilters, setOfferFilters] = useState<OfferFilterCriteria>({});
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(
    initialProducts.length === 0 && !initialFetchFailed
  );
  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);
  const [catalogMeta, setCatalogMeta] = useState<ProductFetchMeta | null>(initialMeta);
  const [productFetchFailed, setProductFetchFailed] = useState<boolean>(initialFetchFailed);

  const { userLocation, isLocating, errorMessage, handleCountryChange, handleRefreshGps } = useUserLocation();

  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.CH;
  const {
    locale: browseLocale,
    setLocale: setBrowseLocale,
    availableLocales,
  } = useBrowseLocale(userLocation.countryCode);
  const categoryUi = CATEGORY_UI[browseLocale];
  const offerFilterUi = OFFER_FILTER_UI[browseLocale];
  const homeUi = HOME_UI[browseLocale];
  const crossBorderCollectionActive = selectedCategory === "compare-cross-border";
  const domainFilterMerchants = useMemo(
    () =>
      currentCountryInfo.merchantDomains.filter(
        (merchant) => crossBorderCollectionActive || !merchant.isCrossBorder
      ),
    [currentCountryInfo.merchantDomains, crossBorderCollectionActive]
  );
  const activeOfferFilters: OfferFilterCriteria = {
    ...offerFilters,
    domain: selectedDomain,
  };

  // Read shareable browse state and respond to browser back/forward navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readBrowseState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedCategory(
        params.get("category") || defaultMarketHubForCountry(userLocation.countryCode)
      );
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
  }, [userLocation.countryCode]);

  // When switching market without an explicit category URL, use country default hub.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("category")) return;
    const next = defaultMarketHubForCountry(userLocation.countryCode);
    setSelectedCategory(next);
  }, [userLocation.countryCode]);

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

  // Fetch products when location, debounced search, category, or browse locale changes
  useEffect(() => {
    async function loadProductsAndCoupons() {
      setIsLoadingProducts(true);

      try {
        const params = new URLSearchParams({
          country: userLocation.countryCode,
          lat: String(userLocation.latitude),
          lng: String(userLocation.longitude),
          locale: browseLocale,
        });

        if (debouncedSearchQuery.trim()) {
          params.set("q", debouncedSearchQuery.trim());
        }

        // Fetch full market catalog; hub/department tabs filter client-side.
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
        setProductFetchFailed(false);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
        setCatalogMeta(null);
        setProductFetchFailed(true);
      } finally {
        setIsLoadingProducts(false);
      }

      const activeCoupons = getActiveCouponsForCountry(userLocation.countryCode);
      setCoupons(activeCoupons);
    }
    loadProductsAndCoupons();
  }, [userLocation, debouncedSearchQuery, browseLocale, setProducts, setCatalogMeta, setCoupons]);

  const syncBrowseUrl = useCallback(
    (
      categoryId: string,
      domain: string,
      filters: OfferFilterCriteria,
      query?: string
    ) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);

      // Keep real app paths only — locale is a client preference, not a URL prefix.
      if (categoryId === ALL_CATEGORIES_ID) url.searchParams.delete("category");
      else url.searchParams.set("category", categoryId);

      const q = (query ?? debouncedSearchQuery).trim();
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");

      writeOfferFiltersToSearchParams(url, { ...filters, domain });
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    },
    [debouncedSearchQuery]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      syncBrowseUrl(categoryId, selectedDomain, offerFilters);
    },
    [syncBrowseUrl, selectedDomain, offerFilters]
  );

  const handleCollectionChange = useCallback(
    (filterId: string) => {
      handleCategoryChange(filterId === ALL_CATEGORIES_ID ? ALL_CATEGORIES_ID : filterId);
    },
    [handleCategoryChange]
  );

  const handleInternalDomainChange = useCallback(
    (domain: string) => {
      setSelectedDomain(domain);
      syncBrowseUrl(selectedCategory, domain, offerFilters);
    },
    [syncBrowseUrl, selectedCategory, offerFilters]
  );

  const handleOfferFiltersChange = useCallback(
    (next: OfferFilterCriteria) => {
      const { domain: _ignored, ...rest } = next;
      setOfferFilters(rest);
      syncBrowseUrl(selectedCategory, selectedDomain, rest);
    },
    [syncBrowseUrl, selectedCategory, selectedDomain]
  );

  const resetAllFilters = useCallback(() => {
    const defaultHub = defaultMarketHubForCountry(userLocation.countryCode);
    setSearchInput("");
    setSelectedDomain("all");
    setOfferFilters({});
    setSelectedCategory(defaultHub);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (defaultHub === ALL_CATEGORIES_ID) url.searchParams.delete("category");
      else url.searchParams.set("category", defaultHub);
      url.searchParams.delete("q");
      writeOfferFiltersToSearchParams(url, {});
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [
    setSearchInput,
    setSelectedDomain,
    setOfferFilters,
    setSelectedCategory,
    userLocation.countryCode,
  ]);

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
  }, [crossBorderCollectionActive, currentCountryInfo, selectedDomain, syncBrowseUrl, selectedCategory, offerFilters]);


  const brandOptions = useMemo(() => collectBrandOptions(products), [products]);
  const categoryFilteredProducts = useMemo(
    () =>
      products.filter((product) => productMatchesCategoryFilter(product, selectedCategory)),
    [products, selectedCategory]
  );
  const displayedProducts = useMemo(
    () => applyOfferFilters(categoryFilteredProducts, activeOfferFilters),
    [categoryFilteredProducts, activeOfferFilters]
  );
  const filtersActiveBeyondCategory = useMemo(() => hasActiveOfferFilters(activeOfferFilters), [activeOfferFilters]);
  const hubCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const hub of MARKET_HUB_TABS) {
      counts[hub.id] = products.filter((product) =>
        productMatchesCategoryFilter(product, hub.id)
      ).length;
    }
    return counts;
  }, [products]);
  const visibleProducts = useMemo(
    () => displayedProducts.slice(0, visibleCount),
    [displayedProducts, visibleCount]
  );

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedDomain, offerFilters, debouncedSearchQuery, userLocation.countryCode]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) =>
            count >= displayedProducts.length ? count : Math.min(count + 12, displayedProducts.length)
          );
        }
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [displayedProducts.length]);

  const handleHubChange = useCallback(
    (hubId: string) => {
      setSelectedCategory(hubId);
      syncBrowseUrl(hubId, selectedDomain, offerFilters);
    },
    [syncBrowseUrl, selectedDomain, offerFilters]
  );

  const showCategoryEmptyState =
    !isLoadingProducts &&
    displayedProducts.length === 0 &&
    selectedCategory !== ALL_CATEGORIES_ID &&
    debouncedSearchQuery.trim() === "" &&
    !filtersActiveBeyondCategory;

  return (
    <div className="w-full bg-slate-50 font-sans">
      
      {/* Header */}
      <Header
        userLocation={userLocation}
        onCountryChange={handleCountryChange}
        onRefreshGps={handleRefreshGps}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedDomain={selectedDomain}
        onDomainChange={handleInternalDomainChange}
        isLocating={isLocating}
        locale={browseLocale}
        onLocaleChange={setBrowseLocale}
        availableLocales={availableLocales}
      />

      {/* GPS & Country Location Banner */}
      <LocationBanner
        userLocation={userLocation}
        onCountryChange={handleCountryChange}
        onRefreshGps={handleRefreshGps}
        isLocating={isLocating}
        productionOfferCount={catalogMeta?.productionOfferCount || 0}
        sampleOfferCount={catalogMeta?.sampleOfferCount || 0}
        locale={browseLocale}
      />

      <MarketHubTabs
        selectedHub={
          isMarketHubId(selectedCategory)
            ? selectedCategory
            : selectedCategory === ALL_CATEGORIES_ID
              ? ALL_CATEGORIES_ID
              : ""
        }
        onHubChange={handleHubChange}
        locale={browseLocale}
        hubCounts={hubCounts}
        allCount={products.length}
      />

      {/* Merchant domain filters — desktop/tablet; on phones filters stay optional below */}
      <div className="hidden md:block bg-slate-900 text-white border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs min-w-0">
          
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full min-w-0 max-w-full pb-1 sm:pb-0 touch-pan-x">
            <span className="font-extrabold text-emerald-400 shrink-0 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> {homeUi.filterDomain}:
            </span>

            <button
              onClick={() => handleInternalDomainChange("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                selectedDomain === "all"
                  ? "bg-emerald-500 text-slate-950 shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {homeUi.allStores} ({domainFilterMerchants.length})
            </button>

            {domainFilterMerchants.map((merchant) => (
              <button
                key={merchant.id}
                type="button"
                onClick={() => handleInternalDomainChange(merchant.domain)}
                title={homeUi.filterByStoreDomain}
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
            className="text-slate-300 hover:text-emerald-400 font-bold shrink-0 inline-flex items-center gap-1 text-[11px] hover:underline max-w-full break-words"
          >
            <span className="break-words">
              {homeUi.fullStoresDirectory} (
              {COUNTRIES.CH.merchantDomains.length + COUNTRIES.DE.merchantDomains.length}+)
            </span>
            <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
          </Link>

        </div>
      </div>

      {/* Main Container — mobile: catalog first; policy/hero below */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full min-w-0 flex flex-col gap-4 sm:gap-8">
        {/* Desktop-only intro above the fold; on phones this block is ordered after products */}
        <div className="order-2 md:order-1 space-y-4 md:space-y-8">
          <div className="hidden md:block">
            <MarketEntryHero locale={browseLocale} />
          </div>
          <div className="hidden md:block">
            <PlatformExplanationBanner locale={browseLocale} />
          </div>
          <div className="hidden md:block">
            <PromoCouponsSection coupons={coupons} userLocation={userLocation} />
          </div>
        </div>

        {/* Catalog cluster — first on mobile (no hero/policy above products) */}
        <div className="order-1 md:order-2 space-y-3 sm:space-y-6">
        {/* BeforeToBuy category modules + comparison filters */}
        <div
          id="browse-offers"
          className="bg-white p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs space-y-2 sm:space-y-3 scroll-mt-24"
        >
          <p className="md:hidden text-[11px] font-semibold text-slate-600 px-0.5">
            {homeUi.appDoesOneLiner}
          </p>
          <CategoryNavigation
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categoryCounts={catalogMeta?.categoryCounts}
            locale={browseLocale}
          />

          <div className="hidden md:block space-y-3">
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
              locale={browseLocale}
              onChange={handleOfferFiltersChange}
            />
          </div>
        </div>

        {/* Results Bar Header */}
        <div className="hidden sm:flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0">
          <div className="min-w-0">
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
              <span className="break-words">
                {formatUi(homeUi.comparingDeals, { country: userLocation.countryName })}
              </span>
              {selectedCategory !== ALL_CATEGORIES_ID && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md border border-emerald-300">
                  {getLocalizedCategoryLabel(selectedCategory, browseLocale)}
                </span>
              )}
              {selectedDomain !== "all" && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-md border border-emerald-300">
                  {homeUi.storeDomainLabel} {selectedDomain}
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
                  {offerFilterUi.inStock}
                </span>
              )}
              {offerFilters.freeDeliveryOnly && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  {offerFilterUi.freeDelivery}
                </span>
              )}
              {offerFilters.hasGtinOnly && (
                <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-md border border-slate-300">
                  {offerFilterUi.withEan}
                </span>
              )}
              <span className="text-slate-400 font-normal text-sm">
                ({formatUi(homeUi.itemsFound, { count: displayedProducts.length })})
              </span>
            </h3>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
              {catalogMeta &&
              (catalogMeta.productionOfferCount > 0 || catalogMeta.sampleOfferCount > 0) ? (
                <><strong className="text-emerald-700">{catalogMeta.productionOfferCount} {homeUi.liveOfferLabel}(s)</strong>. <strong className="text-amber-700">{catalogMeta.sampleOfferCount} {homeUi.sampleOfferLabel}(s)</strong> {homeUi.hybridDisclaimer}. {catalogMeta.gtinLinkedProductCount} {homeUi.gtinLinkedProductsText}. {homeUi.otherMerchantsDemoText} {homeUi.priceDisclaimer}</>
              ) : (
                <>
                  {homeUi.demoOfferLabel} <strong className="text-slate-800">{userLocation.city}</strong>
                  {catalogMeta?.gtinLinkedProductCount
                    ? ` — ${catalogMeta.gtinLinkedProductCount} ${homeUi.gtinLinkedProductsText}`
                    : ""} {""}
                  — {homeUi.priceDisclaimer}
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => setIsDisclosureOpen(true)}
            className="self-start shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 max-w-full"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="text-left break-words">{homeUi.howCommissions}</span>
          </button>
        </div>

        {/* Location errors must not hide the catalog — show a banner, keep products. */}
        {errorMessage && !isLoadingProducts && (
          <div
            role="alert"
            className="bg-amber-50 border border-amber-200 text-amber-950 p-3 sm:p-4 rounded-xl text-sm"
          >
            <p className="font-semibold break-words">{sanitizeString(errorMessage)}</p>
          </div>
        )}

        {/* Products Grid — 2 columns on phones (price-first cards) */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-6 h-56 sm:h-96 animate-pulse flex flex-col justify-between space-y-2"
              >
                <div className="bg-slate-200 rounded-lg h-28 sm:h-48 w-full" />
                <div className="space-y-2">
                  <div className="bg-slate-200 h-3 rounded w-3/4" />
                  <div className="bg-slate-200 h-3 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : productFetchFailed ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center">
            <p className="font-bold">{sanitizeString(homeUi.productFetchError)}</p>
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
            <h4 className="text-lg font-bold text-slate-900">{homeUi.noProductsTitle}</h4>
            <p className="text-xs text-slate-500">
              {formatUi(homeUi.noProductsBody, { country: userLocation.countryName })}
              {debouncedSearchQuery.trim() ? ` “${debouncedSearchQuery}”` : ""}
              {selectedDomain !== "all" ? ` · ${selectedDomain}` : ""}
            </p>
            <button
              onClick={resetAllFilters}
              className="bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              {categoryUi.resetFilters}
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  userLocation={userLocation}
                  locale={browseLocale}
                  onSelectOffer={() => {
                    // Affiliate redirect handled by the browser via purchaseUrl
                  }}
                />
              ))}
            </div>
            <div ref={loadMoreRef} className="py-3 sm:py-4 text-center text-xs text-slate-500">
              {visibleCount < displayedProducts.length
                ? homeUi.scrollForMoreProducts
                : homeUi.endOfCatalog}
            </div>
          </div>
        )}
        </div>

        {/* Mobile: hero + policy after the catalog (not before products) */}
        <div className="order-3 md:hidden space-y-4">
          <MarketEntryHero locale={browseLocale} />
          <PlatformExplanationBanner locale={browseLocale} />
          <PromoCouponsSection coupons={coupons} userLocation={userLocation} />
          <p className="text-[11px] text-slate-500 px-1 leading-relaxed">
            {homeUi.priceDisclaimer}
          </p>
          <p className="text-[11px] text-slate-500 px-1 leading-relaxed">
            {homeUi.marketHeroPartnerNote}
          </p>
          <button
            type="button"
            onClick={() => setIsDisclosureOpen(true)}
            className="w-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            {homeUi.howCommissions}
          </button>
        </div>

      </main>

      <Suspense fallback={null}>
        <AffiliateDisclosureModal
          isOpen={isDisclosureOpen}
          onClose={() => setIsDisclosureOpen(false)}
        />
      </Suspense>
    </div>
  );
}
