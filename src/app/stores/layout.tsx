import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Merchant Stores Directory | BeforeToBuy.com",
  description:
    "Browse partner merchant domains listed on BeforeToBuy.com across Switzerland, Germany, France, Romania, UK, and USA.",
  path: "/stores",
});

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
