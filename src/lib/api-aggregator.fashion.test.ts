import assert from "node:assert/strict";
import test from "node:test";
import { fetchProductsForLocation } from "./api-aggregator";

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

test("fashion and shoes demo products are excluded from CH catalog", async () => {
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
    assert.equal(chIds.has(id), false, `${id} should not appear in CH`);
  }
});

test("fashion demo products remain available outside CH", async () => {
  const deProducts = await fetchProductsForLocation({
    latitude: 52.52,
    longitude: 13.405,
    countryCode: "DE",
    countryName: "Germany",
    city: "Berlin",
    isGps: false,
  });

  const deIds = new Set(deProducts.map((product) => product.id));
  assert.equal(deIds.has("prod-nike-air-max"), true);
});
