import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_UPDATED_EVENT,
  getConsentPreferences,
  saveConsentPreferences,
} from "@/lib/consent";
import { CONSENT_VERSION } from "@/lib/consent-config";

describe("saveConsentPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ saved: true }), { status: 200 }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("does not write localStorage or fire events when the server save fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "fail" }), { status: 503 }))
    );

    const listener = vi.fn();
    window.addEventListener(CONSENT_UPDATED_EVENT, listener);

    const ok = await saveConsentPreferences({
      affiliate: false,
      analytics: false,
    });

    expect(ok).toBe(false);
    expect(localStorage.getItem("b2b_consent_v4")).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(CONSENT_UPDATED_EVENT, listener);
  });

  it("writes localStorage and fires the update event only after server success", async () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_UPDATED_EVENT, listener);

    const ok = await saveConsentPreferences({
      affiliate: true,
      analytics: false,
    });

    expect(ok).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getConsentPreferences()).toMatchObject({
      affiliate: true,
      analytics: false,
      version: CONSENT_VERSION,
    });
    window.removeEventListener(CONSENT_UPDATED_EVENT, listener);
  });
});
