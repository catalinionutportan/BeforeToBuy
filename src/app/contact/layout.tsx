import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { HOME_UI } from "@/lib/i18n/ui";
import { resolvePageLocale } from "@/lib/server-page-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePageLocale();
  const ui = HOME_UI[locale];
  return createPageMetadata({ title: ui.contactMetaTitle, description: ui.contactMetaDescription, path: "/contact", locale });
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
