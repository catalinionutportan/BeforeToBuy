"use client";

import { useEffect, useRef, useState } from "react";
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
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [promptMode, setPromptMode] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncVisibility = () => {
      const preferences = getConsentPreferences();
      setLocationConsent(preferences?.location ?? false);
      setAffiliateConsent(preferences?.affiliate ?? false);
      setAnalyticsConsent(preferences?.analytics ?? false);
      setIsVisible(!preferences);
      setPromptMode(false);
    };

    syncVisibility();
    const timer = setTimeout(syncVisibility, 800);

    const openHandler = () => {
      const preferences = getConsentPreferences();
      setLocationConsent(preferences?.location ?? false);
      setAffiliateConsent(preferences?.affiliate ?? false);
      setAnalyticsConsent(preferences?.analytics ?? false);
      setSaveError(null);
      setShowDetails(true);
      setPromptMode(true);
      setIsVisible(true);
    };
    window.addEventListener("b2b-consent-open", openHandler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("b2b-consent-open", openHandler);
    };
  }, []);

  const saveAndClose = async (save: () => Promise<boolean>) => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await save();
      if (saved) {
        setIsVisible(false);
        setPromptMode(false);
      } else {
        setSaveError(homeUi.unableToSavePreferences);
      }
    } catch {
      setSaveError(homeUi.unableToSavePreferences);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptAll = () => saveAndClose(acceptAllConsent);
  const handleEssentialOnly = () => saveAndClose(acceptEssentialConsent);
  const handleSavePreferences = () =>
    saveAndClose(() =>
      saveConsentPreferences({
        location: locationConsent,
        affiliate: affiliateConsent,
        analytics: analyticsConsent,
      })
    );

  useEffect(() => {
    if (isVisible) dialogRef.current?.focus();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isSaving) return;
      // Re-opened from a store click: dismiss without wiping affiliate prefs.
      if (promptMode || getConsentPreferences()) {
        setIsVisible(false);
        setPromptMode(false);
        return;
      }
      void handleEssentialOnly();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isSaving, promptMode]);

  if (!isVisible) return null;

  return (
    <div
      className={
        promptMode
          ? "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/55 p-3 sm:p-4"
          : "fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 pointer-events-none"
      }
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal={promptMode ? "true" : "false"}
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        tabIndex={-1}
        className="pointer-events-auto mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-2xl focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3 p-4 pb-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" aria-hidden="true" />
            </div>
            <h4 id="cookie-consent-title" className="font-bold text-sm text-white break-words min-w-0">
              {promptMode ? homeUi.enableAffiliateToOpen : homeUi.cookiePrivacyPreferences}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              if (promptMode || getConsentPreferences()) {
                setIsVisible(false);
                setPromptMode(false);
                return;
              }
              void handleEssentialOnly();
            }}
            disabled={isSaving}
            aria-label={homeUi.closeAndAcceptEssential}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p
          id="cookie-consent-description"
          className={`px-4 text-xs text-slate-300 leading-relaxed ${showDetails ? "mb-3" : "mb-2 line-clamp-2"}`}
        >
          {homeUi.essentialLocalStorageDescription}
        </p>

        {showDetails && (
          <div className="px-4 text-[11px] space-y-2 mb-3 max-h-[28vh] overflow-y-auto">
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
            <label className="rounded-lg border border-slate-700 bg-slate-800/70 p-2.5 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(event) => setAnalyticsConsent(event.target.checked)}
                className="mt-0.5 accent-emerald-500"
              />
              <span>
                <strong className="text-slate-200">{homeUi.analytics}</strong>
                <span className="text-slate-400">{homeUi.analyticsDescription}</span>
              </span>
            </label>
          </div>
        )}

        {!showDetails && (
          <div className="px-4 mb-2">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-[11px] text-emerald-400 underline underline-offset-2"
            >
              {homeUi.cookiePrivacyPreferences}
            </button>
          </div>
        )}

        {saveError && (
          <p role="alert" className="px-4 text-[11px] text-red-300 mb-2">
            {saveError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 p-4 pt-1 text-xs sm:grid-cols-3">
          <button
            type="button"
            onClick={handleAcceptAll}
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center"
          >
            {homeUi.acceptAll}
          </button>
          {showDetails && (
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center"
            >
              {homeUi.saveSelection}
            </button>
          )}
          <button
            type="button"
            onClick={handleEssentialOnly}
            disabled={isSaving}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-300 font-semibold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center border border-slate-700"
          >
            {homeUi.essentialOnly}
          </button>
        </div>

        <div className="px-4 pb-3 text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
          <Link href="/cookies" className="hover:text-emerald-400 underline break-words">
            {homeUi.cookiePolicy}
          </Link>
          <Link href="/privacy" className="hover:text-emerald-400 underline break-words">
            {homeUi.privacyPolicy}
          </Link>
          <span className="shrink-0">{homeUi.consentVersion} 3</span>
        </div>
      </div>
    </div>
  );
}
