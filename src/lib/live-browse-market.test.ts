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

  it("maps geo country codes without forcing empty CH", async () => {
    const { resolveGeoCountryCode } = await import("@/lib/live-browse-market");
    expect(resolveGeoCountryCode("CH")).toBe("RO");
    expect(resolveGeoCountryCode("ch")).toBe("RO");
    expect(resolveGeoCountryCode(null)).toBe("RO");
    expect(resolveGeoCountryCode("")).toBe("RO");
    expect(resolveGeoCountryCode("ZZ")).toBe("RO");
    expect(resolveGeoCountryCode("RO")).toBe("RO");
  });
});
