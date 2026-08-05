import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultLocaleFromCountry,
  localesForCountry,
  normalizeLocale,
  pickLocaleString,
  SWISS_UI_LOCALES,
} from "./locales";

test("normalizeLocale accepts supported language codes", () => {
  assert.equal(normalizeLocale("DE"), "de");
  assert.equal(normalizeLocale("it"), "it");
  assert.equal(normalizeLocale("xx"), null);
});

test("defaultLocaleFromCountry maps shopping country defaults", () => {
  assert.equal(defaultLocaleFromCountry("CH"), "de");
  assert.equal(defaultLocaleFromCountry("FR"), "fr");
  assert.equal(defaultLocaleFromCountry("RO"), "ro");
  assert.equal(defaultLocaleFromCountry("US"), "en");
});

test("Switzerland offers DE/FR/IT/EN without changing country", () => {
  assert.deepEqual([...localesForCountry("CH")], [...SWISS_UI_LOCALES]);
  assert.ok(localesForCountry("CH").includes("fr"));
  assert.ok(localesForCountry("CH").includes("it"));
  assert.ok(!localesForCountry("CH").includes("ro"));
});

test("pickLocaleString falls back to English then fallback", () => {
  assert.equal(
    pickLocaleString({ en: "Computers", de: "Computer" }, "it", "fallback"),
    "Computers"
  );
  assert.equal(pickLocaleString(undefined, "de", "fallback"), "fallback");
});
