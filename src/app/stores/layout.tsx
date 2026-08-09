import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { HOME_UI } from "@/lib/i18n/ui";
import { resolvePageLocale } from "@/lib/server-page-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePageLocale();
  const ui = HOME_UI[locale];
  return createPageMetadata({ title: ui.storesMetaTitle, description: ui.storesMetaDescription, path: "/stores", locale });
}

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
