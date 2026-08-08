import { useState, useEffect, useCallback, useRef } from "react";
import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "@/lib/countries";
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
import {
  getPrimaryLiveBrowseCountry,
  resolveBrowseCountry,
} from "@/lib/live-browse-market";
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
  const resolved = resolveBrowseCountry(countryCode);
  const targetCountry = COUNTRIES[resolved] || COUNTRIES[getPrimaryLiveBrowseCountry()];
  return {
    latitude: targetCountry.defaultCoordinates.lat,
    longitude: targetCountry.defaultCoordinates.lng,
    countryCode: resolved,
    countryName: targetCountry.name,
    city: targetCountry.defaultCoordinates.city,
    isGps: false,
    locationKind,
  };
}

/** Map IP/GPS detection onto a live catalogue market (never empty CH). */
function browseLocationFromDetected(loc: UserLocation): UserLocation {
  const resolved = resolveBrowseCountry(loc.countryCode);
  if (resolved === loc.countryCode) return loc;
  const target = COUNTRIES[resolved];
  return {
    ...loc,
    countryCode: resolved,
    countryName: target.name,
    city: target.defaultCoordinates.city,
    latitude: target.defaultCoordinates.lat,
    longitude: target.defaultCoordinates.lng,
    isGps: false,
    locationKind: loc.locationKind === "manual" ? "manual" : "default",
  };
}

export function useUserLocation(): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    // Prefer saved market when it has feeds; otherwise primary live catalogue (RO).
    const initial =
      (typeof window !== "undefined" && readStoredMarketCountry()) ||
      getPrimaryLiveBrowseCountry();
    return locationFromCountry(initial, "default");
  });

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
      // IP geo to CH must not wipe the RO catalogue — only lock live markets.
      const browseLoc = browseLocationFromDetected(loc);
      setUserLocation(browseLoc);
      if (browseLoc.countryCode !== loc.countryCode) {
        // Persist the live fallback so SSR/category pages stay aligned.
        writeStoredMarketCountry(browseLoc.countryCode);
      }
      setErrorMessage(null);
    } catch (error) {
      // Prefer last known / primary-live market — never invent CH on geo failure.
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
      const resolved = resolveBrowseCountry(stored);
      marketLockedRef.current = true;
      // Migrate stale empty-market cookies (e.g. CH) to the live primary market.
      writeStoredMarketCountry(resolved);
      setUserLocation(locationFromCountry(resolved, "manual"));
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
    // Manual picker: still coerce empty markets to a live catalogue so the grid
    // never goes blank after audit "CH cookie = 0 products" regressions.
    const resolved = resolveBrowseCountry(countryCode);
    writeStoredMarketCountry(resolved);
    setErrorMessage(null);
    setUserLocation(locationFromCountry(resolved, "manual"));
  }, []);

  // GPS only on explicit user action and with Location consent.
  // Explicit GPS may update market; still persists a live browse country.
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
      const browseLoc = browseLocationFromDetected(loc);
      writeStoredMarketCountry(browseLoc.countryCode);
      setUserLocation(browseLoc);
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
          const browseLoc = browseLocationFromDetected(ipLoc);
          writeStoredMarketCountry(browseLoc.countryCode);
          setUserLocation(browseLoc);
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
