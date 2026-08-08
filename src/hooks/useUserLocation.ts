import { useState, useEffect, useCallback, useRef } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  CONSENT_UPDATED_EVENT,
  getConsentPreferences,
  openConsentPreferences,
} from "@/lib/consent";
import { detectUserLocationGps, getLocationFromIp, formatLocationError } from "@/lib/geolocation";
import {
  readStoredMarketCountry,
  writeStoredMarketCountry,
} from "@/lib/market-preference";
import { HOME_UI } from "@/lib/i18n/ui";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";

interface UseUserLocationResult {
  userLocation: UserLocation;
  isLocating: boolean;
  errorMessage: string | null;
  handleCountryChange: (countryCode: CountryCode) => void;
  handleRefreshGps: () => Promise<void>;
}

function locationFromCountry(
  countryCode: CountryCode,
  locationKind: UserLocation["locationKind"]
): UserLocation {
  const targetCountry = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  return {
    latitude: targetCountry.defaultCoordinates.lat,
    longitude: targetCountry.defaultCoordinates.lng,
    countryCode,
    countryName: targetCountry.name,
    city: targetCountry.defaultCoordinates.city,
    isGps: false,
    locationKind,
  };
}

export function useUserLocation(): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<UserLocation>(() =>
    locationFromCountry(DEFAULT_COUNTRY, "default")
  );

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const marketLockedRef = useRef(false);

  const { locale: browseLocale } = useBrowseLocale(userLocation.countryCode);
  const homeUi = HOME_UI[browseLocale];

  const initIpLocation = useCallback(async () => {
    if (marketLockedRef.current || readStoredMarketCountry()) {
      return;
    }

    setIsLocating(true);
    try {
      const loc = await getLocationFromIp();
      if (marketLockedRef.current || readStoredMarketCountry()) {
        return;
      }
      setUserLocation(loc);
      setErrorMessage(null);
    } catch (error) {
      console.warn("Error fetching IP location:", formatLocationError(error));
      setErrorMessage(homeUi.geolocationPositionUnavailable);
    } finally {
      setIsLocating(false);
    }
  }, [homeUi.geolocationPositionUnavailable]);

  // Restore saved market first; IP only when the user has not chosen a market.
  useEffect(() => {
    const stored = readStoredMarketCountry();
    if (stored) {
      marketLockedRef.current = true;
      // Refresh cookie so SSR category pages see the same market as localStorage.
      writeStoredMarketCountry(stored);
      setUserLocation(locationFromCountry(stored, "manual"));
    }

    const prefs = getConsentPreferences();
    if (!stored && prefs?.location) {
      void initIpLocation();
    }

    const onConsentUpdated = () => {
      const updated = getConsentPreferences();
      if (updated?.location) {
        void initIpLocation();
      }
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [initIpLocation]);

  const handleCountryChange = useCallback((countryCode: CountryCode) => {
    marketLockedRef.current = true;
    writeStoredMarketCountry(countryCode);
    setErrorMessage(null);
    setUserLocation(locationFromCountry(countryCode, "manual"));
  }, []);

  // GPS only on explicit user action and with Location consent.
  // Explicit GPS may update market; still persists the detected country.
  const handleRefreshGps = useCallback(async () => {
    const prefs = getConsentPreferences();
    if (!prefs?.location) {
      openConsentPreferences();
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);
    try {
      const loc = await detectUserLocationGps();
      marketLockedRef.current = true;
      writeStoredMarketCountry(loc.countryCode);
      setUserLocation(loc);
      setErrorMessage(null);
    } catch (error) {
      const isGeoError =
        typeof GeolocationPositionError !== "undefined" &&
        error instanceof GeolocationPositionError;
      const isTimeout = isGeoError && error.code === error.TIMEOUT;
      const isUnavailable = isGeoError && error.code === error.POSITION_UNAVAILABLE;

      if (isTimeout || isUnavailable) {
        console.warn("GPS unavailable, falling back to IP:", formatLocationError(error));
        try {
          const ipLoc = await getLocationFromIp();
          marketLockedRef.current = true;
          writeStoredMarketCountry(ipLoc.countryCode);
          setUserLocation(ipLoc);
          setErrorMessage(null);
          return;
        } catch (ipError) {
          console.warn("IP location fallback failed:", formatLocationError(ipError));
          setErrorMessage(
            isTimeout ? homeUi.geolocationTimeout : homeUi.geolocationPositionUnavailable
          );
          return;
        }
      }

      console.warn("Error fetching GPS location:", formatLocationError(error));
      const message = isGeoError
        ? error.code === error.PERMISSION_DENIED
          ? homeUi.geolocationPermissionDenied
          : homeUi.geolocationPositionUnavailable
        : homeUi.geolocationPositionUnavailable;
      setErrorMessage(message);
    } finally {
      setIsLocating(false);
    }
  }, [
    homeUi.geolocationPermissionDenied,
    homeUi.geolocationPositionUnavailable,
    homeUi.geolocationTimeout,
  ]);

  return {
    userLocation,
    isLocating,
    errorMessage,
    handleCountryChange,
    handleRefreshGps,
  };
}
