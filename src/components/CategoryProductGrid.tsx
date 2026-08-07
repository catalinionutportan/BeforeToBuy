"use client";

import { CountryCode, Product } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { ProductCard } from "@/components/ProductCard";

interface CategoryProductGridProps {
  products: Product[];
  countryCode?: CountryCode;
}

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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          userLocation={userLocation}
          onSelectOffer={() => undefined}
        />
      ))}
    </div>
  );
}
