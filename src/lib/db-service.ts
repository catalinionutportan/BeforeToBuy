import { prisma } from "@/lib/db";
import { Prisma, type Offer as PrismaOffer } from "@prisma/client";
import type { CountryCode, Product, Offer } from "@/types";
import { getParentCategoryId, resolveCategoryAlias } from "@/lib/categories";
import { expandCategoryFilterToDbIds } from "@/lib/db-category-filter";
import type { OfferFilterCriteria } from "@/lib/offers/offer-filters";
import { sanitizeProductImageForRender } from "@/lib/feed-url-policy";

type PrismaProductWithOffers = Prisma.ProductGetPayload<{ include: { offers: true } }>;

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
    image: sanitizeProductImageForRender(normalizeProductImageUrl(p.image) || p.image || ""),
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
    and.push({ deliveryCost: { not: null, lte: 0 } });
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

/** Global price sort via SQL MIN(offer total) — no in-memory scan cap. */
async function queryProductIdsByMinOfferTotal(
  countryCode: string,
  query: string | undefined,
  category: string | undefined,
  filters: OfferFilterCriteria,
  sort: "price-asc" | "price-desc",
  take: number,
  skip: number
): Promise<string[]> {
  const categoryIds = expandCategoryFilterToDbIds(category);
  const orderDir = sort === "price-desc" ? Prisma.raw("DESC") : Prisma.raw("ASC");

  const categorySql = categoryIds?.length
    ? Prisma.sql`AND p.category IN (${Prisma.join(categoryIds)})`
    : Prisma.empty;

  const trimmedQuery = query?.trim();
  const queryPattern = trimmedQuery ? `%${trimmedQuery}%` : null;
  const querySql = queryPattern
    ? Prisma.sql`AND (
        p.title ILIKE ${queryPattern}
        OR p.brand ILIKE ${queryPattern}
        OR p.description ILIKE ${queryPattern}
        OR p.gtin ILIKE ${queryPattern}
      )`
    : Prisma.empty;

  const brandSql = filters.brand
    ? Prisma.sql`AND LOWER(p.brand) = LOWER(${filters.brand.trim()})`
    : Prisma.empty;

  const gtinSql = filters.hasGtinOnly ? Prisma.sql`AND p.gtin IS NOT NULL` : Prisma.empty;

  const offerClauses: Prisma.Sql[] = [Prisma.sql`o."inStock" = true`];

  if (filters.domain && filters.domain !== "all") {
    const domain = filters.domain.trim();
    const token = domain.split(".")[0] || domain;
    offerClauses.push(
      Prisma.sql`(o."storeName" ILIKE ${`%${token}%`} OR o."purchaseUrl" ILIKE ${`%${domain}%`})`
    );
  }
  if (filters.inStockOnly) {
    offerClauses.push(Prisma.sql`o."inStock" = true`);
  }
  if (filters.freeDeliveryOnly) {
    offerClauses.push(Prisma.sql`o."deliveryCost" IS NOT NULL AND o."deliveryCost" <= 0`);
  }
  if (filters.minTotalPrice != null) {
    offerClauses.push(
      Prisma.sql`COALESCE(o."totalPrice", o.price + COALESCE(o."deliveryCost", 0)) >= ${filters.minTotalPrice}`
    );
  }
  if (filters.maxTotalPrice != null) {
    offerClauses.push(
      Prisma.sql`COALESCE(o."totalPrice", o.price + COALESCE(o."deliveryCost", 0)) <= ${filters.maxTotalPrice}`
    );
  }

  const offerWhereSql = Prisma.join(offerClauses, " AND ");

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM "Product" p
    INNER JOIN (
      SELECT o."productId",
        MIN(COALESCE(o."totalPrice", o.price + COALESCE(o."deliveryCost", 0))) AS min_total
      FROM "Offer" o
      WHERE ${offerWhereSql}
      GROUP BY o."productId"
    ) priced ON priced."productId" = p.id
    WHERE ${countryCode} = ANY(p."targetCountries")
    ${categorySql}
    ${querySql}
    ${brandSql}
    ${gtinSql}
    ORDER BY priced.min_total ${orderDir}, p.id ASC
    LIMIT ${take}
    OFFSET ${skip}
  `;

  return rows.map((row) => row.id);
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

  // Secondary id keeps OFFSET pages stable (updatedAt ties otherwise skip/dup rows).
  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
    { updatedAt: "desc" },
    { id: "asc" },
  ];
  const brandWhere = buildWhere(countryCode, query, category, { ...filters, brand: undefined });

  const pricedIdsPromise = sortByOfferTotal
    ? queryProductIdsByMinOfferTotal(
        countryCode,
        query,
        category,
        filters,
        sort as "price-asc" | "price-desc",
        take,
        skip
      )
    : Promise.resolve(null);

  const [pricedIds, productsDefault, total, countMaps, countryTotal, brandRows] =
    await Promise.all([
      pricedIdsPromise,
      sortByOfferTotal
        ? Promise.resolve([] as PrismaProductWithOffers[])
        : prisma.product.findMany({
            where: whereClause,
            include: { offers: { where: visibleOfferWhere } },
            take,
            skip,
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

  let pageProducts: PrismaProductWithOffers[];
  if (sortByOfferTotal && pricedIds) {
    if (pricedIds.length === 0) {
      pageProducts = [];
    } else {
      const fetched = await prisma.product.findMany({
        where: { id: { in: pricedIds } },
        include: { offers: { where: visibleOfferWhere } },
      });
      const byId = new Map(fetched.map((product) => [product.id, product]));
      pageProducts = pricedIds
        .map((id) => byId.get(id))
        .filter((product): product is PrismaProductWithOffers => Boolean(product));
    }
  } else {
    pageProducts = productsDefault;
  }

  pageProducts = pageProducts.filter((product) => product.offers.length > 0);

  const products = pageProducts
    .map(mapPrismaProduct)
    .filter((product) => product.offers.length > 0);

  return {
    products,
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
