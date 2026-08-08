import { describe, expect, it } from "vitest";
import {
  countryHasLiveFeeds,
  getPrimaryLiveBrowseCountry,
} from "@/lib/live-browse-market";

describe("live browse market", () => {
  it("prefers RO while Swiss feeds are offline", () => {
    expect(getPrimaryLiveBrowseCountry()).toBe("RO");
    expect(countryHasLiveFeeds("RO")).toBe(true);
    expect(countryHasLiveFeeds("CH")).toBe(false);
  });
});
