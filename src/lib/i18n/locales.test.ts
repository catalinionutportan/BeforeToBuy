import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultLocaleFromCountry,
  normalizeLocale,
  pickLocaleString,
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

test("pickLocaleString falls back to English then fallback", () => {
  assert.equal(
    pickLocaleString({ en: "Computers", de: "Computer" }, "it", "fallback"),
    "Computers"
  );
  assert.equal(pickLocaleString(undefined, "de", "fallback"), "fallback");
});
