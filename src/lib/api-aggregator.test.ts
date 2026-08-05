import { describe, it, expect, vi } from 'vitest';
import { fetchProductsForLocation } from './api-aggregator';
import * as chOffers from './offers/ch-offers';
import * as deOffers from './offers/de-offers';
import * as frOffers from './offers/fr-offers';
import * as roOffers from './offers/ro-offers';
import * as gbOffers from './offers/gb-offers';
import * as usOffers from './offers/us-offers';

vi.mock('./offers/ch-offers');
vi.mock('./offers/de-offers');
vi.mock('./offers/fr-offers');
vi.mock('./offers/ro-offers');
vi.mock('./offers/gb-offers');
vi.mock('./offers/us-offers');

describe('API Aggregator', () => {
  // Global mocks to ensure all generateOffersForLocation calls return a valid array
  beforeEach(() => {
    vi.spyOn(chOffers, 'getChOffers').mockResolvedValue([]);
    vi.spyOn(deOffers, 'getDeOffers').mockResolvedValue([]);
    vi.spyOn(frOffers, 'getFrOffers').mockResolvedValue([]);
    vi.spyOn(roOffers, 'getRoOffers').mockResolvedValue([]);
    vi.spyOn(gbOffers, 'getGbOffers').mockResolvedValue([]);
    vi.spyOn(usOffers, 'getUsOffers').mockResolvedValue([]);
  });

  it('should fetch products for CH location', async () => {
    // Specific mock for this test case
    vi.spyOn(chOffers, 'getChOffers').mockResolvedValueOnce([
      {
        id: 'offer-ch-1',
        storeName: 'Mock Store CH',
        price: 100,
        currency: 'CHF',
        deliveryCost: 5,
        purchaseUrl: 'http://mock.ch/offer1',
        source: 'production-live',
        type: 'delivery',
        deliveryTime: '2-3 days',
      },
    ]);

    const products = await fetchProductsForLocation({
      latitude: 47.3769,
      longitude: 8.5417,
      countryCode: 'CH',
      countryName: 'Switzerland',
      city: 'Zurich',
      isGps: false,
    });

    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].offers.length).toBeGreaterThan(0);
    expect(products[0].offers[0].currency).toBe('CHF');
    expect(chOffers.getChOffers).toHaveBeenCalled();
  });

  it('should fetch products for DE location', async () => {
    // Specific mock for this test case
    vi.spyOn(deOffers, 'getDeOffers').mockResolvedValueOnce([
      {
        id: 'offer-de-1',
        storeName: 'Mock Store DE',
        price: 90,
        currency: 'EUR',
        deliveryCost: 3,
        purchaseUrl: 'http://mock.de/offer1',
        source: 'production-live',
        type: 'delivery',
        deliveryTime: '1-2 days',
      },
    ]);

    const products = await fetchProductsForLocation({
      latitude: 52.52,
      longitude: 13.405,
      countryCode: 'DE',
      countryName: 'Germany',
      city: 'Berlin',
      isGps: false,
    });

    expect(products).toBeDefined();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].offers.length).toBeGreaterThan(0);
    expect(products[0].offers[0].currency).toBe('EUR');
    expect(deOffers.getDeOffers).toHaveBeenCalled();
  });

  it('should return empty array if no offers are found for location', async () => {
    // The global mocks set in beforeEach will ensure empty arrays are returned
    const products = await fetchProductsForLocation({
      latitude: 47.3769,
      longitude: 8.5417,
      countryCode: 'RO', // Use a country not specifically mocked with offers
      countryName: 'Romania',
      city: 'Bucharest',
      isGps: false,
    });

    // The base products DB will still return products if their targetCountries includes 'RO'
    // But since getRoOffers is mocked to return an empty array globally, product.offers will be empty
    expect(products).toBeDefined();
    // Expect products that match RO target country, but their offers should be empty
    const productsWithOffers = products.filter(p => p.offers.length > 0);
    expect(productsWithOffers.length).toBe(0);
    expect(roOffers.getRoOffers).toHaveBeenCalled();
  });
});
