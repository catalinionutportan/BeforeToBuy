import type { MetadataRoute } from "next";
import { COMPARISON_COLLECTION_FILTERS, getAllCategoryPaths } from "@/lib/categories";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import {
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
} from "@/lib/category-routes";
import { productPagePath } from "@/lib/seo/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com").replace(
    /\/$/,
    ""
  );

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

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((routePath) => ({
    url: `${baseUrl}${routePath}`,
    lastModified: "2026-08-06T00:00:00.000Z",
    changeFrequency: routePath === "" || routePath === "/stores" ? "daily" : "monthly",
    priority: routePath === "" ? 1.0 : routePath === "/stores" ? 0.9 : 0.8,
  }));

  try {
    // Meta/counts only — avoid serializing thousands of products into sitemap work.
    const catalog = await fetchDefaultCatalog(undefined, {
      limit: 0,
      compact: true,
      includePriceHistory: false,
    });
    const counts = catalog.meta.categoryCounts;
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

    const productRoutes: MetadataRoute.Sitemap = catalog.products.slice(0, 200).map((product) => ({
      url: `${baseUrl}${productPagePath(product.id)}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...compareRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
