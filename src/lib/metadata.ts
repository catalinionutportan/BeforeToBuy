import type { Metadata } from "next";
import { DEFAULT_LOCALE, SITE_LOCALES, type SiteLocale } from "./i18n/locales";
import { COMPANY } from "@/lib/company-info";
import { getSiteUrl } from "@/lib/seo/site-url";

const SITE_URL = getSiteUrl();
const BRAND = COMPANY.platformName;
const OG_IMAGE = {
  url: `${SITE_URL}/beforetobuy-logo.png`,
  alt: `${BRAND} — price comparison`,
};

/** Google indexes product URLs; keep the operator name on every title. */
export function brandedTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return BRAND;
  if (/before\s*to\s*buy/i.test(trimmed)) return trimmed;
  return `${trimmed} | ${BRAND}`;
}

function localizedUrl(path: string, locale: SiteLocale): string {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("lang", locale);
  return url.toString();
}

function buildAlternates(path: string, currentLocale: SiteLocale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const defaultUrl = new URL(normalized, SITE_URL).toString();
  const canonical = currentLocale === DEFAULT_LOCALE ? defaultUrl : localizedUrl(normalized, currentLocale);

  const languages: Record<string, string> = {
    "x-default": defaultUrl,
  };
  for (const locale of SITE_LOCALES) {
    languages[locale] = locale === DEFAULT_LOCALE ? defaultUrl : localizedUrl(normalized, locale);
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
  const url = localizedUrl(normalized || "/", currentLocale);
  const pageTitle = brandedTitle(title);

  return {
    title: pageTitle,
    description,
    applicationName: BRAND,
    authors: [{ name: COMPANY.legalName, url: COMPANY.website }],
    creator: COMPANY.legalName,
    publisher: BRAND,
    category: "shopping",
    alternates: buildAlternates(normalized || "/", currentLocale),
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: BRAND,
      type: "website",
      locale: currentLocale === "en" ? "en_US" : `${currentLocale}_${currentLocale.toUpperCase()}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [OG_IMAGE.url],
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
  siteName: BRAND,
  type: "website",
  locale: "en_US",
  url: SITE_URL,
  images: [OG_IMAGE],
};
