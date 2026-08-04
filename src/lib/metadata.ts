import type { Metadata } from "next";

const SITE_URL = "https://www.beforetobuy.com";

export function createPageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
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

export const defaultOpenGraph: Metadata["openGraph"] = {
  siteName: "BeforeToBuy.com",
  type: "website",
  locale: "en_US",
  url: SITE_URL,
};
