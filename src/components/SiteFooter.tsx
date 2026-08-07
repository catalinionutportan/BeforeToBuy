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
    "text-slate-300 underline-offset-2 transition-colors hover:text-emerald-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm";

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-4 text-xs text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative block h-7 w-7 shrink-0">
              <Image
                src="/beforetobuy-mark.png"
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-extrabold text-white">BeforeToBuy</p>
              <p className="truncate text-[11px] text-slate-500">{homeUi.compareBeforeYouBuy}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <a
              href={`mailto:${COMPANY.email}`}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-sky-300"
            >
              <Mail className="h-3 w-3 text-sky-400" aria-hidden="true" />
              {COMPANY.email}
            </a>
            <a
              href={COMPANY.phoneHref}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-sky-300"
            >
              <Phone className="h-3 w-3 text-sky-400" aria-hidden="true" />
              {COMPANY.phone}
            </a>
            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-300 hover:underline"
            >
              PortanX
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-1.5 border-y border-slate-800/80 py-2.5">
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="shrink-0 font-bold uppercase tracking-[0.14em] text-slate-500">
              {homeUi.explore}
            </span>
            <Link href="/about" className={linkClass}>
              {homeUi.about}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/categories" className={linkClass}>
              {homeUi.categories}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/stores" className={linkClass}>
              {homeUi.stores}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/status" className={linkClass}>
              {homeUi.platformStatus}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/transparency" className={linkClass}>
              {homeUi.platformNotices}
            </Link>
          </p>

          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="shrink-0 font-bold uppercase tracking-[0.14em] text-slate-500">
              {homeUi.support}
            </span>
            <Link href="/help" className={linkClass}>
              {homeUi.helpFAQ}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/contact" className={linkClass}>
              {homeUi.contact}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/affiliate-disclosure" className={linkClass}>
              {homeUi.affiliateDisclosure}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/disclaimer" className={linkClass}>
              {homeUi.priceServiceDisclaimer}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/complaints" className={linkClass}>
              {homeUi.complaints}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/accessibility" className={linkClass}>
              {homeUi.accessibility}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <span className="[&_button]:text-[12px] [&_button]:text-slate-300">
              <ManageCookiePreferencesButton />
            </span>
          </p>

          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="shrink-0 font-bold uppercase tracking-[0.14em] text-slate-500">
              {homeUi.legalCompany}
            </span>
            <Link href="/legal" className={linkClass}>
              {homeUi.legalHub}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/impressum" className={linkClass}>
              {homeUi.impressum}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/privacy" className={linkClass}>
              {homeUi.privacy}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/cookies" className={linkClass}>
              {homeUi.cookies}
            </Link>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <Link href="/terms" className={linkClass}>
              {homeUi.terms}
            </Link>
          </p>
        </nav>

        <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate">
            {formatUi(homeUi.allRightsReserved, {
              year: new Date().getFullYear(),
              companyPlatformName: COMPANY.platformName,
            })}{" "}
            · {COMPANY.legalName} · {COMPANY.uid}
          </p>
          <Link href="/disclaimer" className="shrink-0 text-slate-500 hover:text-amber-300 hover:underline">
            Beta / Demo
          </Link>
        </div>
      </div>
    </footer>
  );
}
