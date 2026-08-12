import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { DatadogRum } from "@/components/DatadogRum";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { createPageMetadata, defaultOpenGraph } from "@/lib/metadata";
import { ClientLocalizationProvider } from "@/components/ClientLocalizationProvider";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { InstantProductModalHost } from "@/components/InstantProductModalHost";
import { HOME_UI } from "@/lib/i18n/ui";
import { getRequestMarketCountry } from "@/lib/request-market";
import { resolvePageLocale } from "@/lib/server-page-locale";
import { Providers } from "@/components/Providers";
import { CompareBar } from "@/components/CompareBar";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePageLocale();
  const ui = HOME_UI[locale];
  const keywords = ui.metaKeywords.split(", ");
  const ogLocale = { en: "en_US", de: "de_DE", fr: "fr_FR", it: "it_IT", ro: "ro_RO" }[locale];
  const localizedMetadata = createPageMetadata({
    title: ui.metaTitle,
    description: ui.metaDescription,
    path: "/",
    locale,
  });

  return {
    ...localizedMetadata,
    title: ui.metaTitle,
    description: ui.metaDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.beforetobuy.com"),
    keywords: keywords,
    authors: [{ name: "PortanX - Catalin Portan", url: "https://portanx.com" }],
    verification: {
      google: "JWeHEz4HeyeNdCaIJdtL-jH-Sr-lBjyXOE7Dt7pOJ4g",
    },
    openGraph: {
      ...defaultOpenGraph,
      ...localizedMetadata.openGraph,
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
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const marketCountry = await getRequestMarketCountry();
  const locale = await resolvePageLocale();
  const skipToContent = {
    en: "Skip to main content",
    de: "Zum Hauptinhalt springen",
    fr: "Aller au contenu principal",
    it: "Vai al contenuto principale",
    ro: "Sari la conținutul principal",
  }[locale];

  return (
    <html lang={locale}>
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-lg bg-slate-950 px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          {skipToContent}
        </a>
        <Providers>
          <ClientLocalizationProvider currentCountry={marketCountry} currentLocale={locale}>
            <ScrollToTopOnNavigate />
            <SiteJsonLd />
            <DatadogRum />
            {children}
            {modal}
            <InstantProductModalHost />
            <SiteFooter />
            <CookieConsentBanner />
            <CompareBar />
          </ClientLocalizationProvider>
        </Providers>
      </body>
    </html>
  );
}
