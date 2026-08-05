"use client";

import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import type { SiteLocale } from "@/lib/i18n/locales";

export function ClientLocalizationProvider({
  children,
  currentLocale,
}: {
  children: React.ReactNode;
  currentLocale: SiteLocale;
}) {
  const { setBrowseLocale } = useBrowseLocale();

  // Sync the server-rendered locale with the client-side context
  // This ensures that the useBrowseLocale hook returns the correct locale
  // immediately after hydration, avoiding any hydration mismatches.
  setBrowseLocale(currentLocale);

  return <>{children}</>;
}