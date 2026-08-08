import { Product, Offer, UserLocation } from "@/types";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";

// This function will eventually call the Amazon PA-API
// For now, it will return mock data based on existing product info
export async function fetchAmazonOffers(product: Product, userLocation: UserLocation): Promise<Offer[]> {
  // TODO: Implement actual Amazon PA-API call here
  // For now, returning a mock Amazon offer
  const countryCode = userLocation.countryCode;
  const currInfo = COUNTRIES[countryCode] || COUNTRIES[DEFAULT_COUNTRY];
  const currency = currInfo.currency;

  const targetPrice = Math.round(product.basePrice || 350);

  if (countryCode === "DE") {
    return [
      {
        id: `${product.id}-amazon-de`,
        storeName: "Amazon.de",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "See merchant checkout",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.de/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates DE (planned)",
        type: "online" as const,
        badge: "Example listing",
        source: "production-live" as const,
      },
    ];
  }

  if (countryCode === "FR") {
    return [
      {
        id: `${product.id}-amazon-fr`,
        storeName: "Amazon.fr",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Voir le checkout marchand",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.fr/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates FR (planned)",
        type: "online" as const,
        badge: "Example listing",
        source: "production-live" as const,
      },
    ];
  }

  if (countryCode === "GB") {
    return [
      {
        id: `${product.id}-amazon-uk`,
        storeName: "Amazon.co.uk",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "See merchant checkout",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.co.uk/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates UK (planned)",
        type: "online" as const,
        badge: "Example listing",
        source: "production-live" as const,
      },
    ];
  }

  if (countryCode === "US") {
    return [
      {
        id: `${product.id}-amazon-us`,
        storeName: "Amazon.com",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "See merchant checkout",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.com/s?k=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "Amazon Associates US (planned)",
        type: "online" as const,
        badge: "Example listing",
        source: "production-live" as const,
      },
    ];
  }

  return [];
}
