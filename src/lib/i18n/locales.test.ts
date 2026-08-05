import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultLocaleFromCountry,
  localesForCountry,
  normalizeLocale,
  pickLocaleString,
  SWISS_UI_LOCALES,
  isSiteLocale, // Added import for isSiteLocale
  SITE_LOCALES // Added import for SITE_LOCALES
} from "./locales";
import { saveBrowseLocalePreference, loadBrowseLocalePreference, clearBrowseLocalePreference } from "./preference"; // Added imports for preference functions

// Mock localStorage for testing preference.ts
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

test("normalizeLocale accepts supported language codes", () => {
  assert.equal(normalizeLocale("DE"), "de");
  assert.equal(normalizeLocale("it"), "it");
  assert.equal(normalizeLocale("xx"), null);
});

test("normalizeLocale handles edge cases", () => {
  assert.equal(normalizeLocale(""), null); // Empty string
  assert.equal(normalizeLocale("   en "), "en"); // Whitespace
  assert.equal(normalizeLocale("En-US"), "en"); // Mixed case with locale
  assert.equal(normalizeLocale("en_GB"), "en"); // Underscore locale
});

test("isSiteLocale correctly identifies supported locales", () => {
  assert.equal(isSiteLocale("en"), true);
  assert.equal(isSiteLocale("de"), true);
  assert.equal(isSiteLocale("fr"), true);
  assert.equal(isSiteLocale("it"), true);
  assert.equal(isSiteLocale("ro"), true);
  assert.equal(isSiteLocale("es"), false);
  assert.equal(isSiteLocale("EN"), false); // Case-sensitive
  assert.equal(isSiteLocale("  en  "), false); // Whitespace
  assert.equal(isSiteLocale("invalid"), false);
  assert.equal(isSiteLocale(null as any), false);
  assert.equal(isSiteLocale(undefined as any), false);
});

test("defaultLocaleFromCountry maps shopping country defaults", () => {
  assert.equal(defaultLocaleFromCountry("CH"), "de");
  assert.equal(defaultLocaleFromCountry("FR"), "fr");
  assert.equal(defaultLocaleFromCountry("RO"), "ro");
  assert.equal(defaultLocaleFromCountry("US"), "en");
  assert.equal(defaultLocaleFromCountry("XX" as any), "en"); // Unknown country should fallback to EN
});

test("Switzerland offers DE/FR/IT/EN without changing country", () => {
  assert.deepEqual([...localesForCountry("CH")], [...SWISS_UI_LOCALES]);
  assert.ok(localesForCountry("CH").includes("fr"));
  assert.ok(localesForCountry("CH").includes("it"));
  assert.ok(!localesForCountry("CH").includes("ro"));
});

test("pickLocaleString falls back to English then fallback", () => {
  const translations = { en: "Computers", de: "Computer" };
  assert.equal(
    pickLocaleString(translations, "it", "fallback"),
    "Computers"
  );
  assert.equal(pickLocaleString(undefined, "de", "fallback"), "fallback");
  assert.equal(pickLocaleString({}, "de", "fallback"), "fallback"); // Empty translations object
  assert.equal(pickLocaleString({ de: "Computer" }, "fr", "fallback"), "fallback"); // No en fallback
  assert.equal(pickLocaleString(translations, "de", ""), "Computer"); // Empty fallback
  assert.equal(pickLocaleString(translations, "fr", undefined as any), "Computers"); // Undefined fallback
});

test("locale preference functions operate correctly", () => {
  localStorageMock.clear();

  // Test saveBrowseLocalePreference
  saveBrowseLocalePreference("fr");
  assert.equal(localStorage.getItem("btb-locale"), "fr");

  // Test loadBrowseLocalePreference
  assert.equal(loadBrowseLocalePreference(), "fr");

  // Test clearBrowseLocalePreference
  clearBrowseLocalePreference();
  assert.equal(localStorage.getItem("btb-locale"), null);

  // Test with invalid locale
  saveBrowseLocalePreference("xx" as any); // Should not save invalid locale
  assert.equal(localStorage.getItem("btb-locale"), null); // Should still be null
});
