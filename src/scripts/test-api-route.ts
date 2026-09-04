import { fetchMergedProductsForLocation } from "../lib/product-service";
import { COUNTRIES } from "../lib/countries";
import type { CountryCode, UserLocation } from "../types";

function buildUserLocation(countryCode: CountryCode): UserLocation {
  const meta = COUNTRIES[countryCode] ?? COUNTRIES.CH;
  return {
    countryCode,
    countryName: meta.name,
  };
}

async function main() {
  console.log("Testing DE fetchMergedProductsForLocation...");
  const locDE = buildUserLocation("DE");
  const resDE = await fetchMergedProductsForLocation(locDE, undefined, undefined, "ro", { limit: 12, offset: 0, compact: true });
  console.log(`DE Result: ${resDE.products.length} products returned, feedProductCount: ${resDE.meta.feedProductCount}`);
  if (resDE.products[0]) {
    console.log("Sample DE Product:", {
      id: resDE.products[0].id,
      title: resDE.products[0].title,
      category: resDE.products[0].category,
      image: resDE.products[0].image,
      offers: resDE.products[0].offers.length,
    });
  }

  console.log("\nTesting RO fetchMergedProductsForLocation...");
  const locRO = buildUserLocation("RO");
  const resRO = await fetchMergedProductsForLocation(locRO, undefined, undefined, "ro", { limit: 12, offset: 0, compact: true });
  console.log(`RO Result: ${resRO.products.length} products returned, feedProductCount: ${resRO.meta.feedProductCount}`);
  if (resRO.products[0]) {
    console.log("Sample RO Product:", {
      id: resRO.products[0].id,
      title: resRO.products[0].title,
      category: resRO.products[0].category,
      image: resRO.products[0].image,
      offers: resRO.products[0].offers.length,
    });
  }
}

main().catch(console.error);
