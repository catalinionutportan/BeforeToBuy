import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact & Support | BeforeToBuy.com",
  description:
    "Contact BeforeToBuy.com and PortanX for user feedback, affiliate partnerships, merchant feed integration, or privacy requests.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
