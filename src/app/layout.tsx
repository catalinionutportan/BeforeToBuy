import type { Metadata } from "next";
import "./globals.css";
import { BetaDemoBanner } from "@/components/BetaDemoBanner";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { defaultOpenGraph } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "BeforeToBuy.com | Compare Prices & Local GPS Deals Before You Buy",
  description:
    "BeforeToBuy.com - Free multi-country price comparison engine. Check local Click & Collect stock, flash deals and online prices in Switzerland, Germany, France, Romania, UK, and USA before you buy.",
  metadataBase: new URL("https://www.beforetobuy.com"),
  keywords: [
    "price comparison",
    "Switzerland price compare",
    "Digitec Galaxus deals",
    "Amazon deals",
    "Click and Collect nearby",
    "BeforeToBuy",
    "PortanX",
    "Gutscheine Schweiz",
  ],
  authors: [{ name: "PortanX - Catalin Portan", url: "https://portanx.com" }],
  openGraph: {
    ...defaultOpenGraph,
    title: "BeforeToBuy.com | Compare Prices Before You Buy",
    description:
      "Free multi-country price comparison in Beta/Demo. Explore illustrative deals and Click & Collect distances in Switzerland, Germany, France, Romania, UK, and USA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeforeToBuy.com | Compare Prices Before You Buy",
    description:
      "Free multi-country price comparison in Beta/Demo across Switzerland, Germany, France, Romania, UK, and USA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <BetaDemoBanner />
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
