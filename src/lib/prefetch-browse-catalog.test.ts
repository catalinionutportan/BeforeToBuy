import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductFetchMeta } from "@/lib/product-service";
import {
  PREFETCH_BROWSE_MARKETS,
  clearSessionBrowseMemoryForTests,
  ensureBrowseCatalog,
  getSessionBrowsePage,
  resetSessionBrowsePagesForTests,
  setSessionBrowsePage,
} from "./prefetch-browse-catalog";

const emptyMeta = { categoryCounts: {}, categoryCovers: {} } as ProductFetchMeta;

describe("prefetch browse markets", () => {
  beforeEach(() => {
    resetSessionBrowsePagesForTests();
  });

  it("includes CH so a GB session can warm Switzerland before switch", () => {
    expect(PREFETCH_BROWSE_MARKETS).toContain("CH");
    expect(PREFETCH_BROWSE_MARKETS).toContain("GB");
  });

  it("keeps a first page in this tab so GB→CH is not a network wait", () => {
    setSessionBrowsePage("CH", "en", { products: [], meta: emptyMeta });
    expect(getSessionBrowsePage("CH", "en")).toEqual({ products: [], meta: emptyMeta });
    expect(getSessionBrowsePage("GB", "en")).toBeNull();
  });

  it("reuses a cached CH page instead of opening a second request", async () => {
    setSessionBrowsePage("CH", "en", { products: [], meta: emptyMeta });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await expect(ensureBrowseCatalog("CH", "en")).resolves.toEqual({
      products: [],
      meta: emptyMeta,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("keeps an aisle page in this tab separate from all products", () => {
    setSessionBrowsePage("CH", "en", { products: [{ id: "all-1" } as never], meta: emptyMeta });
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
      meta: emptyMeta,
    });
    clearSessionBrowseMemoryForTests();
    expect(getSessionBrowsePage("CH", "en")?.products).toEqual([{ id: "acer-1" }]);
  });
});
