import { beforeEach, describe, expect, it } from "vitest";
import {
  MARKET_COUNTRY_STORAGE_KEY,
  readStoredMarketCountry,
  writeStoredMarketCountry,
} from "@/lib/market-preference";

describe("market preference storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads and writes a valid country code", () => {
    writeStoredMarketCountry("RO");
    expect(localStorage.getItem(MARKET_COUNTRY_STORAGE_KEY)).toBe("RO");
    expect(readStoredMarketCountry()).toBe("RO");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(MARKET_COUNTRY_STORAGE_KEY, "XX");
    expect(readStoredMarketCountry()).toBe(null);
  });
});
