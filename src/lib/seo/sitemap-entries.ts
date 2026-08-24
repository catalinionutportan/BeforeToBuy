import type { MetadataRoute } from "next";
import { COMPARISON_COLLECTION_FILTERS, getAllCategoryPaths } from "@/lib/categories";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import { listProductIdsForSitemap } from "@/lib/product-lookup";
import {
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
} from "@/lib/category-routes";
import { BROWSE_LIST_OPTIONS } from "@/lib/product-list-options";
import { redisGetJson, redisSetJson } from "@/lib/redis-cache";
import { productPagePath } from "@/lib/seo/site-url";

const SITEMAP_CACHE_KEY = "sitemap:v2:entries";
const SITEMAP_CACHE_TTL_SECONDS = 60 * 60;

type CachedSitemap = {
  builtAt: number;
  entries: MetadataRoute.Sitemap;
};

function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com").replace(/\/$/, "");
}

function staticRoutes(baseUrl: string): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about",
    "/categories",
    "/stores",
    "/help",
    "/contact",
    "/legal",
    "/transparency",
    "/affiliate-disclosure",
    "/disclaimer",
    "/impressum",
    "/privacy",
    "/cookies",
    "/terms",
    "/complaints",
    "/accessibility",
    "/status",
    "/policies/comparison",
    "/policies/editorial",
    "/policies/feeds",
    "/policies/merchants",
    "/policies/notifications",
  ];

  return staticPaths.map((routePath) => ({
    url: `${baseUrl}${routePath}`,
    lastModified: "2026-08-06T00:00:00.000Z",
    changeFrequency: routePath === "" || routePath === "/stores" ? "daily" : "monthly",
    priority: routePath === "" ? 1.0 : routePath === "/stores" ? 0.9 : 0.8,
  }));
}

async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteBaseUrl();
  const staticRoutesList = staticRoutes(baseUrl);

  try {
    // Category counts come from the full matched set; product IDs use a lightweight DB query.
    const catalog = await fetchDefaultCatalog(undefined, {
      ...BROWSE_LIST_OPTIONS,
      limit: 1,
    });
    const productIds = await listProductIdsForSitemap(45_000);
    const counts: Record<string, number> = catalog.meta.categoryCounts ?? {};
    const collectionCounts = catalog.meta.collectionCounts ?? {};

    const categoryRoutes: MetadataRoute.Sitemap = [];
    getAllCategoryPaths().forEach((path) => {
      if (path.sub) {
        if ((counts[path.sub] ?? 0) <= 0) return;
        categoryRoutes.push({
          url: `${baseUrl}${subcategoryCategoryPath(path.module, path.sub)}`,
          lastModified: "2026-08-06T00:00:00.000Z",
          changeFrequency: "daily",
          priority: 0.7,
        });
      } else {
        if ((counts[path.module] ?? 0) <= 0) return;
        categoryRoutes.push({
          url: `${baseUrl}${departmentCategoryPath(path.module)}`,
          lastModified: "2026-08-06T00:00:00.000Z",
          changeFrequency: "daily",
          priority: 0.75,
        });
      }
    });

    const compareRoutes: MetadataRoute.Sitemap = COMPARISON_COLLECTION_FILTERS.filter(
      (collection) => (collectionCounts[collection.id] ?? 0) > 0
    ).map((collection) => ({
      url: `${baseUrl}${collectionBrowsePath(collection.id)}`,
      lastModified: "2026-08-06T00:00:00.000Z",
      changeFrequency: "daily" as const,
      priority: 0.65,
    }));

    const productRoutes: MetadataRoute.Sitemap = productIds
      .map((productId) => ({
        url: `${baseUrl}${productPagePath(productId)}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    return [...staticRoutesList, ...categoryRoutes, ...compareRoutes, ...productRoutes];
  } catch {
    return staticRoutesList;
  }
}

/** Cached sitemap entries — Redis when available, else rebuild (Next also revalidates). */
export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const cached = await redisGetJson<CachedSitemap>(SITEMAP_CACHE_KEY);
  if (cached?.entries?.length) {
    return cached.entries;
  }

  const entries = await buildSitemapEntries();
  await redisSetJson(
    SITEMAP_CACHE_KEY,
    { builtAt: Date.now(), entries } satisfies CachedSitemap,
    SITEMAP_CACHE_TTL_SECONDS
  );
  return entries;
}
