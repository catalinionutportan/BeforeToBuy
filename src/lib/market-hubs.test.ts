import { describe, expect, it } from "vitest";
import { productMatchesCategoryFilter } from "@/lib/categories";
import { DEFAULT_MARKET_HUB_ID, MARKET_HUB_TABS, isMarketHubId } from "@/lib/market-hubs";

describe("market hubs", () => {
  it("defaults to electronics hub", () => {
    expect(DEFAULT_MARKET_HUB_ID).toBe("hub-electronics");
    expect(isMarketHubId(DEFAULT_MARKET_HUB_ID)).toBe(true);
  });

  it("matches demo products into the correct hub", () => {
    expect(
      productMatchesCategoryFilter(
        { title: "Phone", description: "", brand: "A", category: "mobile-smartphones" },
        "hub-electronics"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { title: "Book", description: "", brand: "A", category: "media-books" },
        "hub-books"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { title: "Drill", description: "", brand: "A", category: "diy-power-tools" },
        "hub-diy"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { title: "Drill", description: "", brand: "A", category: "diy-power-tools" },
        "hub-electronics"
      )
    ).toBe(false);
  });

  it("exposes five top tabs", () => {
    expect(MARKET_HUB_TABS.map((hub) => hub.id)).toEqual([
      "hub-electronics",
      "hub-books",
      "hub-fashion",
      "hub-garden",
      "hub-diy",
    ]);
  });
});
