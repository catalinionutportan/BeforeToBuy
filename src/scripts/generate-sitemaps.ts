/** Offline only: npm run sitemap:generate after catalogue imports, before/after deployment. */
import { mkdir, writeFile, rename, rmdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/db";
import { getParentCategoryId } from "../lib/categories";
import { defaultLocaleFromCountry } from "../lib/i18n/locales";
import { isCountryCode } from "../lib/market-preference";
import { departmentCategoryPath, subcategoryCategoryPath } from "../lib/category-routes";
import { productPagePath } from "../lib/seo/site-url";
import { escapeXml, sitemapDirectory, sitemapUrlSet, SITEMAP_STATIC_PATHS } from "../lib/seo/sitemap-files";

async function main() {
  const directory = sitemapDirectory();
  const lock = path.join(directory, ".generation-lock");
  await mkdir(directory, { recursive: true });
  // A failed process leaves a visible lock; a second job must not race publication.
  await mkdir(lock);
  try {
    const generation = randomUUID();
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com").replace(/\/$/, "");
    const files: string[] = [];
    const categoryUrls = new Set<string>();
    let entries: Array<{ url: string; lastModified?: string }> = [];
    let cursor: string | undefined;
    let products = 0;
    const publishPart = async () => {
      const file = `sitemap-${generation}-${files.length}.xml`;
      await writeFile(path.join(directory, file), sitemapUrlSet(entries), { flag: "wx" });
      files.push(file);
      entries = [];
    };

    while (true) {
      // Bounded, sequential, ID-indexed queries. No full-catalogue merge or feed fallback.
      const rows = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '10s'");
        return tx.product.findMany({
          where: {
            catalogSource: "production-live", category: { not: "unmapped" },
            offers: { some: { source: "production-live", inStock: true } },
            ...(cursor ? { id: { gt: cursor } } : {}),
          },
          select: { id: true, category: true, targetCountries: true, updatedAt: true },
          orderBy: { id: "asc" }, take: 2000,
        });
      }, { timeout: 15000, maxWait: 5000 });
      if (!rows.length) break;
      for (const row of rows) {
        entries.push({ url: `${baseUrl}${productPagePath(row.id)}`, lastModified: row.updatedAt.toISOString() });
        const parent = getParentCategoryId(row.category);
        for (const country of row.targetCountries) {
          if (!parent || !isCountryCode(country)) continue;
          const suffix = `?country=${country}&lang=${defaultLocaleFromCountry(country)}`;
          categoryUrls.add(`${baseUrl}${departmentCategoryPath(parent)}${suffix}`);
          categoryUrls.add(`${baseUrl}${subcategoryCategoryPath(parent, row.category)}${suffix}`);
        }
        if (entries.length === 10000) await publishPart();
      }
      products += rows.length;
      cursor = rows[rows.length - 1]!.id;
    }
    if (!products) throw new Error("No eligible products; refusing to replace the published index");
    if (entries.length) await publishPart();
    entries = [
      ...SITEMAP_STATIC_PATHS.map((route) => ({ url: `${baseUrl}${route}` })),
      ...Array.from(categoryUrls).sort().map((url) => ({ url })),
    ];
    await publishPart();
    const index = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      files.map((file) => `<sitemap><loc>${escapeXml(`${baseUrl}/sitemaps/${file}`)}</loc></sitemap>`).join("\n") +
      '\n</sitemapindex>';
    const temporaryIndex = path.join(directory, `index-${generation}.tmp`);
    await writeFile(temporaryIndex, index, { flag: "wx" });
    await rename(temporaryIndex, path.join(directory, "index.xml"));
    // Older generation files stay valid for cached indexes/crawlers and rollback.
    console.log(JSON.stringify({ products, categories: categoryUrls.size, files: files.length, directory }));
  } finally {
    await rmdir(lock);
  }
}

main().catch((error) => {
  console.error("Sitemap generation failed; the previous published index is unchanged.", error.message);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
