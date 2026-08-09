import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { resolvePageLocale } from "@/lib/server-page-locale";
import { STATUS_COPY } from "@/lib/i18n/status";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolvePageLocale();
  const copy = STATUS_COPY[locale];
  return createPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/status",
    locale,
  });
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
