"use client";

import { useState, useEffect, useId, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, Layers, Check } from "lucide-react";
import { Product } from "@/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { productPagePathWithReturn } from "@/lib/seo/site-url";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { ALL_CATEGORIES_ID } from "@/lib/categories";
import type { SiteLocale } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import type { BrowseCategoryOption } from "@/components/BrowseCategoryOption";

/** Case/diacritic-insensitive match for live category filtering. */
function foldSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

interface SearchAutocompleteProps {
  initialQuery?: string;
  placeholder?: string;
  onSearchSubmit?: (query: string) => void;
  countryCode?: string;
  locale?: SiteLocale;
  /** Occupied categories for the current market (shown when search is focused). */
  categoryOptions?: BrowseCategoryOption[];
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function SearchAutocomplete({
  initialQuery = "",
  placeholder,
  onSearchSubmit,
  countryCode = DEFAULT_COUNTRY,
  locale = "en",
  categoryOptions = [],
  selectedCategoryId = ALL_CATEGORIES_ID,
  onCategorySelect,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const listboxId = useId();
  const ui = HOME_UI[locale];
  const resolvedPlaceholder = placeholder ?? ui.searchPlaceholder.replace("{country}", "");
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 300);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const country = COUNTRIES[countryCode as keyof typeof COUNTRIES] || COUNTRIES[DEFAULT_COUNTRY];

  const filteredCategories = useMemo(() => {
    if (!onCategorySelect || categoryOptions.length === 0) return [];
    const needle = foldSearchText(query);
    if (!needle) return categoryOptions;
    return categoryOptions.filter((option) => foldSearchText(option.label).includes(needle));
  }, [categoryOptions, onCategorySelect, query]);

  const canBrowseCategories = Boolean(onCategorySelect) && categoryOptions.length > 0;
  /** Empty / 1-letter query: category panel (live filter). 2+ letters: categories only if they still match. */
  const showCategoryPanel =
    isOpen &&
    canBrowseCategories &&
    (query.trim().length < 2 || filteredCategories.length > 0);
  const showProductResults = isOpen && debouncedQuery.trim().length >= 2;
  const showDropdown = showCategoryPanel || showProductResults;
  const categoryCount = showCategoryPanel ? filteredCategories.length : 0;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 6_000);
    setIsLoading(true);

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(debouncedQuery)}&limit=5&country=${countryCode}&locale=${locale}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setResults(data.products || []);
        setActiveIndex(-1);
        setIsLoading(false);
        setIsOpen(true);
      } catch (_error) {
        if (controller.signal.aborted) return;
        setResults([]);
        setActiveIndex(-1);
        setIsLoading(false);
      } finally {
        window.clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    void fetchSuggestions();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [debouncedQuery, countryCode, locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  const pickCategory = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const productCount = showProductResults ? results.length : 0;
  const totalOptions = categoryCount + productCount;

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!showDropdown || totalOptions === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % totalOptions);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? totalOptions - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      if (activeIndex < categoryCount) {
        const option = filteredCategories[activeIndex];
        if (option) pickCategory(option.id);
        return;
      }
      const product = results[activeIndex - categoryCount];
      if (product) {
        setIsOpen(false);
        router.push(productPagePathWithReturn(product.id, "/", locale));
      }
    }
  };

  return (
    <div className="relative w-full max-w-none" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleInputKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-label={resolvedPlaceholder}
          placeholder={resolvedPlaceholder}
          className="w-full rounded-lg border border-transparent bg-slate-100 py-2.5 pl-10 pr-3 text-[clamp(0.875rem,0.35vw+0.75rem,1rem)] font-medium outline-none transition-all placeholder:text-slate-400 hover:bg-slate-100/80 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" aria-hidden="true" />
          </div>
        )}
      </form>

      {showDropdown && (
        <div className="absolute top-full right-0 left-0 z-[100] mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
          {showCategoryPanel && (
            <div className={showProductResults ? "border-b border-slate-100" : undefined}>
              <div className="border-b border-slate-100 px-4 py-2.5">
                <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  {ui.browseCategoriesTitle}
                </p>
                <p className="text-[11px] text-slate-400">
                  {query.trim()
                    ? ui.browseCategoriesFilterHint
                    : formatUi(ui.browseCategoriesHint, { country: country.name })}
                </p>
              </div>
              {filteredCategories.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-500">{ui.browseCategoriesNoMatch}</p>
              ) : (
                <ul
                  id={!showProductResults ? listboxId : undefined}
                  role="listbox"
                  className="py-1"
                >
                  {filteredCategories.map((option, index) => {
                    const active = activeIndex === index;
                    const selected = selectedCategoryId === option.id;
                    return (
                      <li
                        key={option.id}
                        id={`${listboxId}-option-${index}`}
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <button
                          type="button"
                          onClick={() => pickCategory(option.id)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            active ? "bg-emerald-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <Layers
                            className={`h-4 w-4 shrink-0 ${selected ? "text-emerald-700" : "text-slate-400"}`}
                            aria-hidden="true"
                          />
                          <span
                            className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                              selected ? "text-emerald-900" : "text-slate-800"
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {option.count}
                          </span>
                          {selected ? (
                            <Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                          ) : (
                            <span className="w-4" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {showProductResults && (
            <div>
              {showCategoryPanel && filteredCategories.length > 0 && (
                <div className="border-b border-slate-100 px-4 py-2">
                  <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    {ui.searchProductsSectionTitle}
                  </p>
                </div>
              )}
              {!isLoading && results.length === 0 ? (
                <div role="status" className="p-4 text-center text-sm font-medium text-slate-500">
                  {formatUi(ui.searchNoProductsFor, { query: debouncedQuery })}
                </div>
              ) : (
                <ul id={listboxId} role="listbox" className="py-2">
                  {results.map((product, index) => {
                    const optionIndex = categoryCount + index;
                    const bestOffer = sortOffersByTotalPrice(product.offers)[0];
                    const lowestTotal = bestOffer
                      ? (bestOffer.totalPrice ?? computeTotalPrice(bestOffer))
                      : null;

                    return (
                      <li
                        key={product.id}
                        id={`${listboxId}-option-${optionIndex}`}
                        role="option"
                        aria-selected={activeIndex === optionIndex}
                        onMouseEnter={() => setActiveIndex(optionIndex)}
                      >
                        <Link
                          href={productPagePathWithReturn(product.id, "/", locale)}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-4 border-b border-slate-100 px-4 py-3 transition-colors last:border-0 ${
                            activeIndex === optionIndex ? "bg-emerald-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100 p-1">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.title}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-slate-400 uppercase">
                                {ui.noImageLabel}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="mb-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                              {product.brand}
                            </p>
                            <p className="truncate text-sm leading-tight font-semibold text-slate-900">
                              {product.title}
                            </p>
                            {lowestTotal != null && (
                              <p className="mt-1 text-xs font-bold text-slate-700">
                                {ui.searchFromPriceLabel} {country.currencySymbol}
                                {lowestTotal.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}

                  <li className="border-t border-slate-200 bg-slate-50 p-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full rounded-lg p-2 text-center text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100/50 hover:text-emerald-800"
                    >
                      {formatUi(ui.searchViewAllResults, { query: debouncedQuery })} →
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
