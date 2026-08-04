import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.beforetobuy.com";

  const routes = [
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
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/stores" ? "daily" : "monthly",
    priority: route === "" ? 1.0 : route === "/stores" ? 0.9 : 0.8,
  }));
}
