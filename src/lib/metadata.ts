import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com";

const HREFLANG_LOCALES = {
  en: `${SITE_URL}`,
  de: `${SITE_URL}`,
  fr: `${SITE_URL}`,
  ro: `${SITE_URL}`,
  "x-default": `${SITE_URL}`,
} as const;

function buildAlternates(path: string) {
  const url = `${SITE_URL}${path}`;
  return {
    canonical: url,
    languages: Object.fromEntries(
      Object.entries(HREFLANG_LOCALES).map(([locale, base]) => [locale, `${base}${path}`])
    ),
  } satisfies Metadata["alternates"];
}

export function createPageMetadata({
  title,
  description,
  path = "",
  index = true,
}: {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: buildAlternates(path),
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "BeforeToBuy.com",
      type: "website",
      locale: "en_US",
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
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  return createPageMetadata({ title, description, path, index });
}

export const defaultOpenGraph: Metadata["openGraph"] = {
  siteName: "BeforeToBuy.com",
  type: "website",
  locale: "en_US",
  url: SITE_URL,
};
