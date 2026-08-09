"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CountryCode, Product } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { ProductCard } from "@/components/ProductCard";
import { sortProductsForBrowse, SortOption } from "@/lib/browse-product-order";
import { ArrowDownAZ, ArrowUpAZ, ArrowDown, ArrowUp } from "lucide-react";

interface CategoryProductGridProps {
  products: Product[];
  countryCode?: CountryCode;
}

const INITIAL_VISIBLE = 24;
const LOAD_MORE_STEP = 24;

export function CategoryProductGrid({
  products,
  countryCode = DEFAULT_COUNTRY,
}: CategoryProductGridProps) {
  const country = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  const userLocation = {
    latitude: country.defaultCoordinates.lat,
    longitude: country.defaultCoordinates.lng,
    countryCode: country.code,
    countryName: country.name,
    city: country.defaultCoordinates.city,
    isGps: false,
  };

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [sortOrder, setSortOrder] = useState<SortOption>("default");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const orderedProducts = useMemo(() => sortProductsForBrowse(products, sortOrder), [products, sortOrder]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [products]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((count) =>
          Math.min(count + LOAD_MORE_STEP, orderedProducts.length)
        );
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [orderedProducts.length]);

  const visibleProducts = orderedProducts.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-2">Sortează:</span>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOption)}
            className="text-sm font-semibold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer pr-4"
          >
            <option value="default">Relevanță</option>
            <option value="price-asc">Cel mai mic preț (↑)</option>
            <option value="price-desc">Cel mai mare preț (↓)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            userLocation={userLocation}
            onSelectOffer={() => undefined}
          />
        ))}
      </div>
      {visibleCount < orderedProducts.length ? (
        <div ref={loadMoreRef} className="py-2 text-center text-xs text-slate-500">
          {visibleCount} / {orderedProducts.length}
        </div>
      ) : null}
    </div>
  );
}
