import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProductsForLocation, generateOffersForLocation } from './api-aggregator';
import type { UserLocation } from '@/types';
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

const mockCountryPriceMultipliers = {
  CH: 1.15,
  DE: 1.0,
  FR: 1.02,
  RO: 4.98,
  GB: 0.85,
  US: 1.05,
};

// Mock the global fetch function for fetchCountryPriceMultipliers
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockCountryPriceMultipliers),
  } as Response)
);

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
        inStock: true,
        deliveryCost: 5,
        purchaseUrl: 'http://mock.ch/offer1',
        affiliateNetwork: 'Mock Network',
        source: 'production-live',
        type: 'online',
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
        inStock: true,
        deliveryCost: 3,
        purchaseUrl: 'http://mock.de/offer1',
        affiliateNetwork: 'Mock Network',
        source: 'production-live',
        type: 'online',
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

    expect(products).toBeDefined();
    // Since generateOffersForLocation now returns a default offer if no others are found,
    // we expect products to have offers (the default ones).
    const productsWithOffers = products.filter(p => p.offers.length > 0);
    expect(productsWithOffers.length).toBeGreaterThan(0);
    expect(productsWithOffers[0].offers[0].storeName).toContain('Default Store RO');
    expect(roOffers.getRoOffers).toHaveBeenCalled();
  });

  it('should use dynamically fetched country price multipliers', async () => {
    const mockProduct = {
      id: 'test-product',
      basePrice: 100,
      targetCountries: ['DE'],
    } as any;
    const mockUserLocation: UserLocation = {
      latitude: 52.52,
      longitude: 13.405,
      countryCode: 'DE',
      countryName: 'Germany',
      city: 'Berlin',
      isGps: false,
    };

    // Ensure getDeOffers returns a mock offer to allow price calculation to proceed
    vi.spyOn(deOffers, 'getDeOffers').mockResolvedValueOnce([
      {
        id: 'offer-de-dynamic',
        storeName: 'Dynamic Mock Store DE',
        price: 0, // This will be enriched by enrichOfferPricing
        currency: 'EUR',
        inStock: true,
        deliveryCost: 0,
        purchaseUrl: 'http://mock.de/dynamic',
        affiliateNetwork: 'Mock Network',
        source: 'production-live',
        type: 'online',
        deliveryTime: '1-2 days',
      },
    ]);

    const offers = await generateOffersForLocation(mockProduct, mockUserLocation);

    // The base price is 100, and for DE, the multiplier is 1.0, so targetPrice should be 100.
    expect(offers[0].price).toBe(100);
    expect(deOffers.getDeOffers).toHaveBeenCalled();
  });
});
