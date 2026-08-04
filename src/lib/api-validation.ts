export function parseCoordinate(
  value: string | null,
  min: number,
  max: number
): number | null {
  if (value === null) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

export function validateLatLng(lat: string | null, lng: string | null) {
  const latitude = parseCoordinate(lat, -90, 90);
  const longitude = parseCoordinate(lng, -180, 180);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
}
