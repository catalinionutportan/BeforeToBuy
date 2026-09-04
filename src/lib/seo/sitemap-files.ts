import { readFile } from "node:fs/promises";
import path from "node:path";

export const SITEMAP_STATIC_PATHS = [
  "", "/about", "/categories", "/stores", "/help", "/contact", "/legal",
  "/transparency", "/affiliate-disclosure", "/disclaimer", "/impressum",
  "/privacy", "/cookies", "/terms", "/complaints", "/accessibility", "/status",
  "/policies/comparison", "/policies/editorial", "/policies/feeds",
  "/policies/merchants", "/policies/notifications",
];

export function sitemapDirectory(): string {
  return process.env.SITEMAP_DIRECTORY || path.join(process.cwd(), ".cache", "sitemaps");
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char]!);
}

export function sitemapUrlSet(urls: Array<{ url: string; lastModified?: string }>): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(({ url, lastModified }) => `<url><loc>${escapeXml(url)}</loc>${
      lastModified ? `<lastmod>${escapeXml(lastModified)}</lastmod>` : ""
    }</url>`).join("\n") + "\n</urlset>";
}

export function fallbackSitemap(): string {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com").replace(/\/$/, "");
  return sitemapUrlSet(SITEMAP_STATIC_PATHS.map((route) => ({ url: `${baseUrl}${route}` })));
}

/** The public path reads completed files only. Never import DB or feed loaders here. */
export async function readSitemapFile(file: string): Promise<string | null> {
  if (file !== "index.xml" && !/^sitemap-[a-f0-9-]+-\d+\.xml$/.test(file)) return null;
  try {
    // Runtime-generated files live on the NAS volume, not in the build bundle.
    return await readFile(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ sitemapDirectory(), file), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[sitemap] Unable to read completed sitemap file", file);
    }
    return null;
  }
}
