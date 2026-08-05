import { useState, useEffect, useCallback } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import {
  CONSENT_UPDATED_EVENT,
  getConsentPreferences,
  openConsentPreferences,
} from "@/lib/consent";
import { detectUserLocationGps, getLocationFromIp, defaultLocation } from "@/lib/geolocation";
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
    } catch (error) {
      console.error("Error fetching IP location:", error);
      setErrorMessage(homeUi.geolocationApiError); // Set user-friendly error message
      setUserLocation(defaultLocation()); // Fallback to default location
    } finally {
      setIsLocating(false);
    }
  }, [setErrorMessage, setUserLocation, homeUi.geolocationApiError]);

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

  // GPS only on explicit user action and with Location consent
  const handleRefreshGps = useCallback(async () => {
    const prefs = getConsentPreferences();
    if (!prefs?.location) {
      openConsentPreferences();
      return;
    }

    setIsLocating(true);
    try {
      const loc = await detectUserLocationGps();
      setUserLocation(loc);
      setErrorMessage(null); // Clear any previous error message on GPS success
    } catch (error) {
      console.error("Error fetching GPS location:", error);
      // Determine which user-friendly message to show based on the error
      const message = (
        error instanceof GeolocationPositionError
          ? error.code === error.PERMISSION_DENIED
            ? homeUi.geolocationPermissionDenied
            : error.code === error.POSITION_UNAVAILABLE
              ? homeUi.geolocationPositionUnavailable
              : error.code === error.TIMEOUT
                ? homeUi.geolocationTimeout
                : homeUi.geolocationApiError
          : homeUi.geolocationApiError
      );
      setErrorMessage(message); // Set user-friendly error message
      setUserLocation(defaultLocation()); // Fallback to default location
    } finally {
      setIsLocating(false);
    }
  }, [setIsLocating, setUserLocation, setErrorMessage]);

  return {
    userLocation,
    isLocating,
    errorMessage,
    handleCountryChange,
    handleRefreshGps,
  };
}
