import { describe, expect, it } from "vitest";
import { productMatchesCategoryFilter } from "@/lib/categories";
import {
  DEFAULT_MARKET_HUB_ID,
  LANDING_CATEGORY_ID,
  MARKET_HUB_TABS,
  defaultMarketHubForCountry,
  isMarketHubId,
  marketHubOrderForCountry,
  occupiedLeavesOutsideMarketHubs,
  selectionHasCatalogOffers,
  resolveOccupiedBrowseCategory,
  shouldIgnoreLandingCategory,
} from "@/lib/market-hubs";

describe("market hubs", () => {
  it("keeps electronics hub id valid but lands every market on All", () => {
    expect(DEFAULT_MARKET_HUB_ID).toBe("hub-electronics");
    expect(isMarketHubId(DEFAULT_MARKET_HUB_ID)).toBe(true);
    expect(LANDING_CATEGORY_ID).toBe("all");
    expect(defaultMarketHubForCountry("RO")).toBe("all");
    expect(defaultMarketHubForCountry("CH")).toBe("all");
    expect(defaultMarketHubForCountry("GB")).toBe("all");
    expect(shouldIgnoreLandingCategory("hub-electronics")).toBe(false);
    expect(shouldIgnoreLandingCategory(null)).toBe(true);
    expect(shouldIgnoreLandingCategory("all")).toBe(true);
    expect(shouldIgnoreLandingCategory("hub-fashion")).toBe(false);
  });

  it("treats empty CH leaves as having no offers once counts are known", () => {
    const counts = { "notebooks-laptops": 73, "fashion-beauty-hair-care": 10 };
    expect(selectionHasCatalogOffers("all", counts)).toBe(true);
    expect(selectionHasCatalogOffers("notebooks-laptops", counts)).toBe(true);
    expect(selectionHasCatalogOffers("hub-electronics", counts)).toBe(true);
    expect(selectionHasCatalogOffers("mobile-feature-phones", counts)).toBe(false);
    expect(selectionHasCatalogOffers("hub-diy", counts)).toBe(false);
    expect(selectionHasCatalogOffers("mobile-feature-phones", undefined)).toBe(true);
  });

  it("falls empty aisles back to All when the market already has products", () => {
    const counts = { "notebooks-laptops": 73 };
    expect(resolveOccupiedBrowseCategory("mobile-feature-phones", counts, 194)).toBe("all");
    expect(resolveOccupiedBrowseCategory("notebooks-laptops", counts, 194)).toBe("notebooks-laptops");
    expect(resolveOccupiedBrowseCategory("hub-electronics", counts, 194)).toBe("hub-electronics");
    expect(resolveOccupiedBrowseCategory("mobile-feature-phones", undefined, 0)).toBe(
      "mobile-feature-phones"
    );
    expect(resolveOccupiedBrowseCategory("mobile-feature-phones", undefined, 194)).toBe("mobile-feature-phones");
    expect(resolveOccupiedBrowseCategory("notebooks-laptops", undefined, 194)).toBe("notebooks-laptops");
  });

  it("orders CH hubs with fashion and Auto before electronics", () => {
    expect(marketHubOrderForCountry("CH")[0]).toBe("hub-fashion");
    expect(marketHubOrderForCountry("CH")[1]).toBe("hub-auto");
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
        "hub-auto"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        { title: "Tyre", description: "", brand: "A", category: "auto-tires-wheels" },
        "hub-diy"
      )
    ).toBe(false);
    expect(
      productMatchesCategoryFilter(
        {
          title: "20 Ludwig 7 5x17 5x112 ET35 MB66 6",
          description: "",
          brand: "A",
          category: "auto-tires-wheels",
        },
        "auto-complete-wheels"
      )
    ).toBe(true);
    expect(
      productMatchesCategoryFilter(
        {
          title: "20 Ludwig 7 5x17 5x112 ET35 MB66 6",
          description: "",
          brand: "A",
          category: "auto-tires-wheels",
        },
        "auto-tires-wheels"
      )
    ).toBe(false);
    expect(
      productMatchesCategoryFilter(
        { title: "Kuscheltier", description: "", brand: "A", category: "toys-electronic" },
        "hub-fashion"
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
      "hub-auto",
    ]);
  });

  it("keeps occupied mobility and outdoor leaves reachable from the compact menu", () => {
    expect(
      occupiedLeavesOutsideMarketHubs({
        "notebooks-laptops": 12,
        "mobility-ebikes": 7,
        "mobility-bicycles": 5,
        "outdoor-electronics": 3,
        electronics: 27,
        unmapped: 9,
      })
    ).toEqual([
      { id: "mobility-ebikes", count: 7 },
      { id: "mobility-bicycles", count: 5 },
      { id: "outdoor-electronics", count: 3 },
    ]);
  });
});
