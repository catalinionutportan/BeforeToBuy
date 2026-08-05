import type { Metadata } from "next";
import "./globals.css";
import { BetaDemoBanner } from "@/components/BetaDemoBanner";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultOpenGraph } from "@/lib/metadata";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { ClientLocalizationProvider } from "@/components/ClientLocalizationProvider";
import { HOME_UI } from "@/lib/i18n/ui";

export async function generateMetadata({
  params: { locale = DEFAULT_LOCALE },
}: {
  params: { locale: SiteLocale };
}): Promise<Metadata> {
  const ui = HOME_UI[locale];
  const keywords = ui.metaKeywords.split(", ");

  return {
    title: ui.metaTitle,
    description: ui.metaDescription,
    metadataBase: new URL("https://www.beforetobuy.com"),
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
  params: { locale = DEFAULT_LOCALE },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: SiteLocale };
}>) {
  return (
    <html lang={locale}>
      <body className="antialiased font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <ClientLocalizationProvider currentLocale={locale}>
          <BetaDemoBanner />
          <div className="flex-1 flex flex-col">{children}</div>
          <SiteFooter />
          <CookieConsentBanner />
        </ClientLocalizationProvider>
      </body>
    </html>
  );
}
