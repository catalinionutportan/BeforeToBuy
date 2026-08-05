import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  defaultLocaleFromCountry,
  localesForCountry,
  normalizeLocale,
  pickLocaleString,
  SWISS_UI_LOCALES,
  isSiteLocale,
  SITE_LOCALES
} from './locales';

// Mocking the preference module
const mockLocaleStore: Record<string, string> = {};
vi.mock('./preference', () => ({
  saveBrowseLocalePreference: vi.fn((locale: string) => {
    const normalized = normalizeLocale(locale); // Normalize before saving
    if (normalized) {
      mockLocaleStore['btb-locale'] = normalized;
    } else {
      delete mockLocaleStore['btb-locale'];
    }
  }),
  loadBrowseLocalePreference: vi.fn(() => {
    return mockLocaleStore['btb-locale'] || null;
  }),
  clearBrowseLocalePreference: vi.fn(() => {
    delete mockLocaleStore['btb-locale'];
  }),
  // We need to provide a mock for resolveInitialLocale as well, or any other exports used
  resolveInitialLocale: vi.fn((countryCode: CountryCode) => ({ 
    locale: defaultLocaleFromCountry(countryCode), explicit: false
  })),
}));

// Import the mocked functions after the mock is defined
import { saveBrowseLocalePreference, loadBrowseLocalePreference, clearBrowseLocalePreference } from './preference';
import { CountryCode } from '@/types';

describe('Locale Utility Functions', () => {
  // Clear the mock store before each test
  beforeEach(() => {
    mockLocaleStore['btb-locale'] = '';
    vi.clearAllMocks();
  });

  it('normalizeLocale accepts supported language codes', () => {
    expect(normalizeLocale('DE')).toBe('de');
    expect(normalizeLocale('it')).toBe('it');
    expect(normalizeLocale('xx')).toBe(null);
  });

  it('normalizeLocale handles edge cases', () => {
    expect(normalizeLocale('')).toBe(null);
    expect(normalizeLocale('   en ')).toBe('en');
    expect(normalizeLocale('En-US')).toBe('en');
    expect(normalizeLocale('en_GB')).toBe('en');
  });

  it('isSiteLocale correctly identifies supported locales', () => {
    expect(isSiteLocale('en')).toBe(true);
    expect(isSiteLocale('de')).toBe(true);
    expect(isSiteLocale('fr')).toBe(true);
    expect(isSiteLocale('it')).toBe(true);
    expect(isSiteLocale('ro')).toBe(true);
    expect(isSiteLocale('es')).toBe(false);
    expect(isSiteLocale('EN')).toBe(false);
    expect(isSiteLocale('  en  ')).toBe(false);
    expect(isSiteLocale('invalid')).toBe(false);
    expect(isSiteLocale(null as any)).toBe(false);
    expect(isSiteLocale(undefined as any)).toBe(false);
  });

  it('defaultLocaleFromCountry maps shopping country defaults', () => {
    expect(defaultLocaleFromCountry('CH')).toBe('de');
    expect(defaultLocaleFromCountry('FR')).toBe('fr');
    expect(defaultLocaleFromCountry('RO')).toBe('ro');
    expect(defaultLocaleFromCountry('US')).toBe('en');
    expect(defaultLocaleFromCountry('XX' as any)).toBe('en');
  });

  it('Switzerland offers DE/FR/IT/EN without changing country', () => {
    expect([...localesForCountry('CH')]).toEqual([...SWISS_UI_LOCALES]);
    expect(localesForCountry('CH')).toContain('fr');
    expect(localesForCountry('CH')).toContain('it');
    expect(localesForCountry('CH')).not.toContain('ro');
  });

  it('pickLocaleString falls back to English then fallback', () => {
    const translations = { en: 'Computers', de: 'Computer' };
    expect(pickLocaleString(translations, 'it', 'fallback')).toBe('Computers');
    expect(pickLocaleString(undefined, 'de', 'fallback')).toBe('fallback');
    expect(pickLocaleString({}, 'de', 'fallback')).toBe('fallback');
    expect(pickLocaleString({ de: 'Computer' }, 'fr', 'fallback')).toBe('fallback');
    expect(pickLocaleString(translations, 'de', '')).toBe('Computer');
    expect(pickLocaleString(translations, 'fr', undefined as any)).toBe('Computers');
  });

  it('locale preference functions operate correctly', () => {
    saveBrowseLocalePreference('fr');
    expect(loadBrowseLocalePreference()).toBe('fr');
    expect(mockLocaleStore['btb-locale']).toBe('fr');

    clearBrowseLocalePreference();
    expect(loadBrowseLocalePreference()).toBe(null);
    expect(mockLocaleStore['btb-locale']).toBeUndefined();

    saveBrowseLocalePreference('xx' as any); // Should not save invalid locale
    expect(loadBrowseLocalePreference()).toBe(null); // Should still be null
  });
});