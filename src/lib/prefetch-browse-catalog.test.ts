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

  it("keeps a snapshot in this tab without treating it as a freshness check", () => {
    setSessionBrowsePage("CH", "en", { products: [{ id: "acer-1" } as never], meta: completeMeta });
    expect(getSessionBrowsePage("CH", "en")?.products).toEqual([{ id: "acer-1" }]);
    expect(getSessionBrowsePage("GB", "en")).toBeNull();
  });

  it("accepts a complete catalogue that fits on one page", () => {
    expect(isUsableAllBrowsePage({
      products: [{ id: "one" } as never],
      meta: { ...completeMeta, totalMatched: 1, categoryCounts: { "notebooks-laptops": 1 } },
    })).toBe(true);
  });

  it("checks the revision-aware origin on navigation even when a previous page exists", async () => {
    const page = { products: [{ id: "acer-1" } as never], meta: completeMeta };
    setSessionBrowsePage("CH", "en", page);
    const fresh = { products: [{ id: "after-import" } as never], meta: { ...completeMeta, catalogRevision: "new" } };
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => fresh });
    vi.stubGlobal("fetch", fetchSpy);
    await expect(ensureBrowseCatalog("CH", "en")).resolves.toEqual(fresh);
    expect(fetchSpy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ cache: "no-store" }));
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

  it("reuses a persisted first page after a remount in the same tab", () => {
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

  it("expires the memory layer too, without extending lifetime after a remount", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(1000000);
      setSessionBrowsePage("US", "en", { products: [{ id: "old" } as Product], meta: completeMeta });
      vi.setSystemTime(1000000 + 899000);
      clearSessionBrowseMemoryForTests();
      expect(getSessionBrowsePage("US", "en")).not.toBeNull();
      vi.setSystemTime(1000000 + 900000);
      expect(getSessionBrowsePage("US", "en")).toBeNull();
    } finally { vi.useRealTimers(); }
  });
});
