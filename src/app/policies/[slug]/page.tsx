import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LegalDraftNotice } from "@/components/LegalDraftNotice";
import { getLegalCopy } from "@/lib/legal-copy";
import { createPageMetadata } from "@/lib/metadata";
import { getPolicyPage, isPolicySlug, POLICY_SLUGS } from "@/lib/policy-pages";
import { withLangParam } from "@/lib/seo/site-url";
import { resolvePageLocale, type LocaleSearchParams } from "@/lib/server-page-locale";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: LocaleSearchParams;
};

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolvePageLocale(searchParams);
  const legalCopy = getLegalCopy(locale);
  if (!isPolicySlug(slug)) {
    return createPageMetadata({
      title: legalCopy.common.policyFallbackTitle,
      description: legalCopy.common.policyFallbackDescription,
      path: "/policies",
      locale,
    });
  }
  const doc = getPolicyPage(locale, slug);
  return createPageMetadata({
    title: `${doc.title} | BeforeToBuy.com`,
    description: doc.description,
    path: `/policies/${slug}`,
    locale,
  });
}

export default async function PolicyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();
  const locale = await resolvePageLocale(searchParams);
  const legalCopy = getLegalCopy(locale);
  const doc = getPolicyPage(locale, slug);

  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-8">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e85d04]">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {legalCopy.common.policyBadge}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{doc.title}</h1>
          <p className="text-sm text-slate-600">{doc.description}</p>
        </header>

        <LegalDraftNotice />

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          {doc.sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">{section.heading}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          {legalCopy.common.backToLegalHub}{" "}
          <Link href={withLangParam("/legal", locale)} className="font-semibold text-[#e85d04] hover:underline">
            {locale === "de" ? "Rechtszentrale" : locale === "fr" ? "hub juridique" : locale === "it" ? "hub legale" : locale === "ro" ? "centrul legal" : "Legal & Company"}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
