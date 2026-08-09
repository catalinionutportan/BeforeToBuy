import { getProductById } from "@/lib/product-lookup";
import { notFound } from "next/navigation";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import type { CountryCode } from "@/types";
import { CompareEmptyState, CompareProductsView } from "@/components/CompareProductsView";

type PageProps = {
  searchParams: Promise<{ ids?: string }>;
};

export default async function CompareProductsPage({ searchParams }: PageProps) {
  const { ids } = await searchParams;

  if (!ids) {
    return <CompareEmptyState />;
  }

  const productIds = ids.split(",").map((id) => id.trim()).filter(Boolean);
  if (productIds.length < 2) notFound();

  const [product1, product2] = await Promise.all([
    getProductById(productIds[0]),
    getProductById(productIds[1]),
  ]);

  if (!product1 || !product2) notFound();

  const countryCode = (product1.targetCountries[0] || DEFAULT_COUNTRY) as CountryCode;

  return (
    <CompareProductsView
      product1={product1}
      product2={product2}
      countryCode={countryCode}
    />
  );
}
