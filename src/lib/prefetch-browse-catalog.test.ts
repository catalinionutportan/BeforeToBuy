import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductFetchMeta } from "@/lib/product-service";
import type { Product } from "@/types";
import {
  PREFETCH_BROWSE_MARKETS,
  clearSessionBrowseMemoryForTests,
  ensureBrowseCatalog,
  getSessionBrowsePage,
  isUsableAllBrowsePage,
  resetSessionBrowsePagesForTests,
  setSessionBrowsePage,
} from "./prefetch-browse-catalog";

const emptyMeta = { categoryCounts: {}, categoryCovers: {} } as unknown as ProductFetchMeta;

describe("prefetch browse markets", () => {
  beforeEach(() => {
    resetSessionBrowsePagesForTests();
  });

  it("includes CH so a GB session can warm Switzerland before switch", () => {
    expect(PREFETCH_BROWSE_MARKETS).toContain("CH");
    expect(PREFETCH_BROWSE_MARKETS).toContain("GB");
  });

  const completeMeta = {
    categoryCounts: { "notebooks-laptops": 200, "auto-tires-wheels": 80 },
    categoryCovers: { "notebooks-laptops": "https://example.com/a.jpg" },
    totalMatched: 400,
  } as unknown as ProductFetchMeta;

  it("rejects an All page that only has the Acer-sized first page", () => {
    expect(
      isUsableAllBrowsePage({
        products: [{ id: "acer-1" } as never],
        meta: emptyMeta,
      })
    ).toBe(false);
    expect(
      isUsableAllBrowsePage({
        products: [{ id: "acer-1" } as never],
        meta: { ...completeMeta, totalMatched: 1 },
      })
    ).toBe(false);
    expect(
      isUsableAllBrowsePage({
        products: [{ id: "acer-1" } as never],
        meta: completeMeta,
      })
    ).toBe(true);
  });

  it("keeps a first page in this tab so GB→CH is not a network wait", () => {
    setSessionBrowsePage("CH", "en", { products: [{ id: "acer-1" } as never], meta: completeMeta });
    expect(getSessionBrowsePage("CH", "en")?.products).toEqual([{ id: "acer-1" }]);
    expect(getSessionBrowsePage("GB", "en")).toBeNull();
  });

  it("reuses a cached CH page instead of opening a second request", async () => {
    const page = { products: [{ id: "acer-1" } as never], meta: completeMeta };
    setSessionBrowsePage("CH", "en", page);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(ensureBrowseCatalog("CH", "en")).resolves.toEqual(page);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("refetches All when the saved page has no aisle counts", async () => {
    setSessionBrowsePage("CH", "en", {
      products: [{ id: "acer-1" } as never],
      meta: emptyMeta,
    });
    const fresh = { products: [{ id: "acer-1" } as never], meta: completeMeta };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => fresh,
      })
    );
    await expect(ensureBrowseCatalog("CH", "en")).resolves.toEqual(fresh);
    vi.unstubAllGlobals();
  });

  it("keeps an aisle page in this tab separate from all products", () => {
    setSessionBrowsePage("CH", "en", { products: [{ id: "all-1" } as never], meta: completeMeta });
    setSessionBrowsePage(
      "CH",
      "en",
      { products: [{ id: "tire-1" } as never], meta: emptyMeta },
      "auto-tires"
    );
    expect(getSessionBrowsePage("CH", "en")?.products).toEqual([{ id: "all-1" }]);
    expect(getSessionBrowsePage("CH", "en", "auto-tires")?.products).toEqual([{ id: "tire-1" }]);
  });

  it("reuses a persisted first page in a new tab without locale", () => {
    setSessionBrowsePage("CH", "de", {
      products: [{ id: "acer-1" } as never],
      meta: completeMeta,
    });
    clearSessionBrowseMemoryForTests();
    expect(getSessionBrowsePage("CH", "en")?.products).toEqual([{ id: "acer-1" }]);
  });

  it("preserves an extended catalogue and its order across a page remount", () => {
    const extendedProducts = Array.from({ length: 36 }, (_, index) => ({
      id: `product-${String(index + 1).padStart(2, "0")}`,
    })) as Product[];
    setSessionBrowsePage("CH", "de", {
      products: extendedProducts,
      meta: completeMeta,
    });

    clearSessionBrowseMemoryForTests();
    expect(getSessionBrowsePage("CH", "de")?.products.map((product) => product.id)).toEqual(
      extendedProducts.map((product) => product.id)
    );
  });
});
