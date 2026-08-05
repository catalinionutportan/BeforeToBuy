import type { MetadataRoute } from "next";
import { COMPARISON_COLLECTION_FILTERS, getAllCategoryPaths } from "@/lib/categories";
import { fetchDefaultCatalog } from "@/lib/category-page-data";
import {
  collectionBrowsePath,
  departmentCategoryPath,
  subcategoryCategoryPath,
} from "@/lib/category-routes";
import { DEFAULT_LOCALE, SITE_LOCALES, SiteLocale } from "@/lib/i18n/locales";

function getAlternateLinks(url: string, currentLocale: SiteLocale, allLocales: readonly SiteLocale[]) {
  const alternates: { hrefLang: string; href: string }[] = [];
  for (const locale of allLocales) {
    const localizedUrl = locale === DEFAULT_LOCALE ? url.replace(`/${currentLocale}`, '') : `/${locale}${url}`;
    alternates.push({ hrefLang: locale, href: localizedUrl });
  }
  return { languages: alternates };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com";

  const staticRoutes: MetadataRoute.Sitemap = [];
  const staticPaths = [
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
  ];

  for (const locale of SITE_LOCALES) {
    for (const routePath of staticPaths) {
      const url = locale === DEFAULT_LOCALE ? `${baseUrl}${routePath}` : `${baseUrl}/${locale}${routePath}`;
      staticRoutes.push({
        url: url,
        lastModified: new Date(),
        changeFrequency: routePath === "" || routePath === "/stores" ? "daily" : "monthly",
        priority: routePath === "" ? 1.0 : routePath === "/stores" ? 0.9 : 0.8,
        alternates: getAlternateLinks(routePath, locale, SITE_LOCALES), // Generate alternate links for each static route
      });
    }
  }

  try {
    const catalog = await fetchDefaultCatalog();
    const counts = catalog.meta.categoryCounts;
    const collectionCounts = catalog.meta.collectionCounts ?? {};

    const categoryRoutes: MetadataRoute.Sitemap = [];
    for (const locale of SITE_LOCALES) {
      getAllCategoryPaths().forEach((path) => {
        if (path.sub) {
          if ((counts[path.sub] ?? 0) <= 0) return;
          const url = `${baseUrl}${subcategoryCategoryPath(path.module, path.sub, locale)}`;
          categoryRoutes.push({
            url: url,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.7,
            alternates: getAlternateLinks(subcategoryCategoryPath(path.module, path.sub, locale), locale, SITE_LOCALES), // Generate alternate links
          });
        } else {
          if ((counts[path.module] ?? 0) <= 0) return;
          const url = `${baseUrl}${departmentCategoryPath(path.module, locale)}`;
          categoryRoutes.push({
            url: url,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.75,
            alternates: getAlternateLinks(departmentCategoryPath(path.module, locale), locale, SITE_LOCALES), // Generate alternate links
          });
        }
      });
    }

    const compareRoutes: MetadataRoute.Sitemap = [];
    for (const locale of SITE_LOCALES) {
      COMPARISON_COLLECTION_FILTERS.forEach(
        (collection) => {
          if ((collectionCounts[collection.id] ?? 0) <= 0) return;
          const url = `${baseUrl}${collectionBrowsePath(collection.id, locale)}`;
          compareRoutes.push({
            url: url,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.65,
            alternates: getAlternateLinks(collectionBrowsePath(collection.id, locale), locale, SITE_LOCALES), // Generate alternate links
          });
        }
      );
    }

    return [...staticRoutes, ...categoryRoutes, ...compareRoutes];
  } catch {
    // If fetching catalog fails, return only static routes without locale variations for now
    return staticPaths.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" || route === "/stores" ? "daily" : "monthly",
      priority: route === "" ? 1.0 : route === "/stores" ? 0.9 : 0.8,
    }));
  }
}
