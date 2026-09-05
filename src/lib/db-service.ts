import { prisma } from "@/lib/db";
import { Prisma, type Offer as PrismaOffer } from "@prisma/client";
import type { CountryCode, Product, Offer } from "@/types";
import { getParentCategoryId, resolveCategoryAlias } from "@/lib/categories";
import { MARKET_HUB_LEAF_GROUPS } from "@/lib/market-hubs";
import { expandCategoryFilterToDbIds } from "@/lib/db-category-filter";
import {
  getStoreSearchTokens,
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
import { isRedisConfigured } from "@/lib/redis";
import { getCatalogRevision, withCatalogRevision } from "@/lib/catalog-revision";
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

/** Known brands to match at start of product titles */
const KNOWN_TITLE_BRANDS = [
  "DJI", "Acer", "Apple", "Samsung", "Sony", "Bosch", "Miele", "LG", "Philips",
  "Asus", "Lenovo", "HP", "Dell", "Logitech", "Puma", "Under Armour", "Löffler",
  "Merrell", "Mammut", "Salomon", "The North Face", "Columbia", "On Running", "Hoka",
  "Garmin", "Shimano", "Abus", "Klickfix", "Fripac", "Wella", "Schwarzkopf",
  "Kumho", "Carmani", "Pirelli", "Michelin", "Continental", "Goodyear",
  "Bridgestone", "Hankook", "Dunlop", "Falken", "Nokian", "Toyo", "Rowenta",
  "Ottocast", "Seentat", "Geepas", "Arlo", "PlayStation", "Nintendo", "Xbox",
  "Kärcher", "DeLonghi", "Tefal", "Braun", "Oral-B", "Dyson", "Makita", "Einhell"
] as const;

/** Infer real brand name from title or dedicated merchant when DB has Generic or empty */
export function inferBrandFromTitleAndStore(
  rawBrand: string | null | undefined,
  title: string,
  storeName?: string | null
): string {
  const b = rawBrand?.trim();
  if (b && b.toLowerCase() !== "generic") {
    return b;
  }
  const s = storeName?.toLowerCase() || "";
  if (s.includes("dji")) return "DJI";
  if (s.includes("acer")) return "Acer";
  if (s.includes("ottocast")) return "Ottocast";
  if (s.includes("seentat")) return "Seentat";
  if (s.includes("rowenta")) return "Rowenta";
  if (s.includes("geepas")) return "Geepas";
  if (s.includes("arlo")) return "Arlo";

  const t = title.trim();
  if (/^altra\s+running/i.test(t)) return "Altra Running";
  if (/^la\s+sportiva/i.test(t)) return "La Sportiva";
  if (/^pro-x\s+elements/i.test(t)) return "Pro-X Elements";
  if (/^jean\s+paul\s+gaultier/i.test(t)) return "Jean Paul Gaultier";
  if (/^klick\s*fix/i.test(t)) return "Klickfix";

  for (const kb of KNOWN_TITLE_BRANDS) {
    if (new RegExp(`^${kb}\\b`, "i").test(t)) {
      return kb;
    }
  }

  const leading = t.split(/\s+/)[0];
  if (leading && /^[A-Za-zÄÖÜäöüß]{3,15}$/.test(leading)) {
    return leading.charAt(0).toUpperCase() + leading.slice(1).toLowerCase();
  }

  return b || "Generic";
}

/** Normalize product image URL (upgrade http to https and preserve query parameters). */
export function normalizeProductImageUrl(
  image: string | null | undefined
): string | undefined {
  if (!image?.trim()) return undefined;
  let raw = image.trim();
  if (raw.startsWith("http://")) {
    raw = `https://${raw.slice(7)}`;
  }
  // Unwrap AWIN productserve URLs to permanent merchant CDN images
  if (raw.includes("productserve.com")) {
    try {
      const u = new URL(raw);
      let target = u.searchParams.get("url");
      if (target) {
        target = decodeURIComponent(target).trim();
        if (target.startsWith("ssl:")) {
          target = `https://${target.slice(4)}`;
        } else if (target.startsWith("http://")) {
          target = `https://${target.slice(7)}`;
        } else if (!target.startsWith("https://")) {
          target = `https://${target}`;
        }
        return target;
      }
    } catch {
      // ignore
    }
  }
  return raw;
}

/** Convert Prisma Product to Application Product */
export function mapPrismaProduct(p: PrismaProductWithOffers): Product {
  const brand = inferBrandFromTitleAndStore(
    p.brand,
    p.title,
    p.offers?.[0]?.storeName
  );
  return {
    id: p.id,
    title: p.title,
    description: p.description || "",
    gtin: p.gtin || undefined,
    brand,
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
    const tokens = getStoreSearchTokens(domain);
    const orClauses: Prisma.OfferWhereInput[] = tokens.map((token) => ({
      storeName: { contains: token, mode: "insensitive" },
    }));
    orClauses.push({ purchaseUrl: { contains: domain, mode: "insensitive" } });
    and.push({ OR: orClauses });
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

/** In-stock catalogue size for a market. Cheap COUNT — never infer this from the Acer first page. */
export async function countInStockProductsForCountry(countryCode: string): Promise<number> {
  return prisma.product.count({
    where: {
      targetCountries: { has: countryCode },
      offers: { some: { inStock: true } },
    },
  });
}

function reifenTitleSplitWhere(
  countryCode: string,
  category?: string
): Prisma.ProductWhereInput | undefined {
  if (countryCode.toUpperCase() !== "CH") return undefined;
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

function categoryConstraintSql(countryCode: string, category?: string): Prisma.Sql {
  const resolved = category ? resolveCategoryAlias(category) : "";
  if (countryCode.toUpperCase() === "CH" && resolved === AUTO_COMPLETE_WHEELS_LEAF) {
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
  if (countryCode.toUpperCase() === "CH" && resolved === AUTO_TIRES_LEAF) {
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
  const titleSplit = reifenTitleSplitWhere(countryCode, category);
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
  const rows = await prisma.$queryRaw<Array<{ category: string; n: number }>>(Prisma.sql`
    WITH market_products AS MATERIALIZED (
      SELECT p.id, p.category
      FROM "Product" p
      WHERE p."targetCountries" @> ARRAY[${countryCode}]::text[]
    )
    SELECT mp.category, COUNT(*)::int AS n
    FROM market_products mp
    WHERE EXISTS (
      SELECT 1
      FROM "Offer" o
      WHERE o."productId" = mp.id AND o."inStock" = true
    )
    GROUP BY mp.category
  `);

  const leafCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  for (const row of rows) {
    const leafId = resolveCategoryAlias(row.category);
    const n = Number(row.n);
    leafCounts[leafId] = (leafCounts[leafId] ?? 0) + n;
    categoryCounts[leafId] = (categoryCounts[leafId] ?? 0) + n;
    const parentId = getParentCategoryId(leafId);
    if (parentId && parentId !== leafId) {
      categoryCounts[parentId] = (categoryCounts[parentId] ?? 0) + n;
    }
  }

  const isCh = countryCode.toUpperCase() === "CH";
  const tiresInCatalog = leafCounts[AUTO_TIRES_LEAF] ?? 0;
  if (isCh && tiresInCatalog > 0) {
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

  // Aggregate total counts for each market hub (hub-fashion, hub-electronics, hub-auto, etc.)
  for (const [hubId, leaves] of Object.entries(MARKET_HUB_LEAF_GROUPS)) {
    let sum = 0;
    for (const leaf of leaves) {
      sum += leafCounts[leaf] ?? 0;
    }
    categoryCounts[hubId] = sum;
  }

  return { categoryCounts, leafCounts };
}

/** Distinct visible brands after the country GIN index narrows the catalogue. */
async function getBrowseBrandRowsFromDb(
  countryCode: string
): Promise<Array<{ brand: string | null }>> {
  return prisma.$queryRaw<Array<{ brand: string | null }>>(Prisma.sql`
    WITH market_products AS MATERIALIZED (
      SELECT p.id, p.brand
      FROM "Product" p
      WHERE p."targetCountries" @> ARRAY[${countryCode}]::text[]
        AND p.brand IS NOT NULL
    )
    SELECT mp.brand
    FROM market_products mp
    WHERE EXISTS (
      SELECT 1
      FROM "Offer" o
      WHERE o."productId" = mp.id AND o."inStock" = true
    )
    GROUP BY mp.brand
    ORDER BY mp.brand ASC
  `);
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
  try {
    const isCh = countryCode.toUpperCase() === "CH";
    const rimCoverWhere = isCh
      ? {
          targetCountries: { has: countryCode },
          image: { contains: "reifen.com" },
          ...reifenRimOfferWhere(),
        }
      : null;

    // Prisma 5 findMany(distinct) deduplicates after reading the matching rows.
    // Keep the catalogue scan inside Postgres and transfer one row per category.
    // Stable ID ordering also prevents covers changing between identical warms.
    const rows = await prisma.$queryRaw<Array<{ category: string; image: string }>>(Prisma.sql`
      SELECT DISTINCT ON ("category") "category", "image"
      FROM "Product"
      WHERE ${countryCode} = ANY("targetCountries") AND "image" LIKE 'http%'
      ORDER BY "category" ASC, "id" ASC
    `);

    const covers = buildCategoryCoverMap(
      (rows || []).map((row) => ({
        category: row.category,
        image: usableCoverImage(row.image),
      }))
    );

    if (rimCoverWhere) {
      try {
        const preferredWheel = await prisma.product.findFirst({
          where: {
            ...rimCoverWhere,
            OR: preferredReifenRimTitleContains().map((token) => ({
              title: { contains: token, mode: "insensitive" as const },
            })),
          },
          select: { image: true },
        });
        const wheelImage = usableCoverImage(preferredWheel?.image);
        if (wheelImage) {
          covers[AUTO_COMPLETE_WHEELS_LEAF] = wheelImage;
        } else {
          const fallbackWheel = await prisma.product.findFirst({
            where: {
              ...rimCoverWhere,
              OR: [{ category: AUTO_COMPLETE_WHEELS_LEAF }, ...REIFEN_RIM_TITLE_OR],
            },
            select: { image: true },
          });
          const fallbackWheelImage = usableCoverImage(fallbackWheel?.image);
          if (fallbackWheelImage) covers[AUTO_COMPLETE_WHEELS_LEAF] = fallbackWheelImage;
        }
      } catch (err) {
        console.warn("[db-service] rim cover query error:", err);
      }
    }

    if (isCh) {
      try {
        const preferredLaptop = await prisma.product.findFirst({
          where: {
            targetCountries: { has: countryCode },
            category: NOTEBOOKS_LAPTOPS_LEAF,
            image: { startsWith: "http" },
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
        });
        const laptopImage = usableCoverImage(preferredLaptop?.image);
        if (laptopImage) covers[NOTEBOOKS_LAPTOPS_LEAF] = laptopImage;
      } catch (err) {
        console.warn("[db-service] laptop cover query error:", err);
      }
    }

    return covers;
  } catch (error) {
    console.error("[db-service] getCategoryCoverImagesFromDb error:", error);
    return {};
  }
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
  const categorySql = categoryConstraintSql(countryCode, category);

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
    const tokens = getStoreSearchTokens(domain);
    const domainConds = tokens.map((t) => Prisma.sql`o."storeName" ILIKE ${`%${t}%`}`);
    domainConds.push(Prisma.sql`o."purchaseUrl" ILIKE ${`%${domain}%`}`);
    offerClauses.push(Prisma.sql`(${Prisma.join(domainConds, " OR ")})`);
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
    WITH matched_products AS (
      SELECT p.id
      FROM "Product" p
      WHERE ${countryCode} = ANY(p."targetCountries")
      ${categorySql}
      ${querySql}
      ${brandSql}
      ${gtinSql}
    )
    SELECT mp.id
    FROM matched_products mp
    INNER JOIN (
      SELECT o."productId",
        MIN(COALESCE(o."totalPrice", o.price + COALESCE(o."deliveryCost", 0))) AS min_total
      FROM "Offer" o
      WHERE ${offerWhereSql}
        AND o."productId" IN (SELECT id FROM matched_products)
      GROUP BY o."productId"
    ) priced ON priced."productId" = mp.id
    ORDER BY priced.min_total ${orderDir}, mp.id ASC
    LIMIT ${take}
    OFFSET ${skip}
  `;

  return rows.map((row) => row.id);
}

/**
 * RO/GB/US are sparse slices of a catalogue whose global ID order is dominated
 * by CH/DE imports. Letting Postgres satisfy `ORDER BY id` from Product_pkey
 * makes it reject most of the global table before it reaches those markets.
 *
 * Materializing the fully matched market slice forces the targetCountries GIN
 * index to narrow the catalogue first; the small result is then sorted/paged.
 */
const MARKET_FIRST_NATURAL_ORDER_COUNTRIES = new Set(["RO", "GB", "US"]);

async function queryProductIdsByMarketFirstNaturalOrder(
  countryCode: string,
  query: string | undefined,
  category: string | undefined,
  filters: OfferFilterCriteria,
  take: number,
  skip: number
): Promise<string[]> {
  const categorySql = categoryConstraintSql(countryCode, category);
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
    const tokens = getStoreSearchTokens(domain);
    const domainConds = tokens.map((token) => Prisma.sql`o."storeName" ILIKE ${`%${token}%`}`);
    domainConds.push(Prisma.sql`o."purchaseUrl" ILIKE ${`%${domain}%`}`);
    offerClauses.push(Prisma.sql`(${Prisma.join(domainConds, " OR ")})`);
  }
  if (filters.freeDeliveryOnly) {
    offerClauses.push(Prisma.sql`o."deliveryCost" IS NOT NULL AND o."deliveryCost" <= 0`);
  }
  if (filters.minTotalPrice != null) {
    offerClauses.push(
      Prisma.sql`COALESCE(o."totalPrice", o.price) >= ${filters.minTotalPrice}`
    );
  }
  if (filters.maxTotalPrice != null) {
    offerClauses.push(
      Prisma.sql`COALESCE(o."totalPrice", o.price) <= ${filters.maxTotalPrice}`
    );
  }
  const offerWhereSql = Prisma.join(offerClauses, " AND ");

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH matched_products AS MATERIALIZED (
      SELECT p.id
      FROM "Product" p
      WHERE p."targetCountries" @> ARRAY[${countryCode}]::text[]
        AND EXISTS (
          SELECT 1
          FROM "Offer" o
          WHERE o."productId" = p.id AND ${offerWhereSql}
        )
      ${categorySql}
      ${querySql}
      ${brandSql}
      ${gtinSql}
    )
    SELECT id
    FROM matched_products
    ORDER BY id ASC
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

  const categorySql = categoryConstraintSql(countryCode, category);

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
    const tokens = getStoreSearchTokens(domain);
    const domainConds = tokens.map((t) => Prisma.sql`o."storeName" ILIKE ${`%${t}%`}`);
    domainConds.push(Prisma.sql`o."purchaseUrl" ILIKE ${`%${domain}%`}`);
    offerClauses.push(Prisma.sql`(${Prisma.join(domainConds, " OR ")})`);
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

/** Fetch filtered products directly from Supabase DB within a pinned revision. */
export async function getProductsFromDb(
  countryCode: string,
  query?: string,
  category?: string,
  limit?: number,
  offset?: number,
  sort?: string,
  filters: OfferFilterCriteria = {}
) {
  return withCatalogRevision(countryCode, () =>
    getProductsFromDbImpl(countryCode, query, category, limit, offset, sort, filters)
  );
}

async function getProductsFromDbImpl(
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
  const sortByMarketFirstNaturalOrder =
    !sortByOfferTotal &&
    !sortByChLead &&
    sort !== "newest" &&
    MARKET_FIRST_NATURAL_ORDER_COUNTRIES.has(countryCode.toUpperCase());

  // When browsing categories or aisles, sorting by updatedAt DESC causes full-table scans
  // of tens of thousands of rows with per-row EXISTS. Only use updatedAt sort if explicitly requested ("newest").
  // Otherwise order by id ASC which is indexed and allows LIMIT take to return in <50ms.
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ updatedAt: "desc" }, { id: "asc" }]
      : [{ id: "asc" }];
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
      : sortByMarketFirstNaturalOrder
        ? queryProductIdsByMarketFirstNaturalOrder(
            countryCode,
            query,
            category,
            filters,
            take,
            skip
          )
      : Promise.resolve(null);

  const cachedMeta = await getCachedBrowseMeta(countryCode);
  const expandedCategoryIds = expandCategoryFilterToDbIds(category);
  // A related-leaf expansion (e.g. Hair Care + Hair Styling) is not represented
  // by the individual leaf's cached count. A wrong count truncates pagination.
  const categoryCountMatchesFilter = Boolean(category && (
    MARKET_HUB_LEAF_GROUPS[category] ||
    (expandedCategoryIds?.length === 1 && expandedCategoryIds[0] === resolveCategoryAlias(category))
  ));
  // CH/DE have very large catalogues. Cover distinct + groupBy + brand scans
  // can take tens of seconds and must not block the first product page.
  // Serve products immediately; the route warms full metadata after responding.
  // Without Redis the warm never persists across Vercel isolates — do not defer
  // counts, or aisle boards and "items found" collapse to the Acer first page.
  const deferHeavyMeta =
    !cachedMeta &&
    ["CH", "DE"].includes(countryCode.toUpperCase()) &&
    isRedisConfigured();

  // The category aggregation already visits every visible product. Reuse its
  // sum instead of running a second full-country COUNT during a cold browse.
  const coldCountMapsPromise = !cachedMeta && unfilteredBrowse && !deferHeavyMeta
    ? getCategoryCountsFromDb(countryCode)
    : null;
  const countryCountPromise = cachedMeta
    ? Promise.resolve(cachedMeta.countryProductCount)
    : coldCountMapsPromise
      ? coldCountMapsPromise.then((maps) => Object.values(maps.leafCounts).reduce((sum, count) => sum + count, 0))
      : countInStockProductsForCountry(countryCode);

  // If browse metadata is not cached yet and user is filtering by category,
  // schedule a background warm instead of stalling the category page with full table scans.
  if (!cachedMeta && !unfilteredBrowse) {
    warmBrowseMetaForCountry(countryCode).catch(() => {});
  }

  const [pricedIds, productsDefault, total, countMaps, countryTotal, brandRows, categoryCovers] =
    await Promise.all([
      pricedIdsPromise,
      sortByOfferTotal || sortByChLead || sortByMarketFirstNaturalOrder
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
        : unfilteredBrowse
          ? countryCountPromise
          : cachedMeta && category && categoryCountMatchesFilter && !query && !hasActiveOfferFilters(filters) && (
              cachedMeta.categoryCounts[category] !== undefined ||
              cachedMeta.leafCounts[category] !== undefined ||
              cachedMeta.categoryCounts[resolveCategoryAlias(category)] !== undefined ||
              cachedMeta.leafCounts[resolveCategoryAlias(category)] !== undefined
            )
            ? Promise.resolve(
                cachedMeta.categoryCounts[category] ??
                cachedMeta.leafCounts[category] ??
                cachedMeta.categoryCounts[resolveCategoryAlias(category)] ??
                cachedMeta.leafCounts[resolveCategoryAlias(category)]!
              )
            : prisma.product.count({ where: whereClause }),
      cachedMeta
        ? Promise.resolve({
            categoryCounts: cachedMeta.categoryCounts,
            leafCounts: cachedMeta.leafCounts,
          })
        : !unfilteredBrowse
          ? Promise.resolve({ categoryCounts: {}, leafCounts: {} })
          : deferHeavyMeta
            ? Promise.resolve({ categoryCounts: {}, leafCounts: {} })
            : coldCountMapsPromise!,
      countryCountPromise,
      cachedMeta
        ? Promise.resolve(cachedMeta.brandOptions.map((brand) => ({ brand })))
        : !unfilteredBrowse
          ? Promise.resolve([] as Array<{ brand: string | null }>)
          : deferHeavyMeta
            ? Promise.resolve([] as Array<{ brand: string | null }>)
            : getBrowseBrandRowsFromDb(countryCode),
      cachedMeta
        ? Promise.resolve(cachedMeta.categoryCovers)
        : !unfilteredBrowse
          ? Promise.resolve({} as Record<string, string>)
          : deferHeavyMeta
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
      const byId = new Map((fetched || []).map((product) => [product.id, product]));
      pageProducts = pricedIds
        .map((id) => byId.get(id))
        .filter((product): product is PrismaProductWithOffers => Boolean(product));
    }
  } else {
    pageProducts = productsDefault;
  }

  pageProducts = pageProducts.filter((product) => (product.offers?.length ?? 0) > 0);

  const products = pageProducts
    .map(mapPrismaProduct)
    .filter((product) => (product.offers?.length ?? 0) > 0);

  const effectiveCountryTotal = countryTotal;
  const effectiveMatchedTotal = unfilteredBrowse ? countryTotal : total;

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

  if (!cachedMeta && unfilteredBrowse && !deferHeavyMeta) {
    await setCachedBrowseMeta(countryCode, {
      categoryCounts: countMaps.categoryCounts,
      leafCounts: countMaps.leafCounts,
      categoryCovers,
      countryProductCount: effectiveCountryTotal,
      brandOptions,
    });
  }

  return {
    products,
    totalMatched: effectiveMatchedTotal,
    categoryCounts: countMaps.categoryCounts,
    leafCounts: countMaps.leafCounts,
    categoryCovers,
    countryProductCount: effectiveCountryTotal,
    brandOptions,
  };
}

const browseMetaWarmInFlight = new Map<string, Promise<void>>();

/** Fill large-market aisle counts/covers after the first page is already on screen. */
export async function warmBrowseMetaForCountry(countryCode: string): Promise<void> {
  return withCatalogRevision(countryCode, async () => {
    const revision = await getCatalogRevision(countryCode);
    const cacheKey = `${countryCode.toUpperCase()}:${revision}`;
    const existingWarm = browseMetaWarmInFlight.get(cacheKey);
    if (existingWarm) return existingWarm;

    const warmPromise = warmBrowseMetaForCountryOnce(countryCode);
    browseMetaWarmInFlight.set(cacheKey, warmPromise);
    try {
      await warmPromise;
    } finally {
      if (browseMetaWarmInFlight.get(cacheKey) === warmPromise) {
        browseMetaWarmInFlight.delete(cacheKey);
      }
    }
  });
}

async function warmBrowseMetaForCountryOnce(countryCode: string): Promise<void> {
  const existing = await getCachedBrowseMeta(countryCode);
  if (existing && Object.keys(existing.categoryCovers).length > 0) return;

  const [countMaps, brandRows, categoryCovers] = await Promise.all([
    getCategoryCountsFromDb(countryCode),
    getBrowseBrandRowsFromDb(countryCode),
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
    countryProductCount: Object.values(countMaps.leafCounts).reduce((sum, count) => sum + count, 0),
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
