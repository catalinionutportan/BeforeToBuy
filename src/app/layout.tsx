import type { Metadata } from "next";
import "./globals.css";
import { BetaDemoBanner } from "@/components/BetaDemoBanner";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { DatadogRum } from "@/components/DatadogRum";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { defaultOpenGraph } from "@/lib/metadata";
import { DEFAULT_LOCALE, type SiteLocale } from "@/lib/i18n/locales";
import { ClientLocalizationProvider } from "@/components/ClientLocalizationProvider";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { HOME_UI } from "@/lib/i18n/ui";

export async function generateMetadata(): Promise<Metadata> {
  const locale: SiteLocale = DEFAULT_LOCALE;
  const ui = HOME_UI[locale];
  const keywords = ui.metaKeywords.split(", ");

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
    },
    twitter: {
      card: "summary_large_image",
      title: ui.metaTitle,
      description: ui.metaDescription,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale: SiteLocale = DEFAULT_LOCALE;

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
