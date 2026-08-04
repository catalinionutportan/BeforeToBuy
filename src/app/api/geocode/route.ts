import { NextResponse } from "next/server";
import { CountryCode } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({
      countryCode: DEFAULT_COUNTRY,
      countryName: COUNTRIES[DEFAULT_COUNTRY].name,
      city: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.city,
    });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "BeforeToBuy/1.0 (admin@portanx.com)",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const code = (data.address?.country_code?.toUpperCase() || "CH") as CountryCode;
      const validCode: CountryCode = COUNTRIES[code] ? code : DEFAULT_COUNTRY;
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state ||
        COUNTRIES[validCode].defaultCoordinates.city;

      return NextResponse.json({
        countryCode: validCode,
        countryName: COUNTRIES[validCode].name,
        city,
      });
    }
  } catch (err) {
    console.warn("Reverse geocode server-side failed:", err);
  }

  return NextResponse.json({
    countryCode: DEFAULT_COUNTRY,
    countryName: COUNTRIES[DEFAULT_COUNTRY].name,
    city: COUNTRIES[DEFAULT_COUNTRY].defaultCoordinates.city,
  });
}
