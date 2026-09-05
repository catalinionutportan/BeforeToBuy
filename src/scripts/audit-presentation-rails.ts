/**
 * Read-only audit of live presentation-rail categories for CH/DE/GB/US.
 * Requests are deliberately sequential and start at least one second apart.
 */
import { expandCategoryFilterToDbIds } from "../lib/db-category-filter";
import { resolveShortcutBoards } from "../lib/browse-shortcut-boards";
import type { CountryCode, Product } from "../types";

type AuditMarket = { country: Extract<CountryCode, "CH" | "DE" | "GB" | "US">; lang: string };
type ApiResponse = {
  products: Product[];
  meta: {
    totalMatched: number;
    categoryCounts: Record<string, number>;
    categoryCovers: Record<string, string>;
  };
};

const MARKETS: AuditMarket[] = [
  { country: "CH", lang: "de" },
  { country: "DE", lang: "de" },
  { country: "GB", lang: "en" },
  { country: "US", lang: "en" },
];
const REQUEST_GAP_MS = 1_000;
const SAMPLE_LIMIT = 48;
const baseUrl = (process.env.AUDIT_BASE_URL || "https://www.beforetobuy.com").replace(/\/$/, "");
let lastRequestStartedAt = 0;

async function waitForRequestSlot(): Promise<void> {
  const waitMs = lastRequestStartedAt + REQUEST_GAP_MS - Date.now();
  if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastRequestStartedAt = Date.now();
}

async function readApi(url: URL): Promise<{ body: ApiResponse; elapsedMs: number }> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await waitForRequestSlot();
    const startedAt = performance.now();
    const response = await fetch(url, { headers: { accept: "application/json" } });
    const elapsedMs = Math.round(performance.now() - startedAt);
    if (response.ok) {
      return { body: await response.json() as ApiResponse, elapsedMs };
    }
    const transient = [502, 503, 504].includes(response.status);
    if (!transient || attempt === 3) {
      throw new Error(`${response.status} ${response.statusText} for ${url.pathname}`);
    }
  }
  throw new Error(`Unreachable retry state for ${url.pathname}`);
}

function apiUrl(market: AuditMarket, category?: string, domain?: string): URL {
  const url = new URL("/api/products", baseUrl);
  url.searchParams.set("country", market.country);
  url.searchParams.set("lang", market.lang);
  url.searchParams.set("limit", category ? String(SAMPLE_LIMIT) : "1");
  if (category) url.searchParams.set("category", category);
  if (domain) url.searchParams.set("domain", domain);
  return url;
}

async function main(): Promise<void> {
  const reports = [];
  for (const market of MARKETS) {
    const initial = await readApi(apiUrl(market));
    const boards = resolveShortcutBoards(
      market.country,
      initial.body.meta.categoryCounts,
      initial.body.meta.categoryCovers
    );
    const seen = new Set<string>();
    const tiles = boards.flatMap((board) => board.tiles.map((tile) => ({
      ...tile,
      domain: board.domain,
    }))).filter((tile) => {
      if (seen.has(tile.categoryId)) return false;
      seen.add(tile.categoryId);
      return true;
    });

    const categoryReports = [];
    for (const tile of tiles) {
      const result = await readApi(apiUrl(market, tile.categoryId, tile.domain));
      const allowedCategories = expandCategoryFilterToDbIds(tile.categoryId) ?? [];
      const unexpectedSampleCategories = [...new Set(
        result.body.products
          .map((product) => product.category)
          .filter((category) => !allowedCategories.includes(category))
      )];
      const expandedInventoryCount = allowedCategories.reduce(
        (sum, category) => sum + (initial.body.meta.categoryCounts[category] ?? 0),
        0
      );
      categoryReports.push({
        categoryId: tile.categoryId,
        domain: tile.domain ?? "all",
        railCount: tile.count,
        resultCount: result.body.meta.totalMatched,
        expandedInventoryCount,
        sampledProducts: result.body.products.length,
        unexpectedSampleCategories,
        elapsedMs: result.elapsedMs,
        ok:
          result.body.products.length > 0 &&
          unexpectedSampleCategories.length === 0 &&
          result.body.meta.totalMatched === expandedInventoryCount,
      });
    }
    reports.push({
      country: market.country,
      railCategories: tiles.length,
      initialElapsedMs: initial.elapsedMs,
      categories: categoryReports,
    });
  }

  const categories = reports.flatMap((report) => report.categories);
  console.log(JSON.stringify({
    baseUrl,
    markets: reports.length,
    railCategories: categories.length,
    sampledProducts: categories.reduce((sum, row) => sum + row.sampledProducts, 0),
    failures: categories.filter((row) => !row.ok),
    countPresentationDifferences: categories.filter((row) => row.railCount !== row.resultCount),
    reports,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
