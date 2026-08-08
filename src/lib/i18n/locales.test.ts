import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  defaultLocaleFromCountry,
  localesForCountry,
  normalizeLocale,
  pickLocaleString,
  SWISS_UI_LOCALES,
  isSiteLocale,
} from './locales';
import {
  LANG_STORAGE_KEY,
  readStoredLocale,
  writeStoredLocale,
  resolveInitialLocale,
} from './preference';
import type { CountryCode } from '@/types';

describe('Locale Utility Functions', () => {
  beforeEach(() => {
    localStorage.clear();
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
    expect(isSiteLocale(null)).toBe(false);
    expect(isSiteLocale(undefined)).toBe(false);
  });

  it('defaultLocaleFromCountry maps shopping country defaults', () => {
    expect(defaultLocaleFromCountry('CH')).toBe('de');
    expect(defaultLocaleFromCountry('FR')).toBe('fr');
    expect(defaultLocaleFromCountry('RO')).toBe('ro');
    expect(defaultLocaleFromCountry('US')).toBe('en');
    expect(defaultLocaleFromCountry('XX' as unknown as 'CH')).toBe('en');
  });

  it('offers all UI languages for every shopping country', () => {
    expect(localesForCountry('CH')).toContain('ro');
    expect(localesForCountry('CH')).toContain('de');
    expect(localesForCountry('DE')).toContain('ro');
    expect(localesForCountry('RO')).toEqual(expect.arrayContaining([...SWISS_UI_LOCALES, 'ro']));
    expect([...localesForCountry('US')]).toEqual(['en', 'de', 'fr', 'it', 'ro']);
  });

  it('pickLocaleString falls back to English then fallback', () => {
    const translations = { en: 'Computers', de: 'Computer' };
    expect(pickLocaleString(translations, 'it', 'fallback')).toBe('Computers');
    expect(pickLocaleString(undefined, 'de', 'fallback')).toBe('fallback');
    expect(pickLocaleString({}, 'de', 'fallback')).toBe('fallback');
    expect(pickLocaleString({ de: 'Computer' }, 'fr', 'fallback')).toBe('fallback');
    expect(pickLocaleString(translations, 'de', '')).toBe('Computer');
    expect(pickLocaleString(translations, 'fr', '')).toBe('Computers');
  });

  it('locale preference functions operate correctly', () => {
    writeStoredLocale('fr');
    expect(readStoredLocale()).toBe('fr');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('fr');

    localStorage.removeItem(LANG_STORAGE_KEY);
    expect(readStoredLocale()).toBe(null);

    localStorage.setItem(LANG_STORAGE_KEY, 'xx');
    expect(readStoredLocale()).toBe(null);
  });

  it('resolveInitialLocale falls back to country default', () => {
    expect(resolveInitialLocale('FR' as CountryCode)).toEqual({
      locale: 'fr',
      explicit: false,
    });
  });
});