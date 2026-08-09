"use client";

import { useState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { productPagePathWithReturn } from "@/lib/seo/site-url";
import { shouldUseNativeProductImage } from "@/lib/utils/product-image";
import { computeTotalPrice, sortOffersByTotalPrice } from "@/lib/pricing/total-price";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import type { SiteLocale } from "@/lib/i18n/locales";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

interface SearchAutocompleteProps {
  initialQuery?: string;
  placeholder?: string;
  onSearchSubmit?: (query: string) => void;
  countryCode?: string;
  locale?: SiteLocale;
}

export function SearchAutocomplete({
  initialQuery = "",
  placeholder,
  onSearchSubmit,
  countryCode = DEFAULT_COUNTRY,
  locale = "en",
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

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
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
      }
    };

    fetchSuggestions();
    
    return () => {
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

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1
      );
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const product = results[activeIndex];
      setIsOpen(false);
      router.push(productPagePathWithReturn(product.id, "/", locale));
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
            if (e.target.value.trim().length > 1) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 1) setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && debouncedQuery.trim().length >= 2}
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
            <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" aria-hidden="true" />
          </div>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && debouncedQuery.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden z-[100] max-h-[80vh] overflow-y-auto">
          {!isLoading && results.length === 0 ? (
            <div role="status" className="p-4 text-center text-sm text-slate-500 font-medium">
              {formatUi(ui.searchNoProductsFor, { query: debouncedQuery })}
            </div>
          ) : (
            <ul id={listboxId} role="listbox" className="py-2">
              {results.map((product, index) => {
                const bestOffer = sortOffersByTotalPrice(product.offers)[0];
                
                const lowestTotal = bestOffer ? (bestOffer.totalPrice ?? computeTotalPrice(bestOffer)) : null;

                return (
                  <li
                    key={product.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <Link
                      href={productPagePathWithReturn(product.id, "/", locale)}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 transition-colors border-b border-slate-100 last:border-0 ${activeIndex === index ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                    >
                      <div className="relative w-12 h-12 shrink-0 bg-slate-100 rounded-md overflow-hidden p-1 border border-slate-200">
                        {product.image ? (
                          shouldUseNativeProductImage(product.image) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image} alt={product.title} className="w-full h-full object-contain" />
                          ) : (
                            <Image src={product.image} alt={product.title} fill sizes="48px" className="object-contain p-1" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase">
                            {ui.noImageLabel}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">{product.brand}</p>
                        <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{product.title}</p>
                        {lowestTotal != null && (
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {ui.searchFromPriceLabel} {country.currencySymbol}
                            {lowestTotal.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
              
              <li className="bg-slate-50 border-t border-slate-200 p-2">
                <button 
                  onClick={handleSubmit}
                  className="w-full text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 p-2 rounded-lg hover:bg-emerald-100/50 transition-colors"
                >
                  {formatUi(ui.searchViewAllResults, { query: debouncedQuery })} →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
