import type { MetadataRoute } from "next";
import { COMPARISON_COLLECTION_FILTERS, getAllCategoryPaths } from "@/lib/categories";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import {
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
} from "@/lib/category-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/categories",
    "/stores",
    "/help",
    "/contact",
    "/legal",
    "/affiliate-disclosure",
    "/disclaimer",
    "/impressum",
    "/privacy",
    "/cookies",
    "/terms",
    "/complaints",
    "/accessibility",
    "/status",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/stores" ? "daily" : "monthly",
    priority: route === "" ? 1.0 : route === "/stores" ? 0.9 : 0.8,
  }));

  try {
    const catalog = await fetchDefaultCatalog();
    const counts = catalog.meta.categoryCounts;
    const collectionCounts = catalog.meta.collectionCounts ?? {};

    const categoryRoutes: MetadataRoute.Sitemap = getAllCategoryPaths().flatMap((path) => {
      if (path.sub) {
        if ((counts[path.sub] ?? 0) <= 0) return [];
        return [
          {
            url: `${baseUrl}${subcategoryCategoryPath(path.module, path.sub)}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.7,
          },
        ];
      }

      if ((counts[path.module] ?? 0) <= 0) return [];
      return [
        {
          url: `${baseUrl}${departmentCategoryPath(path.module)}`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.75,
        },
      ];
    });

    const compareRoutes: MetadataRoute.Sitemap = COMPARISON_COLLECTION_FILTERS.flatMap(
      (collection) => {
        if ((collectionCounts[collection.id] ?? 0) <= 0) return [];
        return [
          {
            url: `${baseUrl}${collectionBrowsePath(collection.id)}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.65,
          },
        ];
      }
    );

    return [...staticRoutes, ...categoryRoutes, ...compareRoutes];
  } catch {
    return staticRoutes;
  }
}
