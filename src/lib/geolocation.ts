import { CountryCode, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "./countries";

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
  const def = COUNTRIES[DEFAULT_COUNTRY];
  return {
    latitude: def.defaultCoordinates.lat,
    longitude: def.defaultCoordinates.lng,
    countryCode: DEFAULT_COUNTRY,
    countryName: def.name,
    city: def.defaultCoordinates.city,
    isGps: false,
  };
}

/**
 * Reverse geocode latitude and longitude to country code & city via internal API
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ countryCode: CountryCode; countryName: string; city: string }> {
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (!res.ok) {
      throw new Error(`Reverse geocode API failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("Reverse geocode failed", err);
    throw new Error("Unable to determine location from coordinates.");
  }
}

/**
 * Approximate location from client IP via internal API (requires location consent cookie).
 */
export async function getLocationFromIp(): Promise<UserLocation> {
  const res = await fetch("/api/location");
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
  };
}

/**
 * Precise location from browser GPS + reverse geocode.
 * Rejects with GeolocationPositionError when the browser geolocation API fails.
 */
export function detectUserLocationGps(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this environment"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geo = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            countryCode: geo.countryCode,
            countryName: geo.countryName,
            city: geo.city,
            isGps: true,
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    );
  });
}
