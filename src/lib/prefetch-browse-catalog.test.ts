import { beforeEach, describe, expect, it } from "vitest";
import type { ProductFetchMeta } from "@/lib/product-service";
import {
  PREFETCH_BROWSE_MARKETS,
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
});
