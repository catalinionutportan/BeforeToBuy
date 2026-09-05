import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/market-preference", () => ({
  isCountryCode: (country: string) => ["CH", "RO", "DE", "GB", "US"].includes(country),
  readStoredMarketCountry: () => "CH",
  writeStoredMarketCountry: vi.fn(),
}));
import { useUserLocation } from "./useUserLocation";

beforeEach(() => { window.history.replaceState({}, "", "/?country=CH"); });

it("keeps the same location identity when hydration or a repeated choice confirms the current market", () => {
  const locations: unknown[] = [];
  const { result } = renderHook(() => {
    const location = useUserLocation("CH");
    locations.push(location.userLocation);
    return location;
  });
  const initial = result.current.userLocation;
  expect(locations.every((location) => location === initial)).toBe(true);
  act(() => result.current.handleCountryChange("CH"));
  expect(result.current.userLocation).toBe(initial);
  act(() => result.current.handleCountryChange("RO"));
  expect(result.current.userLocation.countryCode).toBe("RO");
  expect(result.current.userLocation).not.toBe(initial);
});
