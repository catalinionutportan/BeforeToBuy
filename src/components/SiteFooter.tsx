"use client";

import Link from "next/link";
import Image from "next/image";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { COMPANY } from "@/lib/company-info";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

export function SiteFooter() {
  const { locale: browseLocale } = useBrowseLocale(DEFAULT_COUNTRY);
  const homeUi = HOME_UI[browseLocale];

  return (
    <footer className="mt-auto bg-[#fafafa] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 sm:items-center sm:text-center">
        <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
          <span className="relative block h-8 w-8 shrink-0">
            <Image
              src="/beforetobuy-mark.png"
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
          </span>
          <div className="leading-tight sm:items-center">
            <p className="text-sm font-extrabold tracking-tight text-slate-900">
              BeforeToBuy — {homeUi.compareBeforeYouBuy}
            </p>
          </div>
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
            <a href={`mailto:${COMPANY.email}`} className="hover:text-[#e85d04]">
              {COMPANY.email}
            </a>
            <span className="mx-1.5 text-slate-300">·</span>
            <a href={COMPANY.phoneHref} className="hover:text-[#e85d04]">
              {COMPANY.phone}
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link
            href="/legal"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-900 shadow-sm transition-colors hover:border-[#e85d04]/50 hover:text-[#e85d04]"
          >
            {homeUi.legalCompanyLink}
          </Link>
          <ManageCookiePreferencesButton />
        </div>
      </div>
    </footer>
  );
}
