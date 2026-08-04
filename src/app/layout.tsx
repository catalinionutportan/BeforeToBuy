import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeforeToBuy.com | Compare Prices & Local GPS Deals Before You Buy",
  description:
    "BeforeToBuy.com - Free multi-country price comparison engine. Check local Click & Collect stock, flash deals and online prices in Switzerland, Germany, France, Romania, UK, and USA before you buy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
