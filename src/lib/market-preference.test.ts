import { beforeEach, describe, expect, it } from "vitest";
import {
  MARKET_COUNTRY_COOKIE,
  MARKET_COUNTRY_STORAGE_KEY,
  readStoredMarketCountry,
  writeStoredMarketCountry,
} from "@/lib/market-preference";

describe("market preference storage", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie.split(";").forEach((part) => {
      const name = part.split("=")[0]?.trim();
      if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
    });
  });

  it("reads and writes a valid country code", () => {
    writeStoredMarketCountry("RO");
    expect(localStorage.getItem(MARKET_COUNTRY_STORAGE_KEY)).toBe("RO");
    expect(readStoredMarketCountry()).toBe("RO");
    expect(document.cookie).toContain(`${MARKET_COUNTRY_COOKIE}=RO`);
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(MARKET_COUNTRY_STORAGE_KEY, "XX");
    expect(readStoredMarketCountry()).toBe(null);
  });
});
