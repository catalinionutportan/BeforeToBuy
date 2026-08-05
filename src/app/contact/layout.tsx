import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { HOME_UI } from "@/lib/i18n/ui";

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.contactMetaTitle,
  description: HOME_UI.en.contactMetaDescription,
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
