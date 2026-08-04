import { CountryCode, PhysicalStoreBranch, Product, UserLocation } from "@/types";
import { COUNTRIES } from "./countries";
import { calculateHaversineDistance } from "./geolocation";

// Physical store branches database across countries for Click & Collect
const STORE_BRANCHES: Record<CountryCode, PhysicalStoreBranch[]> = {
  CH: [
    {
      id: "ch-digitec-zh",
      storeName: "Digitec",
      branchName: "Zürich Europaallee",
      address: "Pfingstweidstrasse 60, 8005 Zürich",
      city: "Zürich",
      latitude: 47.3892,
      longitude: 8.5175,
      stockStatus: "In Stock",
    },
    {
      id: "ch-mediamarkt-zh",
      storeName: "MediaMarkt CH",
      branchName: "Sihlcity Zürich",
      address: "Kalanderplatz 1, 8045 Zürich",
      city: "Zürich",
      latitude: 47.3581,
      longitude: 8.5233,
      stockStatus: "In Stock",
    },
    {
      id: "ch-brack-mew",
      storeName: "Brack.ch",
      branchName: "Mägenwil Hub",
      address: "Hintermättlistrasse 3, 5506 Mägenwil",
      city: "Mägenwil",
      latitude: 47.4111,
      longitude: 8.2322,
      stockStatus: "In Stock",
    },
    {
      id: "ch-microspot-bs",
      storeName: "Microspot.ch",
      branchName: "Basel Central",
      address: "Freie Strasse 44, 4051 Basel",
      city: "Basel",
      latitude: 47.556,
      longitude: 7.5898,
      stockStatus: "Pickup Today",
    },
    {
      id: "ch-galaxus-ge",
      storeName: "Galaxus.ch",
      branchName: "Genève Plainpalais",
      address: "Rue de Carouge 18, 1205 Genève",
      city: "Genève",
      latitude: 46.196,
      longitude: 6.1422,
      stockStatus: "In Stock",
    },
  ],
  DE: [
    {
      id: "de-mediamarkt-ber",
      storeName: "MediaMarkt DE",
      branchName: "Berlin Alexanderplatz",
      address: "Grunerstraße 20, 10179 Berlin",
      city: "Berlin",
      latitude: 52.5218,
      longitude: 13.4132,
      stockStatus: "In Stock",
    },
    {
      id: "de-saturn-muc",
      storeName: "Saturn.de",
      branchName: "München Theresienhöhe",
      address: "Schwanthalerstraße 115, 80339 München",
      city: "München",
      latitude: 48.1364,
      longitude: 11.5432,
      stockStatus: "In Stock",
    },
  ],
  FR: [
    {
      id: "fr-fnac-par",
      storeName: "Fnac.com",
      branchName: "Paris Forum des Halles",
      address: "1 Rue Pierre Lescot, 75001 Paris",
      city: "Paris",
      latitude: 48.8619,
      longitude: 2.347,
      stockStatus: "In Stock",
    },
    {
      id: "fr-darty-lyon",
      storeName: "Darty",
      branchName: "Lyon Part-Dieu",
      address: "17 Rue Dr Bouchut, 69003 Lyon",
      city: "Lyon",
      latitude: 45.7606,
      longitude: 4.8594,
      stockStatus: "Pickup Today",
    },
  ],
  RO: [
    {
      id: "ro-altex-buc",
      storeName: "Altex.ro",
      branchName: "București Unirea Shopping Center",
      address: "Piața Unirii 1, București",
      city: "București",
      latitude: 44.4275,
      longitude: 26.1033,
      stockStatus: "In Stock",
    },
    {
      id: "ro-emag-cluj",
      storeName: "eMAG.ro",
      branchName: "Showroom eMAG Cluj-Napoca",
      address: "Calea Florești 56, Cluj-Napoca",
      city: "Cluj-Napoca",
      latitude: 46.7588,
      longitude: 23.5511,
      stockStatus: "In Stock",
    },
  ],
  GB: [
    {
      id: "gb-currys-lon",
      storeName: "Currys",
      branchName: "London Oxford Street",
      address: "145 Oxford St, London W1D 2JD",
      city: "London",
      latitude: 51.5152,
      longitude: -0.136,
      stockStatus: "In Stock",
    },
    {
      id: "gb-argos-manc",
      storeName: "Argos",
      branchName: "Manchester Arndale",
      address: "Arndale Centre, Manchester M4 3AQ",
      city: "Manchester",
      latitude: 53.4839,
      longitude: -2.2415,
      stockStatus: "Pickup Today",
    },
  ],
  US: [
    {
      id: "us-bestbuy-ny",
      storeName: "Best Buy",
      branchName: "New York Union Square",
      address: "1 Union Sq S, New York, NY 10003",
      city: "New York",
      latitude: 40.735,
      longitude: -73.991,
      stockStatus: "In Stock",
    },
    {
      id: "us-target-chi",
      storeName: "Target",
      branchName: "Chicago Loop",
      address: "1 S State St, Chicago, IL 60603",
      city: "Chicago",
      latitude: 41.8818,
      longitude: -87.6278,
      stockStatus: "In Stock",
    },
  ],
};

// Base database of multi-country products
const BASE_PRODUCTS_DB: Product[] = [
  {
    id: "prod-iphone-16-pro",
    title: "Apple iPhone 16 Pro 256GB Natural Titanium",
    description: "Latest Apple flagship phone with A18 Pro chip, 48MP Fusion camera, and Titanium design.",
    category: "electronics",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 1420,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [], // Filled dynamically per country
  },
  {
    id: "prod-macbook-air-m3",
    title: 'Apple MacBook Air 15" M3 16GB / 512GB SSD Space Grey',
    description: "Supercharged by M3, extraordinarily thin laptop with up to 18 hours battery life.",
    category: "electronics",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 890,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
  {
    id: "prod-sony-wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise canceling with two processors and 8 microphones.",
    category: "electronics",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviewsCount: 2310,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
  {
    id: "prod-dyson-v15",
    title: "Dyson V15 Detect Absolute Cordless Vacuum Cleaner",
    description: "Most powerful, intelligent cordless vacuum with laser illumination.",
    category: "home",
    brand: "Dyson",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviewsCount: 750,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
  {
    id: "prod-samsung-s24-ultra",
    title: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
    description: "Galaxy AI powered smartphone with 200MP camera and built-in S Pen.",
    category: "electronics",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 1120,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
  {
    id: "prod-delonghi-magnifica",
    title: "De'Longhi Magnifica S Automatic Espresso Coffee Machine",
    description: "Bean-to-cup espresso and cappuccino machine with manual milk frother.",
    category: "home",
    brand: "De'Longhi",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviewsCount: 3410,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
  {
    id: "prod-nike-air-max",
    title: "Nike Air Max 270 Black & White Sneakers",
    description: "Boasts Nike's biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.",
    category: "fashion",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviewsCount: 1890,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
  {
    id: "prod-michelin-tires",
    title: "Michelin Pilot Sport 5 225/45 R17 94Y Summer Tire",
    description: "High performance summer tire designed for longevity and precise steering control.",
    category: "auto",
    brand: "Michelin",
    image: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 420,
    targetCountries: ["CH", "DE", "FR", "RO", "GB", "US"],
    offers: [],
  },
];

/**
 * Generate localized offers dynamically for a given product and user location
 */
function generateOffersForLocation(product: Product, userLocation: UserLocation) {
  const country = userLocation.countryCode;
  const currInfo = COUNTRIES[country] || COUNTRIES.CH;
  const currency = currInfo.currency;

  // Base pricing multipliers per country based on purchasing power & tax
  const countryPriceMultiplier: Record<CountryCode, number> = {
    CH: 1.15, // Higher price in CHF
    DE: 1.0,  // Standard EUR
    FR: 1.02, // EUR
    RO: 4.98, // RON rate approx
    GB: 0.85, // GBP
    US: 1.05, // USD
  };

  const mult = countryPriceMultiplier[country] || 1.0;

  // Base price in base units
  let basePrice = 1000;
  if (product.id.includes("iphone")) basePrice = 1199;
  if (product.id.includes("macbook")) basePrice = 1399;
  if (product.id.includes("sony")) basePrice = 320;
  if (product.id.includes("dyson")) basePrice = 640;
  if (product.id.includes("samsung")) basePrice = 1150;
  if (product.id.includes("delonghi")) basePrice = 380;
  if (product.id.includes("nike")) basePrice = 140;
  if (product.id.includes("michelin")) basePrice = 115;

  const targetPrice = Math.round(basePrice * mult);

  // Get nearby physical stores for this country
  const stores = STORE_BRANCHES[country] || STORE_BRANCHES.CH;

  // Calculate distance for each store from user's GPS
  const storesWithDistance = stores.map((store) => {
    const dist = calculateHaversineDistance(
      userLocation.latitude,
      userLocation.longitude,
      store.latitude,
      store.longitude
    );
    return { ...store, distanceKm: dist };
  }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  const closestStore = storesWithDistance[0];

  // Offers per country
  if (country === "CH") {
    return [
      {
        id: `${product.id}-digitec`,
        storeName: "Digitec.ch",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Pick up in 15 min or Tomorrow",
        deliveryCost: 0,
        purchaseUrl: `https://www.digitec.ch/en/s1/product/${product.id}?partner=geo-shoping-ch`,
        affiliateNetwork: "Galaxus Merchant Network",
        type: "local_pickup" as const,
        nearbyBranch: closestStore ? { ...closestStore, storeName: "Digitec" } : undefined,
        badge: closestStore ? `Closest Store (${closestStore.distanceKm} km away)` : "Local Pick & Collect",
      },
      {
        id: `${product.id}-galaxus`,
        storeName: "Galaxus.ch",
        price: Math.round(targetPrice * 0.98),
        originalPrice: Math.round(targetPrice * 1.05),
        currency,
        inStock: true,
        deliveryTime: "Free Home Delivery Tomorrow",
        deliveryCost: 0,
        purchaseUrl: `https://www.galaxus.ch/en/s1/product/${product.id}?partner=geo-shoping-ch`,
        affiliateNetwork: "Galaxus Partner Program",
        type: "online" as const,
        badge: "Cheapest in Switzerland 🇨🇭",
      },
      {
        id: `${product.id}-brack`,
        storeName: "Brack.ch",
        price: Math.round(targetPrice * 1.01),
        currency,
        inStock: true,
        deliveryTime: "Same-Day Delivery (Ordered by 17:00)",
        deliveryCost: 0,
        purchaseUrl: `https://www.brack.ch/search?q=${encodeURIComponent(product.title)}&tag=geo-ch`,
        affiliateNetwork: "AWIN Switzerland",
        type: "online" as const,
      },
      {
        id: `${product.id}-amazon-de-ch`,
        storeName: "Amazon.de (Delivered to CH)",
        price: Math.round(targetPrice * 0.92),
        currency,
        inStock: true,
        deliveryTime: "2-3 Days (Swiss Customs Cleared)",
        deliveryCost: 9.9,
        purchaseUrl: `https://www.amazon.de/dp/B0EXMPL123?tag=geo-shopping-ch-21`,
        affiliateNetwork: "Amazon Associates DE/CH",
        type: "cross_border" as const,
        badge: "Cross-Border Tax-Free Deal",
      },
    ];
  }

  if (country === "DE") {
    return [
      {
        id: `${product.id}-amazon-de`,
        storeName: "Amazon.de",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Tomorrow with Prime",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.de/dp/B0EXMPL123?tag=geo-shopping-de-21`,
        affiliateNetwork: "Amazon Associates DE",
        type: "online" as const,
        badge: "Bestseller in Germany 🇩🇪",
      },
      {
        id: `${product.id}-mediamarkt-de`,
        storeName: "MediaMarkt DE",
        price: Math.round(targetPrice * 1.02),
        currency,
        inStock: true,
        deliveryTime: "Click & Collect in 30 mins",
        deliveryCost: 0,
        purchaseUrl: `https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN Germany",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Pickup at ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
      {
        id: `${product.id}-otto`,
        storeName: "Otto.de",
        price: Math.round(targetPrice * 0.99),
        currency,
        inStock: true,
        deliveryTime: "2-3 Work Days",
        deliveryCost: 4.95,
        purchaseUrl: `https://www.otto.de/suche/${encodeURIComponent(product.title)}/`,
        affiliateNetwork: "AWIN Germany",
        type: "online" as const,
      },
    ];
  }

  if (country === "FR") {
    return [
      {
        id: `${product.id}-amazon-fr`,
        storeName: "Amazon.fr",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Livraison Demain avec Prime",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.fr/dp/B0EXMPL123?tag=geo-shopping-fr-21`,
        affiliateNetwork: "Amazon Associates FR",
        type: "online" as const,
        badge: "Le Moins Cher en France 🇫🇷",
      },
      {
        id: `${product.id}-fnac`,
        storeName: "Fnac.com",
        price: Math.round(targetPrice * 1.03),
        currency,
        inStock: true,
        deliveryTime: "Retrait 1h en Magasin",
        deliveryCost: 0,
        purchaseUrl: `https://www.fnac.com/SearchResult/ResultList.aspx?SCat=0&Search=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN France",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Retrait ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
      {
        id: `${product.id}-cdiscount`,
        storeName: "Cdiscount",
        price: Math.round(targetPrice * 0.97),
        currency,
        inStock: true,
        deliveryTime: "Livraison 24h",
        deliveryCost: 3.99,
        purchaseUrl: `https://www.cdiscount.com/search/10/${encodeURIComponent(product.title)}.html`,
        affiliateNetwork: "Effinity France",
        type: "online" as const,
      },
    ];
  }

  if (country === "RO") {
    return [
      {
        id: `${product.id}-emag`,
        storeName: "eMAG.ro",
        price: targetPrice,
        originalPrice: Math.round(targetPrice * 1.1),
        currency,
        inStock: true,
        deliveryTime: "Livrare Mâine la Easybox",
        deliveryCost: 9.99,
        purchaseUrl: `https://l.profitshare.ro/l/1234567?url=https://www.emag.ro/search/${encodeURIComponent(product.title)}`,
        affiliateNetwork: "2Performant / Profitshare Romania",
        type: "online" as const,
        badge: "Cel Mai Bun Preț în România 🇷🇴",
      },
      {
        id: `${product.id}-altex`,
        storeName: "Altex.ro",
        price: Math.round(targetPrice * 0.99),
        currency,
        inStock: true,
        deliveryTime: "Ridicare din Magazin în 2 Ore",
        deliveryCost: 0,
        purchaseUrl: `https://altex.ro/cauta/?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "2Performant Romania",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Ridică din ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
      {
        id: `${product.id}-flanco`,
        storeName: "Flanco.ro",
        price: Math.round(targetPrice * 1.02),
        currency,
        inStock: true,
        deliveryTime: "1-2 Zile Lucrătoare",
        deliveryCost: 15,
        purchaseUrl: `https://www.flanco.ro/catalogsearch/result/?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "2Performant Romania",
        type: "online" as const,
      },
    ];
  }

  if (country === "GB") {
    return [
      {
        id: `${product.id}-amazon-uk`,
        storeName: "Amazon.co.uk",
        price: targetPrice,
        currency,
        inStock: true,
        deliveryTime: "Free One-Day Delivery with Prime",
        deliveryCost: 0,
        purchaseUrl: `https://www.amazon.co.uk/dp/B0EXMPL123?tag=geo-shopping-uk-21`,
        affiliateNetwork: "Amazon Associates UK",
        type: "online" as const,
        badge: "Top Deal UK 🇬🇧",
      },
      {
        id: `${product.id}-currys`,
        storeName: "Currys",
        price: Math.round(targetPrice * 1.02),
        currency,
        inStock: true,
        deliveryTime: "Click & Collect in 1 Hour",
        deliveryCost: 0,
        purchaseUrl: `https://www.currys.co.uk/search?q=${encodeURIComponent(product.title)}`,
        affiliateNetwork: "AWIN UK",
        type: "local_pickup" as const,
        nearbyBranch: closestStore,
        badge: closestStore ? `Collect at ${closestStore.branchName} (${closestStore.distanceKm} km)` : undefined,
      },
    ];
  }

  // Fallback / US
  return [
    {
      id: `${product.id}-amazon-us`,
      storeName: "Amazon.com",
      price: targetPrice,
      currency,
      inStock: true,
      deliveryTime: "FREE Prime Delivery",
      deliveryCost: 0,
      purchaseUrl: `https://www.amazon.com/dp/B0EXMPL123?tag=geo-shopping-us-20`,
      affiliateNetwork: "Amazon Associates US",
      type: "online" as const,
      badge: "Best Seller US 🇺🇸",
    },
    {
      id: `${product.id}-bestbuy`,
      storeName: "Best Buy",
      price: Math.round(targetPrice * 1.01),
      currency,
      inStock: true,
      deliveryTime: "Store Pickup Today",
      deliveryCost: 0,
      purchaseUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(product.title)}`,
      affiliateNetwork: "CJ Affiliate US",
      type: "local_pickup" as const,
      nearbyBranch: closestStore,
      badge: closestStore ? `Store Pickup (${closestStore.distanceKm} miles)` : undefined,
    },
  ];
}

/**
 * Main API search & product fetcher by location
 */
export async function fetchProductsForLocation(
  userLocation: UserLocation,
  query?: string,
  category?: string
): Promise<Product[]> {
  // Filter products matching search or category
  let filtered = BASE_PRODUCTS_DB.filter((p) =>
    p.targetCountries.includes(userLocation.countryCode)
  );

  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (query && query.trim() !== "") {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Hydrate each product with dynamic country-specific offers based on GPS
  return filtered.map((prod) => {
    const offers = generateOffersForLocation(prod, userLocation);
    return {
      ...prod,
      offers,
    };
  });
}
