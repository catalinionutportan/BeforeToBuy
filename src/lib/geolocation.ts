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

/**
 * Reverse geocode latitude and longitude to country code & city via internal API
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ countryCode: CountryCode; countryName: string; city: string }> {
  try {
    const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Reverse geocode failed, fallback to default", err);
  }

  return {
    countryCode: DEFAULT_COUNTRY,
    countryName: COUNTRIES[DEFAULT_COUNTRY].name,
    city: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.city,
  };
}

/**
 * IP-based geolocation fallback via internal API
 */
export async function getLocationFromIp(): Promise<UserLocation> {
  try {
    const res = await fetch("/api/location");
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("IP Geolocation failed:", err);
  }

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
 * Main geolocation detector: Tries GPS first, then IP, then default
 */
export async function detectUserLocation(): Promise<UserLocation> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return await getLocationFromIp();
  }

  return new Promise((resolve) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const geoInfo = await reverseGeocode(lat, lng);

        resolve({
          latitude: lat,
          longitude: lng,
          countryCode: geoInfo.countryCode,
          countryName: geoInfo.countryName,
          city: geoInfo.city,
          isGps: true,
        });
      },
      async (error) => {
        console.warn("GPS Permission denied or timed out:", error.message);
        const ipLocation = await getLocationFromIp();
        resolve(ipLocation);
      },
      options
    );
  });
}
