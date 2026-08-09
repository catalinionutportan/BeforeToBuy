import { useState, useEffect, useCallback } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
import {
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
    // Prefer a saved manual market; otherwise use the request country from the server.
    const initial =
      (typeof window !== "undefined" && readStoredMarketCountry()) ||
      initialCountry;
    return locationFromCountry(initial);
  });

  // A saved manual choice overrides the request-country market from the server.
  useEffect(() => {
    const stored = readStoredMarketCountry();
    if (stored) {
      const resolved = resolveBrowseCountry(stored);
      writeStoredMarketCountry(resolved);
      setUserLocation(locationFromCountry(resolved));
    }
  }, []);

  const handleCountryChange = useCallback((countryCode: CountryCode) => {
    const resolved = resolveBrowseCountry(countryCode);
    writeStoredMarketCountry(resolved);
    setUserLocation(locationFromCountry(resolved));
  }, []);

  return {
    userLocation,
    handleCountryChange,
  };
}
