import { describe, expect, it } from "vitest";
import {
  countryHasLiveFeeds,
  getPrimaryLiveBrowseCountry,
  resolveBrowseCountry,
} from "@/lib/live-browse-market";

describe("live browse market", () => {
  it("prefers RO while Swiss feeds are offline", () => {
    expect(getPrimaryLiveBrowseCountry()).toBe("RO");
    expect(countryHasLiveFeeds("RO")).toBe(true);
    expect(countryHasLiveFeeds("CH")).toBe(false);
  });

  it("resolves empty markets to the primary live catalogue", () => {
    expect(resolveBrowseCountry("CH")).toBe("RO");
    expect(resolveBrowseCountry("DE")).toBe("RO");
    expect(resolveBrowseCountry(null)).toBe("RO");
    expect(resolveBrowseCountry("RO")).toBe("RO");
  });
});
