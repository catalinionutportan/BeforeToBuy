"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import {
  acceptAllConsent,
  acceptEssentialConsent,
  getConsentPreferences,
  saveConsentPreferences,
} from "@/lib/consent";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { HOME_UI } from "@/lib/i18n/ui";

export function CookieConsentBanner() {
  const { locale: browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];

  const [isVisible, setIsVisible] = useState(false);
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
      setAffiliateConsent(preferences?.affiliate ?? false);
      setAnalyticsConsent(preferences?.analytics ?? false);
      // iubenda Cookie Solution is the primary banner; ours is fallback only.
      setIsVisible(false);
      setPromptMode(false);
    };

    syncVisibility();
    const timer = setTimeout(syncVisibility, 800);
    const fallback = window.setTimeout(() => {
      if (getConsentPreferences()) return;
      if (window._iub?.cs || document.getElementById("iubenda-cs-banner")) return;
      setIsVisible(true);
    }, 3500);

    const openHandler = () => {
      const preferences = getConsentPreferences();
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
      window.clearTimeout(fallback);
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
          ? "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-3 sm:p-4"
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
        className="pointer-events-auto mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg focus:outline-none"
      >
        <div className="flex items-start gap-3 p-4 pb-2 min-w-0">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/beforetobuy-logo-cutout.png"
              alt=""
              width={96}
              height={126}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4
                id="cookie-consent-title"
                className="font-semibold text-sm text-slate-900 break-words min-w-0 pt-1"
              >
                {promptMode ? homeUi.enableAffiliateToOpen : homeUi.cookiePrivacyPreferences}
              </h4>
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
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p
              id="cookie-consent-description"
              className={`mt-1.5 text-xs text-slate-600 leading-relaxed ${showDetails ? "" : "line-clamp-3"}`}
            >
              {homeUi.essentialLocalStorageDescription}
            </p>
          </div>
        </div>

        {showDetails && (
          <div className="px-4 text-[11px] space-y-2 mb-3 max-h-[28vh] overflow-y-auto">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <strong className="text-slate-800">{homeUi.essential}</strong>
              <span className="text-slate-500">{homeUi.requiredPreferences}</span>
            </div>
            <label className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={affiliateConsent}
                onChange={(event) => setAffiliateConsent(event.target.checked)}
                className="mt-0.5 accent-slate-800"
              />
              <span>
                <strong className="text-slate-800">{homeUi.affiliate}</strong>
                <span className="text-slate-500">{homeUi.affiliateDescription}</span>
              </span>
            </label>
            <label className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(event) => setAnalyticsConsent(event.target.checked)}
                className="mt-0.5 accent-slate-800"
              />
              <span>
                <strong className="text-slate-800">{homeUi.analytics}</strong>
                <span className="text-slate-500">{homeUi.analyticsDescription}</span>
              </span>
            </label>
          </div>
        )}

        {!showDetails && (
          <div className="px-4 mb-2 pl-16">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-[11px] text-slate-700 underline underline-offset-2"
            >
              {homeUi.cookiePrivacyPreferences}
            </button>
          </div>
        )}

        {saveError && (
          <p role="alert" className="px-4 text-[11px] text-red-600 mb-2">
            {saveError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 p-4 pt-1 text-xs sm:grid-cols-3">
          <button
            type="button"
            onClick={handleAcceptAll}
            disabled={isSaving}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center"
          >
            {homeUi.acceptAll}
          </button>
          {showDetails && (
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-900 font-semibold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center border border-slate-300"
            >
              {homeUi.saveSelection}
            </button>
          )}
          <button
            type="button"
            onClick={handleEssentialOnly}
            disabled={isSaving}
            className="w-full bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-semibold py-3 px-3 rounded-xl transition-colors cursor-pointer text-center border border-slate-300"
          >
            {homeUi.essentialOnly}
          </button>
        </div>

        <div className="px-4 pb-3 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
          <Link href="/cookies" className="hover:text-slate-800 underline break-words">
            {homeUi.cookiePolicy}
          </Link>
          <Link href="/privacy" className="hover:text-slate-800 underline break-words">
            {homeUi.privacyPolicy}
          </Link>
          <span className="shrink-0">{homeUi.consentVersion} 4</span>
        </div>
      </div>
    </div>
  );
}
