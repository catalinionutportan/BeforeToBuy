import type { Metadata } from "next";
import { DEFAULT_LOCALE, SITE_LOCALES, SiteLocale } from "./i18n/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com";

function buildAlternates(path: string, currentLocale: SiteLocale) {
  const alternates: { hrefLang: string; href: string }[] = [];
  
  for (const locale of SITE_LOCALES) {
    const localizedPath = locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
    alternates.push({
      hrefLang: locale,
      href: `${SITE_URL}${localizedPath}`,
    });
  }

  // Add x-default
  alternates.push({
    hrefLang: "x-default",
    href: `${SITE_URL}${path.startsWith(`/${DEFAULT_LOCALE}`) ? path : `/${DEFAULT_LOCALE}${path}`}`,
  });

  return {
    canonical: `${SITE_URL}${path.startsWith(`/${currentLocale}`) ? path : `/${currentLocale}${path}`}`,
    languages: Object.fromEntries(alternates.map(alt => [alt.hrefLang, alt.href])),
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
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: buildAlternates(path, currentLocale),
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "BeforeToBuy.com",
      type: "website",
      locale: `${currentLocale}_${currentLocale.toUpperCase()}`, // e.g., en_US, de_DE, fr_FR
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
  locale: "en_US", // This will now be overridden by createPageMetadata's dynamic locale
  url: SITE_URL,
};
