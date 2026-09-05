import { useState, useEffect, useCallback } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import {
  isCountryCode,
  readStoredMarketCountry,
  writeStoredMarketCountry,
} from "@/lib/market-preference";
import {
  getPrimaryLiveBrowseCountry,
  resolveBrowseCountry,
} from "@/lib/live-browse-market";

interface UseUserLocationResult {
  userLocation: UserLocation;
  handleCountryChange: (countryCode: CountryCode) => void;
}

function locationFromCountry(
  countryCode: CountryCode
): UserLocation {
  const resolved = resolveBrowseCountry(countryCode);
  const targetCountry = COUNTRIES[resolved] || COUNTRIES[getPrimaryLiveBrowseCountry()];
  return {
    countryCode: resolved,
    countryName: targetCountry.name,
  };
}

export function useUserLocation(initialCountry: CountryCode): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    // The first client render must match the server-rendered market. Browser
    // preferences are applied after hydration by the effect below.
    return locationFromCountry(initialCountry);
  });

  // A saved manual choice or URL override updates the market
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("country")?.toUpperCase();
    if (fromUrl && isCountryCode(fromUrl)) {
      const resolved = resolveBrowseCountry(fromUrl);
      writeStoredMarketCountry(resolved);
      setUserLocation((current) => current.countryCode === resolved ? current : locationFromCountry(resolved));
      return;
    }
    const stored = readStoredMarketCountry();
    if (stored) {
      const resolved = resolveBrowseCountry(stored);
      writeStoredMarketCountry(resolved);
      setUserLocation((current) => current.countryCode === resolved ? current : locationFromCountry(resolved));
    }
  }, [initialCountry]);

  const handleCountryChange = useCallback((countryCode: CountryCode) => {
    const resolved = resolveBrowseCountry(countryCode);
    writeStoredMarketCountry(resolved);
    setUserLocation((current) => current.countryCode === resolved ? current : locationFromCountry(resolved));
  }, []);

  return {
    userLocation,
    handleCountryChange,
  };
}
