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
