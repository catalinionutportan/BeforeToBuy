import { describe, expect, it } from "vitest";
import { productMatchesCategoryFilter } from "@/lib/categories";
import {
  DEFAULT_MARKET_HUB_ID,
  MARKET_HUB_TABS,
  defaultMarketHubForCountry,
  isMarketHubId,
  marketHubOrderForCountry,
} from "@/lib/market-hubs";

describe("market hubs", () => {
  it("keeps electronics hub id valid but lands every market on All", () => {
    expect(DEFAULT_MARKET_HUB_ID).toBe("hub-electronics");
    expect(isMarketHubId(DEFAULT_MARKET_HUB_ID)).toBe(true);
    expect(defaultMarketHubForCountry("RO")).toBe("all");
    expect(defaultMarketHubForCountry("CH")).toBe("all");
    expect(defaultMarketHubForCountry("GB")).toBe("all");
  });

  it("orders CH hubs with fashion and DIY before electronics", () => {
    expect(marketHubOrderForCountry("CH")[0]).toBe("hub-fashion");
    expect(marketHubOrderForCountry("CH")[1]).toBe("hub-diy");
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
    expect(
      productMatchesCategoryFilter(
        { title: "Tyre", description: "", brand: "A", category: "auto-tires-wheels" },
        "hub-diy"
      )
    ).toBe(true);
  });

  it("exposes top market hubs in usage order", () => {
    expect(MARKET_HUB_TABS.map((hub) => hub.id)).toEqual([
      "hub-electronics",
      "hub-home",
      "hub-books",
      "hub-fashion",
      "hub-garden",
      "hub-diy",
    ]);
  });
});
