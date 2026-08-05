import { vi } from 'vitest';
import { CountryCode } from "@/types";

export const mockCountryPriceMultipliers: Record<CountryCode, number> = {
  CH: 1.15,
  DE: 1.0,
  FR: 1.02,
  RO: 4.98,
  GB: 0.85,
  US: 1.05,
};

export const mockFetch = vi.fn((url: string) => {
  if (url.includes('/data/country-price-multipliers.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCountryPriceMultipliers),
    } as Response);
  }
  return Promise.reject(new Error(`Unhandled fetch for URL: ${url}`));
});