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

function defaultLocation(): UserLocation {
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
 * IP-based geolocation via internal API (requires Location consent)
 */
export async function getLocationFromIp(): Promise<UserLocation> {
  try {
    const res = await fetch("/api/location");
    if (!res.ok) {
      throw new Error(`IP Geolocation API failed with status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("IP Geolocation failed:", err);
    throw new Error("Unable to determine location from IP.");
  }
}

/**
 * GPS-only detection on explicit user action (requires Location consent + browser permission)
 */
export async function detectUserLocationGps(): Promise<UserLocation> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Geolocation is not supported by your browser.");
  }

  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
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
        } catch (error) {
          console.error("Reverse geocode after GPS failed:", error);
          reject(new Error("Unable to process GPS location."));
        }
      },
      (error) => {
        console.warn("GPS Permission denied or timed out:", error.message);
        let userMessage = "Unable to get GPS location.";
        if (error.code === error.PERMISSION_DENIED) {
          userMessage = "GPS permission denied. Please enable location services for this site.";
        } else if (error.code === error.TIMEOUT) {
          userMessage = "GPS location timed out. Please try again.";
        }
        reject(new Error(userMessage));
      },
      options
    );
  });
}

/** @deprecated Use getLocationFromIp or detectUserLocationGps with consent checks */
export async function detectUserLocation(): Promise<UserLocation> {
  return getLocationFromIp();
}
