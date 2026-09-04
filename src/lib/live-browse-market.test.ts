import { describe, expect, it } from "vitest";
import {
  countryHasBrowseCatalogue,
  countryHasLiveFeeds,
  getPrimaryLiveBrowseCountry,
  resolveBrowseCountry,
} from "@/lib/live-browse-market";

describe("live browse market", () => {
  it("prefers RO browse catalogue while Swiss feeds are offline", () => {
    expect(getPrimaryLiveBrowseCountry()).toBe("RO");
    // Request-path CSV feeds for RO are disabled (Supabase import path).
    expect(countryHasLiveFeeds("RO")).toBe(false);
    expect(countryHasBrowseCatalogue("RO")).toBe(true);
    expect(countryHasLiveFeeds("CH")).toBe(true);
    expect(countryHasBrowseCatalogue("CH")).toBe(true);
  });

  it("keeps supported markets and falls back only when missing", () => {
    expect(resolveBrowseCountry("CH")).toBe("CH");
    expect(resolveBrowseCountry("DE")).toBe("DE");
    expect(resolveBrowseCountry(null)).toBe("RO");
    expect(resolveBrowseCountry("RO")).toBe("RO");
    expect(resolveBrowseCountry("GB")).toBe("GB");
    expect(resolveBrowseCountry("FR")).toBe("RO");
  });
});
