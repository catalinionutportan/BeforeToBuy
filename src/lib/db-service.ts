import { prisma } from "@/lib/db";
import { Prisma, type Offer as PrismaOffer } from "@prisma/client";
import type { CountryCode, Product, Offer } from "@/types";
import { getParentCategoryId, resolveCategoryAlias } from "@/lib/categories";
import { expandCategoryFilterToDbIds } from "@/lib/db-category-filter";
import {
  hasActiveOfferFilters,
  type OfferFilterCriteria,
} from "@/lib/offers/offer-filters";
import { sanitizeProductImageForRender, SAFE_IMAGE_FALLBACK } from "@/lib/feed-url-policy";
import {
  getCachedBrowseMeta,
  getCachedChLeadIds,
  setCachedBrowseMeta,
  setCachedChLeadIds,
} from "@/lib/catalog-browse-cache";
import { buildCategoryCoverMap } from "@/lib/browse-shortcut-boards";
import {
  LAPTOP_COVER_TITLE_EXCLUDE,
  LAPTOP_COVER_TITLE_TOKENS,
  NOTEBOOKS_LAPTOPS_LEAF,
} from "@/lib/laptop-aisle-cover";
import {
  AUTO_COMPLETE_WHEELS_LEAF,
  AUTO_TIRES_LEAF,
  REIFEN_FEED_MERCHANT_ID,
  REIFEN_RIM_TITLE_CONTAINS,
  preferredReifenRimTitleContains,
  resolveAutoLeafFromTitle,
} from "@/lib/reifen-wheel-split";

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
    category: resolveAutoLeafFromTitle(resolveCategoryAlias(p.category), p.title),
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

const REIFEN_RIM_TITLE_OR: Prisma.ProductWhereInput[] = REIFEN_RIM_TITLE_CONTAINS.map(
  (token) => ({ title: { contains: token, mode: "insensitive" as const } })
);

function reifenRimOfferWhere(): Prisma.ProductWhereInput {
  return {
    offers: {
      some: { inStock: true, feedMerchantId: REIFEN_FEED_MERCHANT_ID },
    },
  };
}

function reifenTitleSplitWhere(
  category?: string
): Prisma.ProductWhereInput | undefined {
  const resolved = category ? resolveCategoryAlias(category) : "";
  if (resolved === AUTO_COMPLETE_WHEELS_LEAF) {
    return {
      OR: [
        { category: AUTO_COMPLETE_WHEELS_LEAF },
        { AND: [reifenRimOfferWhere(), { OR: REIFEN_RIM_TITLE_OR }] },
      ],
    };
  }
  if (resolved === AUTO_TIRES_LEAF) {
    return {
      category: AUTO_TIRES_LEAF,
      NOT: { OR: REIFEN_RIM_TITLE_OR },
    };
  }
  return undefined;
}

function categoryConstraintSql(category?: string): Prisma.Sql {
  const resolved = category ? resolveCategoryAlias(category) : "";
  if (resolved === AUTO_COMPLETE_WHEELS_LEAF) {
    const rimTitleSql = Prisma.join(
      REIFEN_RIM_TITLE_CONTAINS.map((token) => Prisma.sql`p.title ILIKE ${`%${token}%`}`),
      " OR "
    );
    return Prisma.sql`AND (
      p.category = ${AUTO_COMPLETE_WHEELS_LEAF}
      OR (
        EXISTS (
          SELECT 1 FROM "Offer" o
          WHERE o."productId" = p.id
            AND o."feedMerchantId" = ${REIFEN_FEED_MERCHANT_ID}
        )
        AND (${rimTitleSql})
      )
    )`;
  }
  if (resolved === AUTO_TIRES_LEAF) {
    const notRimTitleSql = Prisma.join(
      REIFEN_RIM_TITLE_CONTAINS.map((token) => Prisma.sql`p.title NOT ILIKE ${`%${token}%`}`),
      " AND "
    );
    return Prisma.sql`AND p.category = ${AUTO_TIRES_LEAF}
      AND ${notRimTitleSql}`;
  }
  const categoryIds = expandCategoryFilterToDbIds(category);
  if (categoryIds?.length) {
    return Prisma.sql`AND p.category IN (${Prisma.join(categoryIds)})`;
  }
  return Prisma.empty;
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
  const titleSplit = reifenTitleSplitWhere(category);
  if (titleSplit) {
    Object.assign(where, titleSplit);
  } else if (categoryIds) {
    where.category = { in: categoryIds };
  }

  if (query?.trim()) {
    const contains = { contains: query.trim(), mode: "insensitive" as const };
    const searchOr: Prisma.ProductWhereInput[] = [
      { title: contains },
      { brand: contains },
      { description: contains },
      { gtin: contains },
    ];
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchOr }];
      delete where.OR;
    } else {
      where.OR = searchOr;
    }
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

  const tiresInCatalog = leafCounts[AUTO_TIRES_LEAF] ?? 0;
  if (tiresInCatalog > 0) {
    const rimAmongTires = await prisma.product.count({
      where: {
        targetCountries: { has: countryCode },
        category: AUTO_TIRES_LEAF,
        ...reifenRimOfferWhere(),
        OR: REIFEN_RIM_TITLE_OR,
      },
    });
    const move = Math.min(rimAmongTires, tiresInCatalog);
    if (move > 0) {
      leafCounts[AUTO_TIRES_LEAF] = tiresInCatalog - move;
      categoryCounts[AUTO_TIRES_LEAF] = (categoryCounts[AUTO_TIRES_LEAF] ?? 0) - move;
      leafCounts[AUTO_COMPLETE_WHEELS_LEAF] =
        (leafCounts[AUTO_COMPLETE_WHEELS_LEAF] ?? 0) + move;
      categoryCounts[AUTO_COMPLETE_WHEELS_LEAF] =
        (categoryCounts[AUTO_COMPLETE_WHEELS_LEAF] ?? 0) + move;
    }
  }

  return { categoryCounts, leafCounts };
}

function usableCoverImage(image: string | null | undefined): string | undefined {
  const normalized = normalizeProductImageUrl(image);
  if (!normalized) return undefined;
  const sanitized = sanitizeProductImageForRender(normalized);
  if (!sanitized || sanitized === SAFE_IMAGE_FALLBACK) return undefined;
  return sanitized;
}

/** One product photo per leaf so homepage aisle tiles are not empty. */
export async function getCategoryCoverImagesFromDb(
  countryCode: string
): Promise<Record<string, string>> {
  const rimCoverWhere = {
    targetCountries: { has: countryCode },
    image: { contains: "reifen.com" },
    ...reifenRimOfferWhere(),
  };
  const [rows, preferredWheel, fallbackWheel, preferredLaptop] = await Promise.all([
    prisma.product.findMany({
      where: {
        targetCountries: { has: countryCode },
        image: { startsWith: "http" },
        offers: { some: { inStock: true } },
      },
      distinct: ["category"],
      select: { category: true, image: true },
    }),
    prisma.product.findFirst({
      where: {
        ...rimCoverWhere,
        OR: preferredReifenRimTitleContains().map((token) => ({
          title: { contains: token, mode: "insensitive" as const },
        })),
      },
      select: { image: true },
    }),
    prisma.product.findFirst({
      where: {
        ...rimCoverWhere,
        OR: [{ category: AUTO_COMPLETE_WHEELS_LEAF }, ...REIFEN_RIM_TITLE_OR],
      },
      select: { image: true },
    }),
    prisma.product.findFirst({
      where: {
        targetCountries: { has: countryCode },
        category: NOTEBOOKS_LAPTOPS_LEAF,
        image: { startsWith: "http" },
        offers: { some: { inStock: true } },
        AND: [
          {
            OR: LAPTOP_COVER_TITLE_TOKENS.map((token) => ({
              title: { contains: token, mode: "insensitive" as const },
            })),
          },
          {
            NOT: {
              OR: LAPTOP_COVER_TITLE_EXCLUDE.map((token) => ({
                title: { contains: token, mode: "insensitive" as const },
              })),
            },
          },
        ],
      },
      select: { image: true },
    }),
  ]);
  const covers = buildCategoryCoverMap(
    rows.map((row) => ({
      category: row.category,
      image: usableCoverImage(row.image),
    }))
  );
  const wheelImage = usableCoverImage(preferredWheel?.image ?? fallbackWheel?.image);
  if (wheelImage) covers[AUTO_COMPLETE_WHEELS_LEAF] = wheelImage;
  const laptopImage = usableCoverImage(preferredLaptop?.image);
  if (laptopImage) covers[NOTEBOOKS_LAPTOPS_LEAF] = laptopImage;
  return covers;
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
  const orderDir = sort === "price-desc" ? Prisma.raw("DESC") : Prisma.raw("ASC");
  const categorySql = categoryConstraintSql(category);

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

const CH_LEAD_MERCHANT_ID = "ch-acer";

function isUnfilteredBrowse(
  query: string | undefined,
  category: string | undefined,
  filters: OfferFilterCriteria
): boolean {
  return !query?.trim() && !category && !hasActiveOfferFilters(filters);
}

/** Same category priority as the full CH lead ORDER BY (Acer laptops first). */
const CH_LEAD_CATEGORY_ORDER = Prisma.sql`
  CASE p.category
    WHEN 'notebooks-laptops' THEN 0
    WHEN 'notebooks-desktops' THEN 1
    WHEN 'notebooks-monitors' THEN 2
    WHEN 'tv-projectors' THEN 3
    WHEN 'notebooks-tablets-pc' THEN 4
    ELSE 20
  END
`;

async function queryChLeadSlice(
  countryCode: string,
  acerOnly: boolean,
  take: number,
  skip: number
): Promise<string[]> {
  const acerClause = acerOnly
    ? Prisma.sql`AND EXISTS (
        SELECT 1 FROM "Offer" o
        WHERE o."productId" = p.id
          AND o."inStock" = true
          AND o."feedMerchantId" = ${CH_LEAD_MERCHANT_ID}
      )`
    : Prisma.sql`AND EXISTS (
        SELECT 1 FROM "Offer" o
        WHERE o."productId" = p.id AND o."inStock" = true
      )
      AND NOT EXISTS (
        SELECT 1 FROM "Offer" o
        WHERE o."productId" = p.id AND o."feedMerchantId" = ${CH_LEAD_MERCHANT_ID}
      )`;

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id
    FROM "Product" p
    WHERE ${countryCode} = ANY(p."targetCountries")
    ${acerClause}
    ORDER BY ${CH_LEAD_CATEGORY_ORDER}, p."updatedAt" DESC, p.id ASC
    LIMIT ${take}
    OFFSET ${skip}
  `;
  return rows.map((row) => row.id);
}

/**
 * CH All first page must be Acer hardware, not Belando or the latest baby-walz remap.
 * Client-side sort cannot fix this: the API only returns the current OFFSET page.
 *
 * Unfiltered pages query Acer first (small merchant set) instead of sorting all
 * ~86k CH rows with a per-row EXISTS CASE.
 */
async function queryProductIdsByChLead(
  countryCode: string,
  query: string | undefined,
  category: string | undefined,
  filters: OfferFilterCriteria,
  take: number,
  skip: number
): Promise<string[]> {
  if (isUnfilteredBrowse(query, category, filters)) {
    const cached = await getCachedChLeadIds(countryCode, take, skip);
    if (cached) return cached;

    const acerIds = await queryChLeadSlice(countryCode, true, take, skip);
    let ids = acerIds;
    if (acerIds.length < take) {
      const acerCount =
        skip === 0
          ? acerIds.length
          : Number(
              (
                await prisma.$queryRaw<[{ n: number }]>`
                  SELECT COUNT(*)::int AS n
                  FROM "Product" p
                  WHERE ${countryCode} = ANY(p."targetCountries")
                    AND EXISTS (
                      SELECT 1 FROM "Offer" o
                      WHERE o."productId" = p.id
                        AND o."inStock" = true
                        AND o."feedMerchantId" = ${CH_LEAD_MERCHANT_ID}
                    )
                `
              )[0]?.n ?? 0
            );
      const rest = await queryChLeadSlice(
        countryCode,
        false,
        take - acerIds.length,
        Math.max(0, skip - acerCount)
      );
      ids = [...acerIds, ...rest];
    }

    await setCachedChLeadIds(countryCode, take, skip, ids);
    return ids;
  }

  const categorySql = categoryConstraintSql(category);

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
    WHERE ${countryCode} = ANY(p."targetCountries")
      AND EXISTS (
        SELECT 1 FROM "Offer" o
        WHERE o."productId" = p.id AND ${offerWhereSql}
      )
    ${categorySql}
    ${querySql}
    ${brandSql}
    ${gtinSql}
    ORDER BY
      CASE WHEN EXISTS (
        SELECT 1 FROM "Offer" o
        WHERE o."productId" = p.id AND o."feedMerchantId" = ${CH_LEAD_MERCHANT_ID}
      ) THEN 0 ELSE 1 END,
      ${CH_LEAD_CATEGORY_ORDER},
      p."updatedAt" DESC,
      p.id ASC
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
  const unfilteredBrowse = isUnfilteredBrowse(query, category, filters);
  // Acer-first sort is only for CH All. Aisle filters must not scan 86k rows
  // with per-row EXISTS — that is the 5–7s white wall on every subcategory.
  const sortByChLead =
    !sortByOfferTotal && countryCode.toUpperCase() === "CH" && unfilteredBrowse;

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
    : sortByChLead
      ? queryProductIdsByChLead(countryCode, query, category, filters, take, skip)
      : Promise.resolve(null);

  const cachedMeta = await getCachedBrowseMeta(countryCode);
  // CH has ~86k rows. Cover distinct + groupBy + brand scan made GB→CH wait 7–8s.
  // Serve the first page immediately; warm full meta off the request path.
  const skipHeavyMeta = !cachedMeta && countryCode.toUpperCase() === "CH";

  const [pricedIds, productsDefault, total, countMaps, countryTotal, brandRows, categoryCovers] =
    await Promise.all([
      pricedIdsPromise,
      sortByOfferTotal || sortByChLead
        ? Promise.resolve([] as PrismaProductWithOffers[])
        : prisma.product.findMany({
            where: whereClause,
            include: { offers: { where: visibleOfferWhere } },
            take,
            skip,
            orderBy,
          }),
      cachedMeta && unfilteredBrowse
        ? Promise.resolve(cachedMeta.countryProductCount)
        : skipHeavyMeta
          ? Promise.resolve(take + skip + 1)
          : prisma.product.count({ where: whereClause }),
      cachedMeta
        ? Promise.resolve({
            categoryCounts: cachedMeta.categoryCounts,
            leafCounts: cachedMeta.leafCounts,
          })
        : skipHeavyMeta
          ? Promise.resolve({ categoryCounts: {}, leafCounts: {} })
          : getCategoryCountsFromDb(countryCode),
      cachedMeta
        ? Promise.resolve(cachedMeta.countryProductCount)
        : skipHeavyMeta
          ? Promise.resolve(0)
          : prisma.product.count({
              where: {
                targetCountries: { has: countryCode },
                offers: { some: { inStock: true } },
              },
            }),
      cachedMeta
        ? Promise.resolve(cachedMeta.brandOptions.map((brand) => ({ brand })))
        : skipHeavyMeta
          ? Promise.resolve([] as Array<{ brand: string | null }>)
          : prisma.product.findMany({
              where: { ...brandWhere, brand: { not: null } },
              select: { brand: true },
              distinct: ["brand"],
              orderBy: { brand: "asc" },
            }),
      cachedMeta
        ? Promise.resolve(cachedMeta.categoryCovers)
        : skipHeavyMeta
          ? Promise.resolve({} as Record<string, string>)
          : getCategoryCoverImagesFromDb(countryCode),
    ]);

  let pageProducts: PrismaProductWithOffers[];
  if (pricedIds) {
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

  const brandOptions = cachedMeta
    ? cachedMeta.brandOptions
    : Array.from(
        new Map(
          brandRows
            .map((row) => row.brand?.trim())
            .filter((brand): brand is string => Boolean(brand))
            .map((brand) => [brand.toLocaleLowerCase(), brand] as const)
        ).values()
      ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  if (!cachedMeta && unfilteredBrowse && !skipHeavyMeta) {
    await setCachedBrowseMeta(countryCode, {
      categoryCounts: countMaps.categoryCounts,
      leafCounts: countMaps.leafCounts,
      categoryCovers,
      countryProductCount: countryTotal,
      brandOptions,
    });
  }

  return {
    products,
    totalMatched: total,
    categoryCounts: countMaps.categoryCounts,
    leafCounts: countMaps.leafCounts,
    categoryCovers,
    countryProductCount: countryTotal,
    brandOptions,
  };
}

/** Fill CH aisle counts/covers after the first page is already on screen. */
export async function warmBrowseMetaForCountry(countryCode: string): Promise<void> {
  const existing = await getCachedBrowseMeta(countryCode);
  if (existing && Object.keys(existing.categoryCovers).length > 0) return;

  const brandWhere = buildWhere(countryCode, undefined, undefined, {});
  const [countMaps, countryTotal, brandRows, categoryCovers] = await Promise.all([
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
    getCategoryCoverImagesFromDb(countryCode),
  ]);

  const brandOptions = Array.from(
    new Map(
      brandRows
        .map((row) => row.brand?.trim())
        .filter((brand): brand is string => Boolean(brand))
        .map((brand) => [brand.toLocaleLowerCase(), brand] as const)
    ).values()
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  await setCachedBrowseMeta(countryCode, {
    categoryCounts: countMaps.categoryCounts,
    leafCounts: countMaps.leafCounts,
    categoryCovers,
    countryProductCount: countryTotal,
    brandOptions,
  });
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
