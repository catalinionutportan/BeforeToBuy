import type { Metadata } from "next";
import { DEFAULT_LOCALE, SITE_LOCALES, type SiteLocale } from "./i18n/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com";

function buildAlternates(path: string, currentLocale: SiteLocale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const canonical = `${SITE_URL}${normalized === "/" ? "" : normalized}` || SITE_URL;

  // Locale is client-side; all hreflang entries point to the same real routes.
  const languages: Record<string, string> = {
    "x-default": canonical,
  };
  for (const locale of SITE_LOCALES) {
    languages[locale] = canonical;
  }

  return {
    canonical,
    languages,
  } satisfies Metadata["alternates"];
}

export function createPageMetadata({
  title,
  description,
  path = "",
  index = true,
  locale: currentLocale = DEFAULT_LOCALE,
}: {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
  locale?: SiteLocale;
}): Metadata {
  const normalized = path.startsWith("/") || path === "" ? path : `/${path}`;
  const url = `${SITE_URL}${normalized}`;

  return {
    title,
    description,
    alternates: buildAlternates(normalized || "/", currentLocale),
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "BeforeToBuy.com",
      type: "website",
      locale: currentLocale === "en" ? "en_US" : `${currentLocale}_${currentLocale.toUpperCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function createCategoryMetadata({
  title,
  description,
  path,
  index = true,
  locale = DEFAULT_LOCALE,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  locale?: SiteLocale;
}): Metadata {
  return createPageMetadata({ title, description, path, index, locale });
}

export const defaultOpenGraph: Metadata["openGraph"] = {
  siteName: "BeforeToBuy.com",
  type: "website",
  locale: "en_US",
  url: SITE_URL,
};
