import { prisma } from "@/lib/db";
import type { Offer as PrismaOffer, Prisma } from "@prisma/client";
import type { CountryCode, Product, Offer } from "@/types";
import { getParentCategoryId, resolveCategoryAlias } from "@/lib/categories";
import { expandCategoryFilterToDbIds } from "@/lib/db-category-filter";
import type { OfferFilterCriteria } from "@/lib/offers/offer-filters";

type PrismaProductWithOffers = Prisma.ProductGetPayload<{ include: { offers: true } }>;

function lowestOfferTotal(product: PrismaProductWithOffers): number {
  return product.offers.reduce(
    (lowest, offer) => Math.min(lowest, offer.totalPrice ?? offer.price + (offer.deliveryCost ?? 0)),
    Number.POSITIVE_INFINITY
  );
}

/** Convert Prisma Offer to Application Offer */
function mapPrismaOffer(o: PrismaOffer): Offer {
  return {
    id: o.id,
    storeName: o.storeName,
    price: o.price,
    originalPrice: o.originalPrice ?? undefined,
    discountPercentage: o.discountPercentage ?? undefined,
    currency: o.currency,
    inStock: o.inStock,
    deliveryTime: o.deliveryTime || undefined,
    deliveryCost: o.deliveryCost ?? undefined,
    totalPrice: o.totalPrice ?? undefined,
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
export function mapPrismaProduct(p: PrismaProductWithOffers): Product {
  return {
    id: p.id,
    title: p.title,
    description: p.description || "",
    gtin: p.gtin || undefined,
    brand: p.brand || "",
    category: resolveCategoryAlias(p.category),
    image: normalizeProductImageUrl(p.image) || p.image || "",
    catalogSource: p.catalogSource as Product["catalogSource"],
    targetCountries: (p.targetCountries || []) as CountryCode[],
    offers: p.offers ? p.offers.map(mapPrismaOffer) : [],
    basePrice: p.basePrice ?? undefined,
  };
}

function buildOfferWhere(filters: OfferFilterCriteria = {}): Prisma.OfferWhereInput | undefined {
  const and: Prisma.OfferWhereInput[] = [];

  if (filters.domain && filters.domain !== "all") {
    const domain = filters.domain.trim();
    const token = domain.split(".")[0] || domain;
    and.push({
      OR: [
        { storeName: { contains: token, mode: "insensitive" } },
        { purchaseUrl: { contains: domain, mode: "insensitive" } },
      ],
    });
  }
  if (filters.inStockOnly) and.push({ inStock: true });
  if (filters.freeDeliveryOnly) {
    and.push({ deliveryCost: { lte: 0 } });
  }

  const totalRange: Prisma.FloatNullableFilter = {};
  const priceRange: Prisma.FloatFilter = {};
  if (filters.minTotalPrice != null) {
    totalRange.gte = filters.minTotalPrice;
    priceRange.gte = filters.minTotalPrice;
  }
  if (filters.maxTotalPrice != null) {
    totalRange.lte = filters.maxTotalPrice;
    priceRange.lte = filters.maxTotalPrice;
  }
  if (Object.keys(totalRange).length > 0) {
    and.push({
      OR: [
        { totalPrice: totalRange },
        { totalPrice: null, price: priceRange },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : undefined;
}

function buildWhere(
  countryCode: string,
  query?: string,
  category?: string,
  filters: OfferFilterCriteria = {}
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    targetCountries: { has: countryCode },
  };

  const categoryIds = expandCategoryFilterToDbIds(category);
  if (categoryIds) {
    where.category = { in: categoryIds };
  }

  if (query?.trim()) {
    const contains = { contains: query.trim(), mode: "insensitive" as const };
    where.OR = [
      { title: contains },
      { brand: contains },
      { description: contains },
      { gtin: contains },
    ];
  }

  if (filters.brand) {
    where.brand = { equals: filters.brand.trim(), mode: "insensitive" };
  }
  if (filters.hasGtinOnly) where.gtin = { not: null };

  // Catalogue only surfaces products with at least one in-stock offer.
  // Soft-paused merchants (e.g. evoMAG image CDN) set inStock=false to hide without delete.
  const offerWhere = buildOfferWhere(filters);
  where.offers = {
    some: offerWhere ? { AND: [offerWhere, { inStock: true }] } : { inStock: true },
  };

  return where;
}

/** Full-catalog counts for menu/hubs (not just the current page). */
export async function getCategoryCountsFromDb(countryCode: string): Promise<{
  categoryCounts: Record<string, number>;
  leafCounts: Record<string, number>;
}> {
  const rows = await prisma.product.groupBy({
    by: ["category"],
    where: {
      targetCountries: { has: countryCode },
      offers: { some: { inStock: true } },
    },
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
  sort?: string,
  filters: OfferFilterCriteria = {}
) {
  const whereClause = buildWhere(countryCode, query, category, filters);
  const offerWhere = buildOfferWhere(filters);
  const visibleOfferWhere: Prisma.OfferWhereInput = offerWhere
    ? { AND: [offerWhere, { inStock: true }] }
    : { inStock: true };
  const take = limit == null ? 100 : Math.max(0, Math.floor(limit));
  const skip = Math.max(0, Math.floor(offset || 0));
  const sortByOfferTotal = sort === "price-asc" || sort === "price-desc";

  const orderBy: Prisma.ProductOrderByWithRelationInput = { updatedAt: "desc" };
  const brandWhere = buildWhere(countryCode, query, category, { ...filters, brand: undefined });
  const [products, total, countMaps, countryTotal, brandRows] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: { offers: { where: visibleOfferWhere } },
      take: sortByOfferTotal ? undefined : take,
      skip: sortByOfferTotal ? undefined : skip,
      orderBy,
    }),
    prisma.product.count({ where: whereClause }),
    getCategoryCountsFromDb(countryCode),
    prisma.product.count({
      where: {
        targetCountries: { has: countryCode },
        offers: { some: { inStock: true } },
      },
    }),
    prisma.product.findMany({
      where: { ...brandWhere, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  const pageProducts = sortByOfferTotal
    ? products
        .sort((a, b) => {
          const difference = lowestOfferTotal(a) - lowestOfferTotal(b);
          return sort === "price-desc" ? -difference : difference;
        })
        .slice(skip, skip + take)
    : products;

  return {
    products: pageProducts.map(mapPrismaProduct),
    totalMatched: total,
    categoryCounts: countMaps.categoryCounts,
    leafCounts: countMaps.leafCounts,
    countryProductCount: countryTotal,
    brandOptions: Array.from(
      new Map(
        brandRows
          .map((row) => row.brand?.trim())
          .filter((brand): brand is string => Boolean(brand))
          .map((brand) => [brand.toLocaleLowerCase(), brand] as const)
      ).values()
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
  };
}

/** Production offers used by the scheduled price-history snapshot. */
export async function getSnapshotProductsFromDb(countryCode: CountryCode): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      targetCountries: { has: countryCode },
      offers: { some: { source: "production-live", inStock: true } },
    },
    include: {
      offers: {
        where: { source: "production-live", inStock: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return products.map(mapPrismaProduct);
}
