"use client";

import { useEffect, useState, Suspense, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Product, PromoCoupon } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import { getActiveCouponsForCountry } from "@/lib/feed-parser";
import type { ProductFetchMeta } from "@/lib/product-service";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { Header } from "@/components/Header";
import { CategoryFlyoutMenu } from "@/components/CategoryFlyoutMenu";
import { MarketHubTabs } from "@/components/MarketHubTabs";
import { OfferFilters } from "@/components/OfferFilters";
import { ProductCard } from "@/components/ProductCard";
import { PromoCouponsSection } from "@/components/PromoCouponsSection";
import { isActiveCollectionSelection } from "@/components/CollectionNavigation";
import { ALL_CATEGORIES_ID, productMatchesCategoryFilter } from "@/lib/categories";
import {
  defaultMarketHubForCountry,
  MARKET_HUB_LEAF_GROUPS,
  MARKET_HUB_TABS,
} from "@/lib/market-hubs";
import {
  CATEGORY_UI,
  formatCategoryUi,
  getLocalizedCategoryLabel,
} from "@/lib/category-i18n";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { applyOfferFilters, hasActiveOfferFilters, parseOfferFiltersFromSearchParams, writeOfferFiltersToSearchParams, type OfferFilterCriteria } from "@/lib/offers/offer-filters";
import { sortProductsForBrowse, type SortOption } from "@/lib/browse-product-order";
import { DEFAULT_PRODUCT_LIST_LIMIT } from "@/lib/product-list-options";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  Info,
  SearchX,
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
  const [sortOrder, setSortOrder] = useState<SortOption>("default");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [offerFilters, setOfferFilters] = useState<OfferFilterCriteria>({});
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(
    initialProducts.length === 0 && !initialFetchFailed
  );
  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [catalogMeta, setCatalogMeta] = useState<ProductFetchMeta | null>(initialMeta);
  const [productFetchFailed, setProductFetchFailed] = useState<boolean>(initialFetchFailed);

  const { userLocation, isLocating, errorMessage, handleCountryChange, handleRefreshGps } = useUserLocation();

  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.RO;
  const {
    locale: browseLocale,
    setLocale: setBrowseLocale,
    availableLocales,
  } = useBrowseLocale(userLocation.countryCode);
  const categoryUi = CATEGORY_UI[browseLocale];
  const homeUi = HOME_UI[browseLocale];
  const crossBorderCollectionActive = selectedCategory === "compare-cross-border";
  const activeOfferFilters = useMemo<OfferFilterCriteria>(
    () => ({
      ...offerFilters,
      domain: selectedDomain,
    }),
    [offerFilters, selectedDomain]
  );

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();
    for (const product of products) {
      const brand = product.brand?.trim();
      if (brand) brands.add(brand);
    }
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const hubCounts = useMemo(() => {
    const leafCounts = catalogMeta?.categoryCounts ?? {};
    const counts: Record<string, number> = {};
    for (const hub of MARKET_HUB_TABS) {
      const leaves = MARKET_HUB_LEAF_GROUPS[hub.id] ?? [];
      counts[hub.id] = leaves.reduce((sum, leafId) => sum + (leafCounts[leafId] ?? 0), 0);
    }
    return counts;
  }, [catalogMeta?.categoryCounts]);

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

  // Fetch a capped page when location, category, search, or locale changes.
  // AbortController prevents a stale market response from wiping a later catalog.
  useEffect(() => {
    const controller = new AbortController();
    const requestCountry = userLocation.countryCode;

    async function loadProductsAndCoupons() {
      // Keep SSR products visible while refetching the same market.
      const hasSsrCatalog = initialProducts.length > 0;
      setIsLoadingProducts(!hasSsrCatalog);

      try {
        const params = new URLSearchParams({
          country: requestCountry,
          lat: String(userLocation.latitude),
          lng: String(userLocation.longitude),
          locale: browseLocale,
          limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
          offset: "0",
        });

        if (debouncedSearchQuery.trim()) {
          params.set("q", debouncedSearchQuery.trim());
        }
        if (selectedCategory && selectedCategory !== ALL_CATEGORIES_ID) {
          params.set("category", selectedCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        if (!response.ok) {
          // Keep any SSR/catalog products on transient 429/5xx instead of blanking the page.
          if (response.status === 429) {
            setProductFetchFailed(false);
            return;
          }
          throw new Error("Product API request failed");
        }

        const data = (await response.json()) as {
          products: Product[];
          meta: ProductFetchMeta;
        };
        if (controller.signal.aborted) return;

        // Never replace a populated grid with an empty empty-market payload
        // (stale CH cookie / DEFAULT_COUNTRY race). Real empty category filters
        // still clear when hasProductionFeed is true.
        const nextProducts = data.products || [];
        if (
          nextProducts.length === 0 &&
          !debouncedSearchQuery.trim() &&
          data.meta &&
          !data.meta.hasProductionFeed
        ) {
          setCatalogMeta(data.meta);
          setProductFetchFailed(false);
          return;
        }

        setProducts(nextProducts);
        setCatalogMeta(data.meta || null);
        setProductFetchFailed(false);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load products:", error);
        setProductFetchFailed(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }

      if (!controller.signal.aborted) {
        setCoupons(getActiveCouponsForCountry(requestCountry));
      }
    }

    void loadProductsAndCoupons();
    return () => controller.abort();
  }, [
    userLocation,
    debouncedSearchQuery,
    browseLocale,
    selectedCategory,
    initialProducts.length,
    setProducts,
    setCatalogMeta,
    setCoupons,
  ]);

  // Append the next server page when the user scrolls near the end of the loaded set.
  useEffect(() => {
    if (!catalogMeta?.hasMore || isLoadingProducts || productFetchFailed) return;
    if (visibleCount < products.length) return;

    const controller = new AbortController();
    const requestCountry = userLocation.countryCode;
    // Client accumulates pages from offset 0, so the next page starts at loaded length.
    const nextOffset = products.length;

    async function loadMoreProducts() {
      try {
        const params = new URLSearchParams({
          country: requestCountry,
          lat: String(userLocation.latitude),
          lng: String(userLocation.longitude),
          locale: browseLocale,
          limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
          offset: String(nextOffset),
        });
        if (debouncedSearchQuery.trim()) {
          params.set("q", debouncedSearchQuery.trim());
        }
        if (selectedCategory && selectedCategory !== ALL_CATEGORIES_ID) {
          params.set("category", selectedCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted || !response.ok) return;

        const data = (await response.json()) as {
          products: Product[];
          meta: ProductFetchMeta;
        };
        if (controller.signal.aborted) return;

        setProducts((prev) => {
          const seen = new Set(prev.map((product) => product.id));
          const appended = (data.products || []).filter((product) => !seen.has(product.id));
          return appended.length ? [...prev, ...appended] : prev;
        });
        setCatalogMeta(data.meta || null);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load more products:", error);
      }
    }

    void loadMoreProducts();
    return () => controller.abort();
  }, [
    catalogMeta?.hasMore,
    catalogMeta?.offset,
    visibleCount,
    products.length,
    isLoadingProducts,
    productFetchFailed,
    userLocation,
    browseLocale,
    debouncedSearchQuery,
    selectedCategory,
  ]);

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
      // Stay at the top of browse results after filtering (do not keep footer scroll).
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    },
    [syncBrowseUrl, selectedDomain, offerFilters]
  );

  const handleOfferFiltersChange = useCallback(
    (next: OfferFilterCriteria) => {
      const { domain, ...rest } = next;
      const nextDomain = domain === undefined ? selectedDomain : domain || "all";
      if (nextDomain !== selectedDomain) {
        setSelectedDomain(nextDomain);
      }
      setOfferFilters(rest);
      syncBrowseUrl(selectedCategory, nextDomain, rest);
    },
    [selectedCategory, selectedDomain, syncBrowseUrl]
  );

  const handleDomainChange = useCallback(
    (domain: string) => {
      setSelectedDomain(domain);
      syncBrowseUrl(selectedCategory, domain, offerFilters);
    },
    [selectedCategory, offerFilters, syncBrowseUrl]
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


  const browseReturnTo = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== ALL_CATEGORIES_ID) {
      params.set("category", selectedCategory);
    }
    if (debouncedSearchQuery.trim()) {
      params.set("q", debouncedSearchQuery.trim());
    }
    if (selectedDomain !== "all") {
      params.set("domain", selectedDomain);
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }, [selectedCategory, debouncedSearchQuery, selectedDomain]);
  const categoryFilteredProducts = useMemo(
    () =>
      products.filter((product) => productMatchesCategoryFilter(product, selectedCategory)),
    [products, selectedCategory]
  );
  const displayedProducts = useMemo(
    () =>
      sortProductsForBrowse(
        applyOfferFilters(categoryFilteredProducts, activeOfferFilters),
        sortOrder
      ),
    [categoryFilteredProducts, activeOfferFilters, sortOrder]
  );
  const filtersActiveBeyondCategory = useMemo(() => hasActiveOfferFilters(activeOfferFilters), [activeOfferFilters]);
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
        isLocating={isLocating}
        locale={browseLocale}
        onLocaleChange={setBrowseLocale}
        availableLocales={availableLocales}
        onOpenCategoryMenu={() => setIsCategoryMenuOpen(true)}
        selectedDomain={selectedDomain}
        onDomainChange={handleDomainChange}
      />

      <MarketHubTabs
        selectedHub={selectedCategory}
        onHubChange={handleCategoryChange}
        locale={browseLocale}
        hubCounts={hubCounts}
        allCount={catalogMeta?.totalMatched}
        countryCode={userLocation.countryCode}
      />

      <CategoryFlyoutMenu
        open={isCategoryMenuOpen}
        onClose={() => setIsCategoryMenuOpen(false)}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        categoryCounts={catalogMeta?.categoryCounts}
        locale={browseLocale}
      />

      {/* Full-width desktop content — no phone-shell max-width */}
      <main className="flex w-full min-w-0 flex-1 flex-col gap-4 px-3 py-4 sm:px-8 lg:px-12">
        <div className="space-y-3">
          <div
            id="browse-offers"
            className="scroll-mt-24 space-y-0.5 px-0.5"
          >
            <p className="text-[12px] font-semibold text-slate-800">{homeUi.shortPitch1}</p>
            <p className="text-[11px] text-slate-500">
              {homeUi.shortPitch2} {homeUi.shortPitch3}
            </p>
          </div>

          <div className="space-y-2">
            <label className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
              <span className="text-slate-500">{homeUi.storeDomainLabel}</span>
              <select
                aria-label={homeUi.storeDomainLabel}
                value={selectedDomain}
                onChange={(event) => handleDomainChange(event.target.value)}
                className="max-w-[12rem] min-w-0 bg-transparent text-[11px] font-bold text-slate-800 outline-none"
              >
                <option value="all">{homeUi.allStores}</option>
                {currentCountryInfo.merchantDomains.map((merchant) => (
                  <option key={merchant.id} value={merchant.domain}>
                    {merchant.domain}
                  </option>
                ))}
              </select>
            </label>
            <OfferFilters
              criteria={activeOfferFilters}
              brandOptions={brandOptions}
              currencySymbol={currentCountryInfo.currencySymbol}
              locale={browseLocale}
              onChange={handleOfferFiltersChange}
            />

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-xs shrink-0 ml-auto w-full sm:w-auto mt-2 sm:mt-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-2">Sortează:</span>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOption)}
                className="text-sm font-semibold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer pr-4 w-full"
              >
                <option value="default">Relevanță</option>
                <option value="price-asc">Cel mai mic preț (↑)</option>
                <option value="price-desc">Cel mai mare preț (↓)</option>
              </select>
            </div>
          </div>

          {errorMessage && !isLoadingProducts && (
            <div
              role="alert"
              className="bg-amber-50 border border-amber-200 text-amber-950 p-3 rounded-xl text-sm"
            >
              <p className="font-semibold break-words">{sanitizeString(errorMessage)}</p>
            </div>
          )}

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-slate-200 p-2.5 h-56 animate-pulse flex flex-col justify-between space-y-2 min-w-0"
                >
                  <div className="bg-slate-200 rounded-lg h-28 w-full" />
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
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
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
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userLocation={userLocation}
                    locale={browseLocale}
                    returnTo={browseReturnTo}
                    onSelectOffer={() => {
                      // Affiliate redirect handled by the browser via purchaseUrl
                    }}
                  />
                ))}
              </div>
              <div ref={loadMoreRef} className="py-3 text-center text-xs text-slate-500">
                {visibleCount < displayedProducts.length || catalogMeta?.hasMore
                  ? homeUi.scrollForMoreProducts
                  : homeUi.endOfCatalog}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <PromoCouponsSection coupons={coupons} userLocation={userLocation} />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-0.5 text-[10px] text-slate-400">
            <Link href="/legal" className="hover:text-slate-700 hover:underline">
              {homeUi.legalCompanyLink}
            </Link>
            <button
              type="button"
              onClick={() => setIsDisclosureOpen(true)}
              className="inline-flex items-center gap-1 hover:text-slate-700"
            >
              <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
              {homeUi.howCommissions}
            </button>
            <Link href="/disclaimer" className="hover:text-slate-700 hover:underline">
              Beta / Demo
            </Link>
          </div>
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
