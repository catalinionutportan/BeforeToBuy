import { describe, it, expect, vi } from 'vitest';
import { fetchProductsForLocation } from './api-aggregator';

const FASHION_DEMO_IDS = [
  "prod-nike-air-max",
  "prod-adidas-ultraboost",
  "prod-on-cloud5",
  "prod-salomon-speedcross6",
  "prod-birkenstock-arizona",
  "prod-rayban-wayfarer",
  "prod-northface-nuptse",
  "prod-fjallraven-kanken",
];

describe('Fashion Aggregator Logic', () => {
  it("fashion and shoes demo products are excluded from CH catalog", async () => {
    const chProducts = await fetchProductsForLocation({
      latitude: 47.3769,
      longitude: 8.5417,
      countryCode: "CH",
      countryName: "Switzerland",
      city: "Zurich",
      isGps: false,
    });

    const chIds = new Set(chProducts.map((product) => product.id));
    for (const id of FASHION_DEMO_IDS) {
      expect(chIds.has(id)).toBe(false);
    }
  });

  it("fashion demo products remain available outside CH", async () => {
    const deProducts = await fetchProductsForLocation({
      latitude: 52.52,
      longitude: 13.405,
      countryCode: "DE",
      countryName: "Germany",
      city: "Berlin",
      isGps: false,
    });

    const deIds = new Set(deProducts.map((product) => product.id));
    expect(deIds.has("prod-nike-air-max")).toBe(true);
  });
});