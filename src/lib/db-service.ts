import { prisma } from "@/lib/db";
import type { CountryCode, Product, Offer } from "@/types";
import { getParentCategoryId, resolveCategoryAlias } from "@/lib/categories";
import { expandCategoryFilterToDbIds } from "@/lib/db-category-filter";

/** Convert Prisma Offer to Application Offer */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** Fix common CDN URL issues (+ as space in evoMAG file params). */
export function normalizeProductImageUrl(
  image: string | null | undefined
): string | undefined {
  if (!image?.trim()) return undefined;
  const raw = image.trim();
  try {
    const url = new URL(raw);
    if (url.hostname.includes("evomag.ro") && url.searchParams.has("file")) {
      const file = url.searchParams.get("file") || "";
      url.searchParams.set("file", file.replace(/\+/g, " "));
    }
    return url.toString();
  } catch {
    return raw;
  }
}

/** Convert Prisma Product to Application Product */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPrismaProduct(p: any): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description || "",
    gtin: p.gtin || undefined,
    brand: p.brand || undefined,
    category: resolveCategoryAlias(p.category),
    image: normalizeProductImageUrl(p.image) || p.image || undefined,
    catalogSource: p.catalogSource as Product["catalogSource"],
    targetCountries: (p.targetCountries || []) as CountryCode[],
    offers: p.offers ? p.offers.map(mapPrismaOffer) : [],
    basePrice: p.basePrice || undefined,
  };
}

function buildWhere(countryCode: string, query?: string, category?: string) {
  const where: Record<string, unknown> = {
    targetCountries: { has: countryCode },
  };

  const categoryIds = expandCategoryFilterToDbIds(category);
  if (categoryIds) {
    where.category = { in: categoryIds };
  }

  if (query?.trim()) {
    where.title = {
      contains: query.trim(),
      mode: "insensitive",
    };
  }

  return where;
}

/** Full-catalog counts for menu/hubs (not just the current page). */
export async function getCategoryCountsFromDb(countryCode: string): Promise<{
  categoryCounts: Record<string, number>;
  leafCounts: Record<string, number>;
}> {
  const rows = await prisma.product.groupBy({
    by: ["category"],
    where: { targetCountries: { has: countryCode } },
    _count: { _all: true },
  });

  const leafCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  for (const row of rows) {
    const leafId = resolveCategoryAlias(row.category);
    const n = row._count._all;
    leafCounts[leafId] = (leafCounts[leafId] ?? 0) + n;
    categoryCounts[leafId] = (categoryCounts[leafId] ?? 0) + n;
    const parentId = getParentCategoryId(leafId);
    if (parentId && parentId !== leafId) {
      categoryCounts[parentId] = (categoryCounts[parentId] ?? 0) + n;
    }
  }
  return { categoryCounts, leafCounts };
}

/** Fetch filtered products directly from Supabase DB */
export async function getProductsFromDb(
  countryCode: string,
  query?: string,
  category?: string,
  limit?: number,
  offset?: number,
  sort?: string
) {
  const whereClause = buildWhere(countryCode, query, category);
  const take = limit == null ? 100 : Math.max(0, Math.floor(limit));
  const skip = Math.max(0, Math.floor(offset || 0));

  let orderBy: any = { updatedAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { basePrice: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { basePrice: "desc" };
  }

  const [products, total, countMaps, countryTotal] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { offers: true },
      take,
      skip,
      orderBy,
    }),
    prisma.product.count({ where: whereClause }),
    getCategoryCountsFromDb(countryCode),
    prisma.product.count({
      where: { targetCountries: { has: countryCode } },
    }),
  ]);

  return {
    products: products.map(mapPrismaProduct),
    totalMatched: total,
    categoryCounts: countMaps.categoryCounts,
    leafCounts: countMaps.leafCounts,
    countryProductCount: countryTotal,
  };
}
