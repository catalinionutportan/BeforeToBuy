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
import { OfferFilters } from "@/components/OfferFilters";
import { ProductCard } from "@/components/ProductCard";
import { PromoCouponsSection } from "@/components/PromoCouponsSection";
import { isActiveCollectionSelection } from "@/components/CollectionNavigation";
import type { BrowseCategoryOption } from "@/components/BrowseCategoryOption";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import {
  defaultMarketHubForCountry,
  MARKET_HUB_LEAF_GROUPS,
  MARKET_HUB_TABS,
  marketHubOrderForCountry,
  occupiedLeavesOutsideMarketHubs,
  resolveOccupiedBrowseCategory,
  shouldIgnoreLandingCategory,
} from "@/lib/market-hubs";
import {
  presentationCategoryGroupsForCountry,
  resolveShortcutBoards,
} from "@/lib/browse-shortcut-boards";
import { BrowseShortcutBoards } from "@/components/home/BrowseShortcutBoards";
import {
  CATEGORY_UI,
  formatCategoryUi,
  getLocalizedCategoryLabel,
} from "@/lib/category-i18n";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { areOfferFiltersEqual, hasActiveOfferFilters, parseOfferFiltersFromSearchParams, writeOfferFiltersToParams, writeOfferFiltersToSearchParams, type OfferFilterCriteria } from "@/lib/offers/offer-filters";
import { sortProductsForBrowse, type SortOption } from "@/lib/browse-product-order";
import {
  clearBrowseScrollY,
  pinBrowseScrollAnchor,
  pinBrowseScrollY,
  readBrowseScrollY,
  subscribeBrowseScrollRestored,
} from "@/lib/browse-scroll";
import {
  BROWSE_API_VERSION,
  DEFAULT_PRODUCT_LIST_LIMIT,
} from "@/lib/product-list-options";
import {
  BROWSE_CATEGORY_EVENT,
  ensureBrowseCatalog,
  isUsableAllBrowsePage,
  setSessionBrowsePage,
} from "@/lib/prefetch-browse-catalog";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  SearchX,
} from "lucide-react";
import { sanitizeString } from "@/lib/utils/sanitization";
import {
  BROWSE_PAGE_SIZE,
  buildBrowsePaginationItems,
  normalizeBrowsePage,
} from "@/lib/browse-pagination";
import { withLangParam } from "@/lib/seo/site-url";

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
  initialCountry: CountryCode;
  /** Server-fetched catalog for the default browse location, used for first paint. */
  initialProducts?: Product[];
  initialMeta?: ProductFetchMeta | null;
  /** Set when the server-side initial catalog fetch failed, so we can surface an error instead of an empty grid. */
  initialFetchFailed?: boolean;
  initialPage?: number;
}

export default function HomePageClient({
  initialCountry,
  initialProducts = [],
  initialMeta = null,
  initialFetchFailed = false,
  initialPage = 1,
}: HomePageClientProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearchQuery = useDebouncedValue(searchInput, 350);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_ID);
  const [currentPage, setCurrentPage] = useState(() => normalizeBrowsePage(initialPage));
  const [sortOrder, setSortOrder] = useState<SortOption>("default");
  const [offerFilters, setOfferFilters] = useState<OfferFilterCriteria>({});
  const debouncedOfferFilters = useDebouncedValue(offerFilters, 500);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [coupons, setCoupons] = useState<PromoCoupon[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(
    initialProducts.length === 0 && !initialFetchFailed
  );
  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);
  const [catalogMeta, setCatalogMeta] = useState<ProductFetchMeta | null>(initialMeta);
  const [productFetchFailed, setProductFetchFailed] = useState<boolean>(initialFetchFailed);
  const [reloadToken, setReloadToken] = useState(0);
  const skippedInitialCatalogRequest = useRef(false);

  const { userLocation, handleCountryChange } = useUserLocation(initialCountry);
  const currentCountryInfo = COUNTRIES[userLocation.countryCode] || COUNTRIES.RO;

  const {
    locale: browseLocale,
    setLocale: setBrowseLocale,
    availableLocales,
  } = useBrowseLocale(userLocation.countryCode);
  const categoryUi = CATEGORY_UI[browseLocale] ?? CATEGORY_UI.ro ?? CATEGORY_UI.en;
  const homeUi = HOME_UI[browseLocale] ?? HOME_UI.ro ?? HOME_UI.en;

  useEffect(() => {
    if (initialProducts.length === 0 || !initialMeta) return;
    if (!isUsableAllBrowsePage({ products: initialProducts, meta: initialMeta })) return;
    setSessionBrowsePage(initialCountry, browseLocale, {
      products: initialProducts,
      meta: initialMeta,
    });
  }, [browseLocale, initialCountry, initialMeta, initialProducts]);
  const crossBorderCollectionActive = selectedCategory === "compare-cross-border";
  const activeOfferFilters = useMemo<OfferFilterCriteria>(
    () => ({
      ...debouncedOfferFilters,
      domain: selectedDomain,
    }),
    [debouncedOfferFilters, selectedDomain]
  );
  const filterControlCriteria = useMemo<OfferFilterCriteria>(
    () => ({ ...offerFilters, domain: selectedDomain }),
    [offerFilters, selectedDomain]
  );

  const brandOptions = useMemo(() => {
    if (catalogMeta?.brandOptions?.length) return catalogMeta.brandOptions;
    const brands = new Set<string>();
    for (const product of products) {
      const brand = product.brand?.trim();
      if (brand) brands.add(brand);
    }
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [catalogMeta?.brandOptions, products]);

  const hubCounts = useMemo(() => {
    const leafCounts: Record<string, number> = catalogMeta?.categoryCounts ?? {};
    const counts: Record<string, number> = {};
    for (const hub of MARKET_HUB_TABS) {
      const leaves = MARKET_HUB_LEAF_GROUPS[hub.id] ?? [];
      counts[hub.id] = leaves.reduce((sum, leafId) => sum + (leafCounts[leafId] ?? 0), 0);
    }
    return counts;
  }, [catalogMeta?.categoryCounts]);

  const hubLabels = useMemo(
    () =>
      ({
        "hub-electronics": homeUi.hubElectronics,
        "hub-home": homeUi.hubHome,
        "hub-books": homeUi.hubBooks,
        "hub-fashion": homeUi.hubFashion,
        "hub-garden": homeUi.hubGarden,
        "hub-diy": homeUi.hubDiy,
        "hub-auto": homeUi.hubAuto,
      }) as Record<string, string>,
    [homeUi]
  );

  /**
   * Browse search menu: All + occupied hubs + occupied leaf categories.
   * Leaves make the list useful for live type-to-filter (not just 2 hubs on RO).
   */
  const categoryOptions = useMemo((): BrowseCategoryOption[] => {
    const leafCounts: Record<string, number> = catalogMeta?.categoryCounts ?? {};
    const allCount = catalogMeta?.feedProductCount ?? catalogMeta?.totalMatched ?? 0;
    const options: BrowseCategoryOption[] = [
      { id: ALL_CATEGORIES_ID, label: homeUi.hubAll, count: allCount },
    ];
    const seen = new Set<string>([ALL_CATEGORIES_ID]);
    const order = marketHubOrderForCountry(userLocation.countryCode);
    const presentationGroupByMember = new Map(
      presentationCategoryGroupsForCountry(userLocation.countryCode).flatMap((group) =>
        group.memberCategoryIds.map((categoryId) => [categoryId, group] as const)
      )
    );
    const appendLeafOption = (leaf: { id: string; count: number }) => {
      const group = presentationGroupByMember.get(leaf.id);
      if (group) {
        if (group.memberCategoryIds.some((categoryId) => seen.has(categoryId))) return;
        const count = group.memberCategoryIds.reduce(
          (sum, categoryId) => sum + (leafCounts[categoryId] ?? 0),
          0
        );
        if (count <= 0) return;
        const selectedGroupId = group.memberCategoryIds.includes(selectedCategory)
          ? selectedCategory
          : group.primaryCategoryId;
        options.push({
          id: selectedGroupId,
          label: group.memberCategoryIds
            .map((categoryId) => getLocalizedCategoryLabel(categoryId, browseLocale))
            .join(" + "),
          count,
        });
        group.memberCategoryIds.forEach((categoryId) => seen.add(categoryId));
        return;
      }
      if (seen.has(leaf.id)) return;
      seen.add(leaf.id);
      options.push({
        id: leaf.id,
        label: getLocalizedCategoryLabel(leaf.id, browseLocale),
        count: leaf.count,
      });
    };

    for (const hubId of order) {
      const hubCount = hubCounts[hubId] ?? 0;
      if (hubCount <= 0) continue;

      options.push({
        id: hubId,
        label: hubLabels[hubId] ?? hubId,
        count: hubCount,
      });
      seen.add(hubId);

      const occupiedLeaves = (MARKET_HUB_LEAF_GROUPS[hubId] ?? [])
        .map((leafId) => ({ id: leafId, count: leafCounts[leafId] ?? 0 }))
        .filter((leaf) => leaf.count > 0)
        .sort(
          (a, b) =>
            b.count - a.count ||
            getLocalizedCategoryLabel(a.id, browseLocale).localeCompare(
              getLocalizedCategoryLabel(b.id, browseLocale),
              browseLocale
            )
        );

      for (const leaf of occupiedLeaves) {
        appendLeafOption(leaf);
      }
    }

    const ungroupedOccupiedLeaves = occupiedLeavesOutsideMarketHubs(leafCounts).sort(
      (a, b) =>
        b.count - a.count ||
        getLocalizedCategoryLabel(a.id, browseLocale).localeCompare(
          getLocalizedCategoryLabel(b.id, browseLocale),
          browseLocale
        )
    );
    for (const leaf of ungroupedOccupiedLeaves) {
      appendLeafOption(leaf);
    }

    return options;
  }, [
    browseLocale,
    catalogMeta?.categoryCounts,
    catalogMeta?.feedProductCount,
    catalogMeta?.totalMatched,
    homeUi.hubAll,
    hubCounts,
    hubLabels,
    selectedCategory,
    userLocation.countryCode,
  ]);

  const inventoryCounts = catalogMeta?.categoryCounts ?? initialMeta?.categoryCounts;
  const marketProductCount = Math.max(
    catalogMeta?.feedProductCount ?? 0,
    userLocation.countryCode === initialCountry
      ? (initialMeta?.feedProductCount ?? initialProducts.length)
      : 0,
    products.length
  );
  const browseCategory = resolveOccupiedBrowseCategory(
    selectedCategory,
    inventoryCounts,
    marketProductCount
  );

  // Read shareable browse state and respond to browser back/forward navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readBrowseState = () => {
      const params = new URLSearchParams(window.location.search);
      const rawCategory = params.get("category");
      const landingCategory = defaultMarketHubForCountry(userLocation.countryCode);
      const nextCategory = shouldIgnoreLandingCategory(rawCategory)
        ? landingCategory
        : rawCategory || landingCategory;
      setSelectedCategory(nextCategory);
      if (rawCategory && nextCategory === landingCategory) {
        const url = new URL(window.location.href);
        url.searchParams.delete("category");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      }
      setSearchInput(params.get("q") || "");
      setCurrentPage(normalizeBrowsePage(params.get("page")));
      const nextSort = params.get("sort");
      setSortOrder(
        nextSort === "price-asc" || nextSort === "price-desc" ? nextSort : "default"
      );
      const parsed = parseOfferFiltersFromSearchParams(params);
      setSelectedDomain(parsed.domain || "all");
      const nextOfferFilters: OfferFilterCriteria = {
        brand: parsed.brand,
        inStockOnly: parsed.inStockOnly,
        freeDeliveryOnly: parsed.freeDeliveryOnly,
        minTotalPrice: parsed.minTotalPrice,
        maxTotalPrice: parsed.maxTotalPrice,
        hasGtinOnly: parsed.hasGtinOnly,
      };
      setOfferFilters((current) =>
        areOfferFiltersEqual(current, nextOfferFilters) ? current : nextOfferFilters
      );
    };

    readBrowseState();
    window.addEventListener("popstate", readBrowseState);
    return () => window.removeEventListener("popstate", readBrowseState);
  }, [userLocation.countryCode]);

  const previousCountryRef = useRef(userLocation.countryCode);

  // Country switch only: land on All and drop the previous market's hub and store domain from the URL.
  useEffect(() => {
    if (previousCountryRef.current === userLocation.countryCode) return;
    previousCountryRef.current = userLocation.countryCode;
    const next = defaultMarketHubForCountry(userLocation.countryCode);
    setSelectedCategory(next);
    setSelectedDomain("all");
    setSearchInput("");
    setOfferFilters({});
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    url.searchParams.delete("domain");
    url.searchParams.delete("q");
    url.searchParams.delete("page");
    url.searchParams.delete("sort");
    url.searchParams.set("country", userLocation.countryCode);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [userLocation.countryCode]);

  // Empty aisle in the URL / menu → All as soon as the market has products.
  useEffect(() => {
    if (browseCategory === selectedCategory) return;
    if (debouncedSearchQuery.trim()) return;
    setSelectedCategory(browseCategory);
    if (typeof window === "undefined") return;
    if (browseCategory !== ALL_CATEGORIES_ID) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("category")) {
      url.searchParams.delete("category");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [browseCategory, selectedCategory, debouncedSearchQuery]);

  // Keep `q` shareable in the URL after debounce.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const nextQ = debouncedSearchQuery.trim();
    const currentQ = url.searchParams.get("q") || "";
    if (nextQ === currentQ) return;
    if (nextQ) url.searchParams.set("q", nextQ);
    else url.searchParams.delete("q");
    url.searchParams.delete("page");
    setCurrentPage(1);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [debouncedSearchQuery]);

  // Fetch a capped page when location, category, search, or locale changes.
  // AbortController prevents a stale market response from wiping a later catalog.
  useEffect(() => {
    const controller = new AbortController();
    const requestCountry = userLocation.countryCode;

    const matchesServerCatalog =
      !skippedInitialCatalogRequest.current &&
      requestCountry === initialCountry &&
      currentPage === initialPage &&
      !debouncedSearchQuery.trim() &&
      browseCategory === ALL_CATEGORIES_ID &&
      !hasActiveOfferFilters(activeOfferFilters) &&
      sortOrder === "default" &&
      isUsableAllBrowsePage(
        initialMeta ? { products: initialProducts, meta: initialMeta } : null
      );

    if (matchesServerCatalog) {
      skippedInitialCatalogRequest.current = true;
      setCoupons(getActiveCouponsForCountry(requestCountry));
      setIsLoadingProducts(false);
      return () => controller.abort();
    }

    skippedInitialCatalogRequest.current = true;

    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, 8_000);

    async function loadProductsAndCoupons() {
      setIsLoadingProducts(true);
      const cacheableAisle =
        currentPage === 1 &&
        !debouncedSearchQuery.trim() &&
        !hasActiveOfferFilters(activeOfferFilters) &&
        sortOrder === "default";

      try {
        if (cacheableAisle) {
          const shared = await ensureBrowseCatalog(
            requestCountry,
            browseLocale,
            browseCategory === ALL_CATEGORIES_ID ? undefined : browseCategory
          );
          if (controller.signal.aborted) {
            if (didTimeout) throw new Error("Catalogue request timed out");
            return;
          }
          if (shared) {
            setProducts(shared.products);
            setCatalogMeta(shared.meta);
            setProductFetchFailed(false);
            setCoupons(getActiveCouponsForCountry(requestCountry));
            return;
          }
          throw new Error("Catalog request did not return a usable page");
        }

        const params = new URLSearchParams({
          country: requestCountry,
          locale: browseLocale,
          limit: String(DEFAULT_PRODUCT_LIST_LIMIT),
          offset: String((currentPage - 1) * BROWSE_PAGE_SIZE),
          v: BROWSE_API_VERSION,
        });

        if (debouncedSearchQuery.trim()) {
          params.set("q", debouncedSearchQuery.trim());
        }
        if (browseCategory && browseCategory !== ALL_CATEGORIES_ID) {
          params.set("category", browseCategory);
        }
        writeOfferFiltersToParams(params, activeOfferFilters);
        if (sortOrder !== "default") params.set("sort", sortOrder);

        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (controller.signal.aborted) return;

        if (!response.ok) {
          throw new Error("Product API request failed");
        }

        const data = (await response.json()) as {
          products: Product[];
          meta: ProductFetchMeta;
        };
        if (controller.signal.aborted) return;

        const nextProducts = data.products || [];
        setProducts(nextProducts);
        setCatalogMeta((prev) => {
          const next = data.meta;
          if (!next) return prev;
          if (next.catalogRevision !== prev?.catalogRevision) return next;
          const nextCounts = next.categoryCounts ?? {};
          const prevCounts = prev?.categoryCounts ?? {};
          const nextCountsEmpty = Object.keys(nextCounts).length === 0;
          return {
            ...prev,
            ...next,
            feedProductCount: next.feedProductCount || prev?.feedProductCount || 0,
            categoryCounts: nextCountsEmpty ? prevCounts : { ...prevCounts, ...nextCounts },
            categoryCovers: {
              ...(prev?.categoryCovers ?? {}),
              ...(next.categoryCovers ?? {}),
            },
            brandOptions:
              next.brandOptions.length > 0
                ? next.brandOptions
                : (prev?.brandOptions ?? []),
            totalMatched: next.totalMatched,
          };
        });
        if (cacheableAisle && nextProducts.length > 0 && data.meta) {
          setSessionBrowsePage(
            requestCountry,
            browseLocale,
            {
              products: nextProducts,
              meta: data.meta,
            },
            browseCategory === ALL_CATEGORIES_ID ? undefined : browseCategory
          );
        }
        setProductFetchFailed(false);
      } catch (error) {
        if (controller.signal.aborted && !didTimeout) return;
        console.error("Failed to load products:", error);
        setProducts([]);
        setProductFetchFailed(true);
      } finally {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted || didTimeout) {
          setIsLoadingProducts(false);
        }
      }

      if (!controller.signal.aborted) {
        setCoupons(getActiveCouponsForCountry(requestCountry));
      }
    }

    void loadProductsAndCoupons();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    userLocation,
    currentPage,
    debouncedSearchQuery,
    browseLocale,
    browseCategory,
    selectedCategory,
    activeOfferFilters,
    sortOrder,
    initialProducts,
    initialProducts.length,
    initialCountry,
    initialMeta,
    initialPage,
    reloadToken,
    setProducts,
    setCatalogMeta,
    setCoupons,
  ]);

  const changeCountry = useCallback(
    (countryCode: CountryCode) => {
      if (countryCode === userLocation.countryCode) return;
      clearBrowseScrollY();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      setCurrentPage(1);
      setProductFetchFailed(false);
      setSelectedCategory(ALL_CATEGORIES_ID);
      setSelectedDomain("all");
      setSearchInput("");
      setOfferFilters({});

      setProducts([]);
      setIsLoadingProducts(true);
      handleCountryChange(countryCode);
    },
    [handleCountryChange, userLocation.countryCode]
  );

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
      url.searchParams.delete("page");
      setCurrentPage(1);
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    },
    [debouncedSearchQuery]
  );

  const handleCategoryChange = useCallback(
    (categoryId: string, domain?: string) => {
      const next = resolveOccupiedBrowseCategory(
        categoryId,
        inventoryCounts,
        marketProductCount
      );
      const nextDomain = domain === undefined ? selectedDomain : domain || "all";
      setIsLoadingProducts(true);
      setReloadToken((token) => token + 1);
      if (nextDomain !== selectedDomain) setSelectedDomain(nextDomain);
      setSelectedCategory(next);
      syncBrowseUrl(next, nextDomain, offerFilters);
      // Stay at the top of browse results after filtering (do not keep footer scroll).
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    },
    [
      syncBrowseUrl,
      selectedDomain,
      offerFilters,
      inventoryCounts,
      marketProductCount,
    ]
  );

  useEffect(() => {
    const onBrowseCategory = (event: Event) => {
      const categoryId = (event as CustomEvent<{ categoryId?: string }>).detail?.categoryId;
      if (typeof categoryId === "string") handleCategoryChange(categoryId);
    };
    window.addEventListener(BROWSE_CATEGORY_EVENT, onBrowseCategory);
    return () => window.removeEventListener(BROWSE_CATEGORY_EVENT, onBrowseCategory);
  }, [handleCategoryChange]);

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
      if (domain !== "all" && selectedCategory !== ALL_CATEGORIES_ID) {
        setSelectedCategory(ALL_CATEGORIES_ID);
        syncBrowseUrl(ALL_CATEGORIES_ID, domain, offerFilters);
      } else {
        syncBrowseUrl(selectedCategory, domain, offerFilters);
      }
    },
    [selectedCategory, offerFilters, syncBrowseUrl]
  );

  const handleSortChange = useCallback((nextSort: SortOption) => {
    setSortOrder(nextSort);
    setCurrentPage(1);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (nextSort === "default") url.searchParams.delete("sort");
    else url.searchParams.set("sort", nextSort);
    url.searchParams.delete("page");
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const resetAllFilters = useCallback(() => {
    const defaultHub = defaultMarketHubForCountry(userLocation.countryCode);
    setSearchInput("");
    setSelectedDomain("all");
    setOfferFilters({});
    setSelectedCategory(defaultHub);
    setSortOrder("default");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (defaultHub === ALL_CATEGORIES_ID) url.searchParams.delete("category");
      else url.searchParams.set("category", defaultHub);
      url.searchParams.delete("q");
      url.searchParams.delete("page");
      url.searchParams.delete("sort");
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
    params.set("country", userLocation.countryCode);
    params.set("lang", browseLocale);
    if (browseCategory && browseCategory !== ALL_CATEGORIES_ID) {
      params.set("category", browseCategory);
    }
    if (debouncedSearchQuery.trim()) {
      params.set("q", debouncedSearchQuery.trim());
    }
    if (selectedDomain !== "all") {
      params.set("domain", selectedDomain);
    }
    writeOfferFiltersToParams(params, activeOfferFilters);
    if (sortOrder !== "default") params.set("sort", sortOrder);
    if (currentPage > 1) params.set("page", String(currentPage));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }, [
    activeOfferFilters,
    browseCategory,
    browseLocale,
    userLocation.countryCode,
    currentPage,
    debouncedSearchQuery,
    selectedDomain,
    sortOrder,
  ]);
  const isSearching = debouncedSearchQuery.trim().length > 0;
  const displayedProducts = useMemo(
    () =>
      sortProductsForBrowse(
        products,
        sortOrder,
        {
          countryCode: userLocation.countryCode,
          // Search bar = cross-catalog (phones + fashion + …). Hubs/menu = aisle order.
          preserveApiOrder: isSearching,
        }
      ),
    [
      products,
      sortOrder,
      userLocation.countryCode,
      isSearching,
    ]
  );
  const filtersActiveBeyondCategory = useMemo(() => hasActiveOfferFilters(activeOfferFilters), [activeOfferFilters]);
  const totalPages = Math.max(
    1,
    Math.ceil((catalogMeta?.totalMatched ?? displayedProducts.length) / BROWSE_PAGE_SIZE)
  );
  const paginationItems = useMemo(
    () => buildBrowsePaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.min(normalizeBrowsePage(page), totalPages);
      if (nextPage === currentPage || typeof window === "undefined") return;
      clearBrowseScrollY();
      setCurrentPage(nextPage);
      setIsLoadingProducts(true);
      const url = new URL(window.location.href);
      if (nextPage === 1) url.searchParams.delete("page");
      else url.searchParams.set("page", String(nextPage));
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      requestAnimationFrame(() => {
        document.getElementById("product-results")?.scrollIntoView({
          block: "start",
          behavior: "auto",
        });
      });
    },
    [currentPage, totalPages]
  );

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setCurrentPage(totalPages);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (totalPages === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(totalPages));
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [currentPage, totalPages]);

  // Product details open as a route modal. Returning pins the exact card.
  useEffect(() => {
    const onRestore = () => {
      const y = readBrowseScrollY();
      if (y == null) return;
      requestAnimationFrame(() => {
        if (!pinBrowseScrollAnchor()) pinBrowseScrollY();
      });
    };
    return subscribeBrowseScrollRestored(onRestore);
  }, [displayedProducts.length]);

  const showCategoryEmptyState =
    marketProductCount <= 0 &&
    !isLoadingProducts &&
    displayedProducts.length === 0 &&
    browseCategory !== ALL_CATEGORIES_ID &&
    debouncedSearchQuery.trim() === "" &&
    !filtersActiveBeyondCategory;

  const shortcutBoards = useMemo(
    () =>
      resolveShortcutBoards(
        userLocation.countryCode,
        catalogMeta?.categoryCounts ?? initialMeta?.categoryCounts ?? {},
        catalogMeta?.categoryCovers ?? initialMeta?.categoryCovers
      ),
    [
      userLocation.countryCode,
      catalogMeta?.categoryCounts,
      initialMeta?.categoryCounts,
      catalogMeta?.categoryCovers,
      initialMeta?.categoryCovers,
    ]
  );
  const showShortcutBoards =
    browseCategory === ALL_CATEGORIES_ID &&
    !isSearching &&
    !filtersActiveBeyondCategory &&
    shortcutBoards.length > 0;
  return (
    <div className="relative w-full bg-slate-50 font-sans">
      {isLoadingProducts ? (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-amber-100 overflow-hidden">
          <div className="h-full bg-amber-500 animate-pulse w-full" />
        </div>
      ) : null}
      
      {/* Header */}
      <Header
        userLocation={userLocation}
        onCountryChange={changeCountry}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        locale={browseLocale}
        onLocaleChange={setBrowseLocale}
        availableLocales={availableLocales}
        selectedDomain={selectedDomain}
        onDomainChange={handleDomainChange}
        categoryOptions={categoryOptions}
        selectedCategoryId={browseCategory}
        onCategorySelect={handleCategoryChange}
        categoryCounts={catalogMeta?.categoryCounts}
        onGoHome={resetAllFilters}
      />

      {/* Full-width desktop content — no phone-shell max-width */}
      <main id="main-content" className="flex w-full min-w-0 flex-1 flex-col gap-4 px-3 py-4 sm:px-8 lg:px-12">
        <div className="space-y-3">
          {showShortcutBoards ? (
            <BrowseShortcutBoards
              boards={shortcutBoards}
              products={products}
              categoryCovers={catalogMeta?.categoryCovers}
              locale={browseLocale}
              onSelect={handleCategoryChange}
              variant="rail"
            />
          ) : null}

          {isLoadingProducts && products.length > 0 ? (
            <p
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"
              role="status"
              aria-live="polite"
            >
              {homeUi.updatingProducts}
            </p>
          ) : null}

          {browseCategory !== ALL_CATEGORIES_ID ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleCategoryChange(ALL_CATEGORIES_ID)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title={categoryUi.allCategories}
                  aria-label={categoryUi.allCategories}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                    {getLocalizedCategoryLabel(browseCategory, browseLocale)}
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-500">
                    {formatUi(homeUi.itemsFound, {
                      count:
                        (catalogMeta?.categoryCounts as Record<string, number> | undefined)?.[browseCategory] ??
                        catalogMeta?.totalMatched ??
                        displayedProducts.length,
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCategoryChange(ALL_CATEGORIES_ID)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                ✕ {categoryUi.allCategories}
              </button>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <label className="inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700">
              <span className="text-slate-500">{homeUi.storeDomainLabel}</span>
              <select
                aria-label={homeUi.storeDomainLabel}
                value={selectedDomain}
                onChange={(event) => handleDomainChange(event.target.value)}
                className="max-w-[10rem] min-w-0 bg-transparent text-[11px] font-bold text-slate-800 outline-none sm:max-w-[12rem]"
              >
                <option value="all">{homeUi.allStores}</option>
                {currentCountryInfo.merchantDomains.map((merchant) => (
                  <option key={merchant.id} value={merchant.domain}>
                    {merchant.domain}
                  </option>
                ))}
              </select>
            </label>

            <p className="whitespace-nowrap rounded-xl border border-emerald-100 bg-emerald-50/80 px-2.5 py-1.5 text-[11px] font-bold text-emerald-900" aria-live="polite">
              {isLoadingProducts
                ? homeUi.updatingProducts
                : formatUi(homeUi.itemsFound, {
                    count: catalogMeta?.totalMatched ?? displayedProducts.length,
                  })}
            </p>

            <OfferFilters
              compact
              criteria={filterControlCriteria}
              brandOptions={brandOptions}
              currencySymbol={currentCountryInfo.currencySymbol}
              locale={browseLocale}
              onChange={handleOfferFiltersChange}
            />

            <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {homeUi.sortLabel}
              </span>
              <select
                value={sortOrder}
                onChange={(event) => handleSortChange(event.target.value as SortOption)}
                className="cursor-pointer bg-transparent text-[11px] font-bold text-slate-800 outline-none"
              >
                <option value="default">{homeUi.sortRelevance}</option>
                <option value="price-asc">{homeUi.sortPriceAsc}</option>
                <option value="price-desc">{homeUi.sortPriceDesc}</option>
              </select>
            </label>
          </div>

          {totalPages > 1 ? (
            <nav className="flex items-center justify-between gap-2 sm:hidden" aria-label={homeUi.paginationNavigation}>
              <button type="button" aria-label={homeUi.previousPage} disabled={currentPage === 1 || isLoadingProducts} onClick={() => handlePageChange(currentPage - 1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-800 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-xs font-semibold text-slate-700">{formatUi(homeUi.pageOf, { page: currentPage, total: totalPages })}</p>
              <button type="button" aria-label={homeUi.nextPage} disabled={currentPage === totalPages || isLoadingProducts} onClick={() => handlePageChange(currentPage + 1)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-800 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          ) : null}

          {productFetchFailed ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950" role="alert">
              <p className="text-xs font-semibold">{sanitizeString(homeUi.productFetchError)}</p>
              <button
                type="button"
                onClick={() => {
                  setProductFetchFailed(false);
                  setReloadToken((token) => token + 1);
                }}
                className="min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                {homeUi.retryProducts}
              </button>
            </div>
          ) : null}

          {productFetchFailed && !isLoadingProducts && displayedProducts.length === 0 ? null : showCategoryEmptyState ? (
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
          ) : displayedProducts.length === 0 || isLoadingProducts ? (
            isLoadingProducts ? (
              <div id="product-results" className="scroll-mt-24 space-y-4" aria-busy="true">
                <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 sm:gap-3 animate-pulse">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs space-y-3"
                    >
                      <div className="aspect-square w-full rounded-xl bg-slate-100 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-slate-200" />
                      </div>
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                      <div className="pt-2 flex justify-between items-center">
                        <div className="h-5 w-1/3 rounded bg-slate-200" />
                        <div className="h-7 w-1/3 rounded-lg bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
            )
          ) : (
            <div className="space-y-4">
              <div
                id="product-results"
                className={`grid scroll-mt-24 grid-cols-1 gap-2.5 transition-opacity min-[480px]:grid-cols-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4 ${isLoadingProducts ? "opacity-60" : "opacity-100"}`}
                aria-busy={isLoadingProducts}
              >
                {displayedProducts.map((product) => (
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
              {totalPages > 1 ? (
                <nav
                  className="flex flex-wrap items-center justify-center gap-1.5 py-4"
                  aria-label={homeUi.paginationNavigation}
                >
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label={homeUi.previousPage}
                    disabled={currentPage === 1 || isLoadingProducts}
                    className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 shadow-xs hover:border-emerald-400 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{homeUi.previousPage}</span>
                  </button>
                  {paginationItems.map((item) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        disabled={isLoadingProducts}
                        aria-current={item === currentPage ? "page" : undefined}
                        aria-label={formatUi(homeUi.goToPage, { page: item })}
                        className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-xs font-extrabold shadow-xs transition-colors disabled:cursor-wait disabled:opacity-60 ${
                          item === currentPage
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-slate-300 bg-white text-slate-800 hover:border-emerald-400 hover:text-emerald-800"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        className="inline-flex h-11 min-w-8 items-center justify-center text-sm font-bold text-slate-400"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label={homeUi.nextPage}
                    disabled={currentPage === totalPages || isLoadingProducts}
                    className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 shadow-xs hover:border-emerald-400 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">{homeUi.nextPage}</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <p className="w-full pt-1 text-center text-[11px] font-semibold text-slate-500">
                    {formatUi(homeUi.pageOf, { page: currentPage, total: totalPages })}
                  </p>
                </nav>
              ) : (
                <p className="py-3 text-center text-xs text-slate-500">{homeUi.endOfCatalog}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <PromoCouponsSection coupons={coupons} userLocation={userLocation} />
          <section
            id="browse-offers"
            data-testid="market-disclaimer-bar"
            className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-white px-3 py-2.5"
          >
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
              <div className="min-w-0">
                <h2 className="text-xs font-extrabold tracking-tight text-slate-900">
                  {homeUi.marketHeroHeadline}
                </h2>
                <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-slate-500">
                  {homeUi.shortPitch2} {homeUi.shortPitch3}
                </p>
              </div>
              <nav
                className="flex shrink-0 flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-emerald-800"
                aria-label={homeUi.legalSupportMenu}
              >
                <Link href={withLangParam("/stores", browseLocale)} className="hover:underline">
                  {homeUi.stores}
                </Link>
                <Link href={withLangParam("/about", browseLocale)} className="hover:underline">
                  {homeUi.about}
                </Link>
                <Link href={withLangParam("/help", browseLocale)} className="hover:underline">
                  {homeUi.helpFAQ}
                </Link>
                <Link href={withLangParam("/contact", browseLocale)} className="hover:underline">
                  {homeUi.contact}
                </Link>
              </nav>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-emerald-100 pt-2 text-[10px] text-slate-500">
              <Link
                href={withLangParam("/legal", browseLocale)}
                className="hover:text-slate-800 hover:underline"
              >
                {homeUi.legalCompanyLink}
              </Link>
              <button
                type="button"
                onClick={() => setIsDisclosureOpen(true)}
                className="inline-flex items-center gap-1 hover:text-slate-800"
              >
                <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
                {homeUi.howCommissions}
              </button>
              <Link
                href={withLangParam("/disclaimer", browseLocale)}
                className="hover:text-slate-800 hover:underline"
              >
                {homeUi.priceServiceDisclaimer}
              </Link>
            </div>
          </section>
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
