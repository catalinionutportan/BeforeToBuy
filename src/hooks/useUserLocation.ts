import { useState, useEffect, useCallback } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  CONSENT_UPDATED_EVENT,
  getConsentPreferences,
  openConsentPreferences,
} from "@/lib/consent";
import { detectUserLocationGps, getLocationFromIp, formatLocationError } from "@/lib/geolocation";
import { HOME_UI } from "@/lib/i18n/ui";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";

interface UseUserLocationResult {
  userLocation: UserLocation;
  isLocating: boolean;
  errorMessage: string | null;
  handleCountryChange: (countryCode: CountryCode) => void;
  handleRefreshGps: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.lat,
    longitude: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.lng,
    countryCode: DEFAULT_COUNTRY,
    countryName: COUNTRIES[DEFAULT_COUNTRY].name,
    city: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.city,
    isGps: false,
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { locale: browseLocale } = useBrowseLocale(userLocation.countryCode);
  const homeUi = HOME_UI[browseLocale];

  const initIpLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const loc = await getLocationFromIp();
      setUserLocation(loc);
      setErrorMessage(null);
    } catch (error) {
      console.warn("Error fetching IP location:", formatLocationError(error));
      // Keep the current country selection; only show a non-blocking warning.
      setErrorMessage(homeUi.geolocationPositionUnavailable);
    } finally {
      setIsLocating(false);
    }
  }, [homeUi.geolocationPositionUnavailable]);

  // IP location only after Location consent (no auto-GPS)
  useEffect(() => {
    const prefs = getConsentPreferences();
    if (prefs?.location) {
      initIpLocation();
    }

    const onConsentUpdated = () => {
      const updated = getConsentPreferences();
      if (updated?.location) {
        initIpLocation();
      }
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [initIpLocation]);

  // Handle manual country change
  const handleCountryChange = useCallback((countryCode: CountryCode) => {
    const targetCountry = COUNTRIES[countryCode] || COUNTRIES.CH;
    setErrorMessage(null);
    setUserLocation((prev) => ({
      ...prev,
      countryCode,
      countryName: targetCountry.name,
      city: targetCountry.defaultCoordinates.city,
      latitude: targetCountry.defaultCoordinates.lat,
      longitude: targetCountry.defaultCoordinates.lng,
      isGps: false,
    }));
  }, [setUserLocation]);

  // GPS only on explicit user action and with Location consent.
  // On timeout/unavailable, fall back to IP location instead of failing hard.
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
      setUserLocation(loc);
      setErrorMessage(null);
    } catch (error) {
      const isGeoError =
        typeof GeolocationPositionError !== "undefined" &&
        error instanceof GeolocationPositionError;
      const isTimeout = isGeoError && error.code === error.TIMEOUT;
      const isUnavailable = isGeoError && error.code === error.POSITION_UNAVAILABLE;

      // Expected on localhost / indoors — warn, then try IP approximate location.
      if (isTimeout || isUnavailable) {
        console.warn("GPS unavailable, falling back to IP:", formatLocationError(error));
        try {
          const ipLoc = await getLocationFromIp();
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
