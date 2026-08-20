import { describe, expect, it, afterEach, vi } from "vitest";
import { mapIubendaPurposes, openIubendaPreferences, readIubendaConsent } from "./iubenda-consent";

describe("mapIubendaPurposes", () => {
  it("maps measurement to analytics and ads to affiliate", () => {
    expect(mapIubendaPurposes({ 1: true, 4: true, 5: false })).toEqual({
      analytics: true,
      affiliate: false,
    });
    expect(mapIubendaPurposes({ 4: false, 5: true })).toEqual({
      analytics: false,
      affiliate: true,
    });
  });

  it("returns null without a purpose map", () => {
    expect(mapIubendaPurposes(undefined)).toBeNull();
  });
});

describe("readIubendaConsent", () => {
  afterEach(() => {
    delete window._iub;
  });

  it("treats consent-not-needed as granted", () => {
    window._iub = { cs: { api: { isConsentNeeded: () => false } } };
    expect(readIubendaConsent()).toEqual({ affiliate: true, analytics: true });
  });

  it("maps reject-all to both off", () => {
    window._iub = { cs: { api: { isConsentRejected: () => true } } };
    expect(readIubendaConsent()).toEqual({ affiliate: false, analytics: false });
  });
});

describe("openIubendaPreferences", () => {
  afterEach(() => {
    delete window._iub;
  });

  it("returns false when the Cookie Solution API is missing", () => {
    expect(openIubendaPreferences()).toBe(false);
  });

  it("opens the iubenda panel when the API exists", () => {
    const openPreferences = vi.fn();
    window._iub = { cs: { api: { openPreferences } } };
    expect(openIubendaPreferences()).toBe(true);
    expect(openPreferences).toHaveBeenCalledOnce();
  });
});
