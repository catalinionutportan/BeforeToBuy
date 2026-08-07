"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { COMPANY } from "@/lib/company-info";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

export function SiteFooter() {
  const { locale: browseLocale } = useBrowseLocale(DEFAULT_COUNTRY);
  const homeUi = HOME_UI[browseLocale];

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-5 text-[11px] text-slate-500 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative block h-7 w-7 shrink-0">
              <Image
                src="/beforetobuy-mark.png"
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-extrabold tracking-tight text-slate-900">BeforeToBuy</p>
              <p className="text-[10px] text-slate-500">{homeUi.compareBeforeYouBuy}</p>
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            {formatUi(homeUi.portanxProductLine, { companyTradeName: COMPANY.tradeName })}
          </p>

          <div className="space-y-0.5 text-[11px] leading-relaxed text-slate-600">
            <p className="font-semibold text-slate-800">{COMPANY.legalName}</p>
            <p>{COMPANY.address.formattedDe}</p>
            <p>
              <span className="text-slate-400">UID</span> {COMPANY.uid}
              <span className="text-slate-300"> · </span>
              <span className="text-slate-400">HR</span> {COMPANY.hrNumber}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5">
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
              >
                <Mail className="h-3 w-3 text-slate-400" aria-hidden="true" />
                {COMPANY.email}
              </a>
              <a
                href={COMPANY.phoneHref}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
              >
                <Phone className="h-3 w-3 text-slate-400" aria-hidden="true" />
                {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <Link href="/legal" className="font-semibold text-slate-800 hover:text-slate-950">
              Legal
            </Link>
            <Link href="/help" className="text-slate-500 hover:text-slate-800">
              {homeUi.helpFAQ}
            </Link>
            <Link href="/contact" className="text-slate-500 hover:text-slate-800">
              {homeUi.contact}
            </Link>
            <span className="text-slate-500 [&_button]:text-[11px] [&_button]:text-slate-500 [&_svg]:h-3 [&_svg]:w-3">
              <ManageCookiePreferencesButton />
            </span>
          </nav>
          <p className="text-[10px] text-slate-400">
            {formatUi(homeUi.allRightsReserved, {
              year: new Date().getFullYear(),
              companyPlatformName: COMPANY.platformName,
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
