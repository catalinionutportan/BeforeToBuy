"use client";

import type { SiteLocale } from "@/lib/i18n/locales";

/**
 * Pass-through provider for server-rendered locale context.
 * Locale state is owned by useBrowseLocale() in client components.
 */
export function ClientLocalizationProvider({
  children,
}: {
  children: React.ReactNode;
  currentLocale: SiteLocale;
}) {
  return <>{children}</>;
}
