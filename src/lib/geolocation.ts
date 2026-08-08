import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES } from "./countries";
import { getPrimaryLiveBrowseCountry } from "@/lib/live-browse-market";

/**
 * Calculates the Haversine distance in kilometers between two GPS points
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

export function defaultLocation(): UserLocation {
  const countryCode = getPrimaryLiveBrowseCountry();
  const def = COUNTRIES[countryCode];
  return {
    latitude: def.defaultCoordinates.lat,
    longitude: def.defaultCoordinates.lng,
    countryCode,
    countryName: def.name,
    city: def.defaultCoordinates.city,
    isGps: false,
    locationKind: "default",
  };
}

/** GeolocationPositionError properties are non-enumerable, so console shows `{}`. */
export function formatLocationError(error: unknown): string {
  if (
    typeof GeolocationPositionError !== "undefined" &&
    error instanceof GeolocationPositionError
  ) {
    const label =
      error.code === error.PERMISSION_DENIED
        ? "PERMISSION_DENIED"
        : error.code === error.POSITION_UNAVAILABLE
          ? "POSITION_UNAVAILABLE"
          : error.code === error.TIMEOUT
            ? "TIMEOUT"
            : `CODE_${error.code}`;
    return `GeolocationPositionError ${label}: ${error.message || "no message"}`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Reverse geocode latitude and longitude to country code & city via internal API
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ countryCode: CountryCode; countryName: string; city: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Reverse geocode API failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Reverse geocode failed:", formatLocationError(err));
    throw new Error("Unable to determine location from coordinates.");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Approximate location from client IP via internal API (requires location consent cookie).
 */
export async function getLocationFromIp(): Promise<UserLocation> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch("/api/location", { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`IP location API failed with status: ${res.status}`);
    }
    const data = (await res.json()) as Partial<UserLocation>;
    if (
      typeof data.latitude !== "number" ||
      typeof data.longitude !== "number" ||
      !data.countryCode
    ) {
      throw new Error("IP location API returned incomplete data");
    }
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      countryCode: data.countryCode,
      countryName: data.countryName || COUNTRIES[data.countryCode]?.name || "Unknown",
      city: data.city || COUNTRIES[data.countryCode]?.defaultCoordinates.city || "Unknown",
      isGps: false,
      locationKind: "ip",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Precise location from browser GPS + reverse geocode.
 * Rejects when the browser cannot obtain coordinates.
 * If coords are available but reverse-geocode fails, still resolves with GPS coords.
 *
 * Uses network/wifi-friendly options first: high-accuracy GPS often times out indoors
 * or on localhost within a few seconds.
 */
export function detectUserLocationGps(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this environment"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const geo = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            city: geo.city,
            isGps: true,
            locationKind: "gps",
          });
        } catch {
          const countryCode = getPrimaryLiveBrowseCountry();
          const fallback = COUNTRIES[countryCode];
          resolve({
            latitude,
            longitude,
            countryCode,
            countryName: fallback.name,
            city: fallback.defaultCoordinates.city,
            isGps: true,
            locationKind: "gps",
          });
        }
      },
      (error) => reject(error),
      {
        // Faster / more reliable on phones indoors and on local HTTP.
        enableHighAccuracy: false,
        timeout: 20_000,
        maximumAge: 5 * 60_000,
      }
    );
  });
}
