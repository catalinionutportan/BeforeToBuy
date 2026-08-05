"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import {
  acceptAllConsent,
  acceptEssentialConsent,
  getConsentPreferences,
  saveConsentPreferences,
} from "@/lib/consent";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { HOME_UI } from "@/lib/i18n/ui";

export function CookieConsentBanner() {
  const { locale: browseLocale } = useBrowseLocale(DEFAULT_COUNTRY);
  const homeUi = HOME_UI[browseLocale];

  const [isVisible, setIsVisible] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [affiliateConsent, setAffiliateConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const syncVisibility = () => {
      const preferences = getConsentPreferences();
      setLocationConsent(preferences?.location ?? false);
      setAffiliateConsent(preferences?.affiliate ?? false);
      setIsVisible(!preferences);
    };

    syncVisibility();
    const timer = setTimeout(syncVisibility, 800);

    const openHandler = () => {
      const preferences = getConsentPreferences();
      setLocationConsent(preferences?.location ?? false);
      setAffiliateConsent(preferences?.affiliate ?? false);
      setSaveError(null);
      setIsVisible(true);
    };
    window.addEventListener("b2b-consent-open", openHandler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("b2b-consent-open", openHandler);
    };
  }, []);

  const saveAndClose = async (save: () => Promise<boolean>) => {
    setIsSaving(true);
    setSaveError(null);
    const saved = await save();
    setIsSaving(false);
    if (saved) {
      setIsVisible(false);
    } else {
      setSaveError(homeUi.unableToSavePreferences);
    }
  };

  const handleAcceptAll = () => saveAndClose(acceptAllConsent);
  const handleEssentialOnly = () => saveAndClose(acceptEssentialConsent);
  const handleSavePreferences = () =>
    saveAndClose(() =>
      saveConsentPreferences({
        location: locationConsent,
        affiliate: affiliateConsent,
      })
    );

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-800"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4" aria-hidden="true" />
          </div>
          <h4 id="cookie-consent-title" className="font-bold text-sm text-white">
            {homeUi.cookiePrivacyPreferences}
          </h4>
        </div>
        <button
          type="button"
          onClick={handleEssentialOnly}
          disabled={isSaving}
          aria-label={homeUi.closeAndAcceptEssential}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        {homeUi.essentialLocalStorageDescription}
      </p>

      <div className="text-[11px] space-y-2 mb-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/70 p-2.5">
          <strong className="text-slate-200">{homeUi.essential}</strong>
          <span className="text-slate-400">{homeUi.requiredPreferences}</span>
        </div>
        <label className="rounded-lg border border-slate-700 bg-slate-800/70 p-2.5 flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={locationConsent}
            onChange={(event) => setLocationConsent(event.target.checked)}
            className="mt-0.5 accent-emerald-500"
          />
          <span>
            <strong className="text-slate-200">{homeUi.location}</strong>
            <span className="text-slate-400">{homeUi.locationDescription}</span>
          </span>
        </label>
        <label className="rounded-lg border border-slate-700 bg-slate-800/70 p-2.5 flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={affiliateConsent}
            onChange={(event) => setAffiliateConsent(event.target.checked)}
            className="mt-0.5 accent-emerald-500"
          />
          <span>
            <strong className="text-slate-200">{homeUi.affiliate}</strong>
            <span className="text-slate-400">{homeUi.affiliateDescription}</span>
          </span>
        </label>
      </div>

      {saveError && (
        <p role="alert" className="text-[11px] text-red-300 mb-3">
          {saveError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <button
          type="button"
          onClick={handleAcceptAll}
          disabled={isSaving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-center"
        >
          {homeUi.acceptAll}
        </button>
        <button
          type="button"
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-center"
        >
          {homeUi.saveSelection}
        </button>
        <button
          type="button"
          onClick={handleEssentialOnly}
          disabled={isSaving}
          className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-300 font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer text-center border border-slate-700"
        >
          {homeUi.essentialOnly}
        </button>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 gap-3">
        <Link href="/cookies" className="hover:text-emerald-400 underline">
          {homeUi.cookiePolicy}
        </Link>
        <Link href="/privacy" className="hover:text-emerald-400 underline">
          {homeUi.privacyPolicy}
        </Link>
        <span>{homeUi.consentVersion} 3</span>
      </div>
    </div>
  );
}
