import { prisma } from "@/lib/db";
import type { Product, Offer } from "@/types";
import { resolveCategoryAlias } from "@/lib/categories";

/** Convert Prisma Offer to Application Offer */
function mapPrismaOffer(o: any): Offer {
  return {
    id: o.id,
    storeName: o.storeName,
    price: o.price,
    originalPrice: o.originalPrice || undefined,
    discountPercentage: o.discountPercentage || undefined,
    currency: o.currency,
    inStock: o.inStock,
    deliveryTime: o.deliveryTime || undefined,
    deliveryCost: o.deliveryCost || undefined,
    totalPrice: o.totalPrice || undefined,
    purchaseUrl: o.purchaseUrl,
    affiliateNetwork: o.affiliateNetwork || undefined,
    source: o.source as Offer["source"],
    type: "online",
    feedMerchantId: o.feedMerchantId || undefined,
    merchantProductId: o.merchantProductId || undefined,
    fetchedAt: o.fetchedAt,
  };
}

/** Convert Prisma Product to Application Product */
function mapPrismaProduct(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description || "",
    gtin: p.gtin || undefined,
    brand: p.brand || undefined,
    category: resolveCategoryAlias(p.category),
    image: p.image || undefined,
    catalogSource: p.catalogSource as Product["catalogSource"],
    targetCountries: p.targetCountries,
    offers: p.offers ? p.offers.map(mapPrismaOffer) : [],
    basePrice: p.basePrice || undefined,
  };
}

/** Fetch filtered products directly from Supabase DB */
export async function getProductsFromDb(
  countryCode: string,
  query?: string,
  category?: string,
  limit?: number,
  offset?: number
) {
  const whereClause: Record<string, unknown> = {
    targetCountries: {
      has: countryCode,
    },
  };

  if (category && category !== "all") {
    whereClause.category = category;
  }

  if (query && query.trim() !== "") {
    whereClause.title = {
      contains: query.trim(),
      mode: "insensitive",
    };
  }

  const take = limit == null ? 100 : Math.max(0, Math.floor(limit));
  const skip = Math.max(0, Math.floor(offset || 0));

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { offers: true },
      take,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  return {
    products: products.map(mapPrismaProduct),
    totalMatched: total,
  };
}
