import type { Metadata } from "next";
import "./globals.css";
import { BetaDemoBanner } from "@/components/BetaDemoBanner";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { DatadogRum } from "@/components/DatadogRum";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { defaultOpenGraph } from "@/lib/metadata";
import { type SiteLocale } from "@/lib/i18n/locales";
import { ClientLocalizationProvider } from "@/components/ClientLocalizationProvider";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { HOME_UI } from "@/lib/i18n/ui";
import { localeFromCountry } from "@/lib/category-i18n";
import { getRequestMarketCountry } from "@/lib/request-market";

export async function generateMetadata(): Promise<Metadata> {
  const marketCountry = await getRequestMarketCountry();
  const locale: SiteLocale = localeFromCountry(marketCountry);
  const ui = HOME_UI[locale];
  const keywords = ui.metaKeywords.split(", ");
  const ogLocale =
    locale === "en" ? "en_US" : `${locale}_${locale.toUpperCase()}`;

  return {
    title: ui.metaTitle,
    description: ui.metaDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com"),
    keywords: keywords,
    authors: [{ name: "PortanX - Catalin Portan", url: "https://portanx.com" }],
    openGraph: {
      ...defaultOpenGraph,
      title: ui.metaTitle,
      description: ui.metaDescription,
      locale: ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: ui.metaTitle,
      description: ui.metaDescription,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const marketCountry = await getRequestMarketCountry();
  const locale: SiteLocale = localeFromCountry(marketCountry);

  return (
    <html lang={locale}>
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        <ClientLocalizationProvider currentLocale={locale}>
          <ScrollToTopOnNavigate />
          <SiteJsonLd />
          <DatadogRum />
          <BetaDemoBanner />
          {children}
          <SiteFooter />
          <CookieConsentBanner />
        </ClientLocalizationProvider>
      </body>
    </html>
  );
}
