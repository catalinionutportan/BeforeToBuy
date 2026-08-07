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
  const linkClass =
    "text-[11px] leading-5 text-slate-300 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded-sm";

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-3.5 text-[11px] text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative block h-6 w-6 shrink-0">
            <Image
              src="/beforetobuy-mark.png"
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[12px] font-extrabold text-white">BeforeToBuy</p>
            <p className="truncate text-[10px] text-slate-500">{homeUi.compareBeforeYouBuy}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-y border-slate-800/80 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <section
            aria-labelledby="footer-portanx"
            className="min-w-0 max-w-[240px] shrink-0 space-y-1.5 text-[10px] leading-4 text-slate-400"
          >
            <p id="footer-portanx" className="text-[11px] font-bold text-white">
              {COMPANY.tradeName}
            </p>
            <p className="text-slate-300">{COMPANY.legalName}</p>
            <p className="text-slate-500">{COMPANY.address.formattedDe}</p>
            <p>
              <span className="text-slate-500">UID</span>{" "}
              <span className="font-mono text-emerald-400/90">{COMPANY.uid}</span>
            </p>
            <p>
              <span className="text-slate-500">HR</span>{" "}
              <span className="font-mono text-slate-300">{COMPANY.hrNumber}</span>
            </p>
            <p>
              <span className="text-slate-500">Tagesregister</span>{" "}
              <span className="font-mono text-slate-300">
                {COMPANY.registryPublication.dailyRegisterNumber}
              </span>
              <span className="text-slate-600"> · </span>
              <span className="text-slate-500">SHAB</span>{" "}
              <span className="font-mono text-slate-300">
                {COMPANY.registryPublication.shabMessageNumber}
              </span>
            </p>
            <p className="text-slate-500">{COMPANY.registryPublication.registryOffice}</p>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-sky-300"
              >
                <Mail className="h-2.5 w-2.5 text-sky-400" aria-hidden="true" />
                {COMPANY.email}
              </a>
              <a
                href={COMPANY.phoneHref}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-sky-300"
              >
                <Phone className="h-2.5 w-2.5 text-sky-400" aria-hidden="true" />
                {COMPANY.phone}
              </a>
            </div>
          </section>

          <nav
            aria-label="Footer"
            className="grid min-w-0 grid-cols-3 gap-x-5 gap-y-2 sm:ml-auto sm:w-auto sm:max-w-xl sm:shrink-0 sm:gap-x-6"
          >
            <div className="min-w-0 space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {homeUi.explore}
              </h2>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/about" className={linkClass}>
                    {homeUi.about}
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className={linkClass}>
                    {homeUi.categories}
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className={linkClass}>
                    {homeUi.stores}
                  </Link>
                </li>
                <li>
                  <Link href="/status" className={linkClass}>
                    {homeUi.platformStatus}
                  </Link>
                </li>
                <li>
                  <Link href="/transparency" className={linkClass}>
                    {homeUi.platformNotices}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="min-w-0 space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {homeUi.support}
              </h2>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/help" className={linkClass}>
                    {homeUi.helpFAQ}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={linkClass}>
                    {homeUi.contact}
                  </Link>
                </li>
                <li>
                  <Link href="/affiliate-disclosure" className={linkClass}>
                    {homeUi.affiliateDisclosure}
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className={linkClass}>
                    {homeUi.priceServiceDisclaimer}
                  </Link>
                </li>
                <li>
                  <Link href="/complaints" className={linkClass}>
                    {homeUi.complaints}
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility" className={linkClass}>
                    {homeUi.accessibility}
                  </Link>
                </li>
                <li className="[&_button]:text-[11px] [&_button]:leading-5 [&_button]:text-slate-300 [&_svg]:h-3 [&_svg]:w-3">
                  <ManageCookiePreferencesButton />
                </li>
              </ul>
            </div>

            <div className="min-w-0 space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {homeUi.legalCompany}
              </h2>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/legal" className={linkClass}>
                    {homeUi.legalHub}
                  </Link>
                </li>
                <li>
                  <Link href="/impressum" className={linkClass}>
                    {homeUi.impressum}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className={linkClass}>
                    {homeUi.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className={linkClass}>
                    {homeUi.cookies}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={linkClass}>
                    {homeUi.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate">
            {formatUi(homeUi.allRightsReserved, {
              year: new Date().getFullYear(),
              companyPlatformName: COMPANY.platformName,
            })}
          </p>
          <Link href="/disclaimer" className="shrink-0 hover:text-amber-300 hover:underline">
            Beta / Demo
          </Link>
        </div>
      </div>
    </footer>
  );
}
