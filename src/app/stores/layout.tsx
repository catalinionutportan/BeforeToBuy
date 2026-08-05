import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { HOME_UI } from "@/lib/i18n/ui";

export const metadata: Metadata = createPageMetadata({
  title: HOME_UI.en.storesMetaTitle,
  description: HOME_UI.en.storesMetaDescription,
  path: "/stores",
});

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
