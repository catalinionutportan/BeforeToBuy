import type { Metadata } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-50 text-slate-900">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
