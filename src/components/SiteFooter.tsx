"use client";

import Link from "next/link";
import Image from "next/image";
import { CompanyEmailLink } from "@/components/CompanyEmailLink";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { COMPANY } from "@/lib/company-info";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";
import { getLegalCompanySections } from "@/lib/legal-copy";
import { withLangParam } from "@/lib/seo/site-url";

export function SiteFooter() {
  const { locale: browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  const legalSections = getLegalCompanySections(browseLocale).filter((section) =>
    ["company", "legal", "commercial"].includes(section.id),
  );

  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-[#fafafa]">
      <div className="w-full px-4 py-7 sm:px-8 lg:px-12">
        <div className="grid w-full gap-7 lg:grid-cols-[minmax(260px,1fr)_minmax(520px,2fr)]">
          <section className="min-w-0 text-left" aria-label="Company">
            <div className="mb-3 flex items-center gap-3">
              <span className="relative block h-8 w-8 shrink-0">
                <Image
                  src="/beforetobuy-mark.png"
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </span>
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                BeforeToBuy — {homeUi.compareBeforeYouBuy}
              </p>
            </div>

            <div className="space-y-1 text-[11px] leading-relaxed text-slate-500">
              <p>
                {formatUi(homeUi.allRightsReserved, {
                  year: new Date().getFullYear(),
                  companyPlatformName: COMPANY.platformName,
                })}
              </p>
              <p className="font-medium text-slate-700">{COMPANY.legalName}, Bern</p>
              <p>
                UID {COMPANY.uid}
                <span className="mx-1.5 text-slate-300">·</span>
                HR {COMPANY.hrNumber}
              </p>
              <p>
                <CompanyEmailLink
                  className="hover:text-[#e85d04]"
                  suppressHydrationWarning
                >
                </CompanyEmailLink>
                <span className="mx-1.5 text-slate-300">·</span>
                <a href={COMPANY.phoneHref} className="hover:text-[#e85d04]">
                  {COMPANY.phone}
                </a>
              </p>
            </div>
          </section>

          <nav aria-label="Legal" className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
            {legalSections.map((section) => (
              <section key={section.id} aria-labelledby={`footer-${section.id}`} className="min-w-0">
                <h2 id={`footer-${section.id}`} className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-900">
                  {section.title}
                </h2>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={withLangParam(item.href, browseLocale)}
                        className="block text-[11px] leading-snug text-slate-500 transition-colors hover:text-[#e85d04]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  {section.id === "legal" && (
                    <li>
                      <ManageCookiePreferencesButton className="inline-flex items-center gap-1.5 text-left text-[11px] leading-snug text-slate-500 transition-colors hover:text-[#e85d04]" />
                    </li>
                  )}
                </ul>
              </section>
            ))}
          </nav>
        </div>
        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
          <Link
            href={withLangParam("/legal", browseLocale)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-bold text-slate-900 shadow-sm transition-colors hover:border-[#e85d04]/50 hover:text-[#e85d04]"
          >
            {homeUi.legalCompanyLink}
          </Link>
        </div>
      </div>
    </footer>
  );
}
