"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Store,
  Mail,
  Phone,
  Building2,
  Lock,
  FileText,
  Cookie,
  Scale,
  LifeBuoy,
  Activity,
  CircleHelp,
  Compass,
  Sparkles,
  AlertTriangle,
  Accessibility,
} from "lucide-react";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { COMPANY } from "@/lib/company-info";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

export function SiteFooter() {
  const { locale: browseLocale } = useBrowseLocale(DEFAULT_COUNTRY);
  const homeUi = HOME_UI[browseLocale];
  const linkClass =
    "inline-flex min-h-8 items-center gap-2 text-slate-300 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md";

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 border-b border-slate-800 pb-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <section aria-labelledby="footer-brand" className="max-w-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="relative block h-9 w-9">
                <Image
                  src="/beforetobuy-mark.png"
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p id="footer-brand" className="text-base font-extrabold text-white">
                  BeforeToBuy
                </p>
                <p className="text-xs text-slate-500">{homeUi.compareBeforeYouBuy}</p>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-400">
              {formatUi(homeUi.independentBetaDemoPlatform, { companyLegalName: COMPANY.legalName })}
            </p>

            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={formatUi(homeUi.visitOfficialWebsite, { companyPlatformName: COMPANY.platformName })}
              className="group block w-full max-w-[200px] overflow-hidden rounded-lg border border-slate-700 bg-black transition-all hover:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Image
                src="/portanx-logo.png"
                alt="PortanX"
                width={640}
                height={200}
                sizes="200px"
                className="h-auto w-full opacity-90 transition-opacity group-hover:opacity-100"
              />
            </a>

            <div className="space-y-1 border-l-2 border-sky-500/50 pl-3 text-xs">
              <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">{homeUi.portanxContact}</p>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex min-h-7 items-center gap-2 text-slate-300 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
              >
                <Mail className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                {COMPANY.email}
              </a>
              <a
                href={COMPANY.phoneHref}
                className="flex min-h-7 items-center gap-2 text-slate-300 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
              >
                <Phone className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                {COMPANY.phone}
              </a>
            </div>
          </section>

          <nav aria-labelledby="footer-explore" className="space-y-2">
            <h2 id="footer-explore" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {homeUi.explore}
            </h2>
            <div className="flex flex-col items-start gap-0.5">
              <Link href="/about" className={linkClass}>
                <Compass className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.about}
              </Link>
              <Link href="/categories" className={linkClass}>
                <Layers className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.categories}
              </Link>
              <Link href="/stores" className={linkClass}>
                <Store className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.stores}
              </Link>
              <Link href="/status" className={linkClass}>
                <Activity className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.platformStatus}
              </Link>
              <Link href="/transparency" className={linkClass}>
                <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.platformNotices}
              </Link>
            </div>
          </nav>

          <nav aria-labelledby="footer-support" className="space-y-2">
            <h2 id="footer-support" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {homeUi.support}
            </h2>
            <div className="flex flex-col items-start gap-0.5">
              <Link href="/help" className={linkClass}>
                <LifeBuoy className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.helpFAQ}
              </Link>
              <Link href="/contact" className={linkClass}>
                <Mail className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.contact}
              </Link>
              <Link href="/affiliate-disclosure" className={linkClass}>
                <CircleHelp className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.affiliateDisclosure}
              </Link>
              <Link href="/disclaimer" className={linkClass}>
                <AlertTriangle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.priceServiceDisclaimer}
              </Link>
              <Link href="/complaints" className={linkClass}>
                <Scale className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.complaints}
              </Link>
              <Link href="/accessibility" className={linkClass}>
                <Accessibility className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.accessibility}
              </Link>
              <div className={linkClass}>
                <ManageCookiePreferencesButton />
              </div>
            </div>
          </nav>

          <nav aria-labelledby="footer-legal" className="space-y-2">
            <h2 id="footer-legal" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {homeUi.legalCompany}
            </h2>
            <div className="flex flex-col items-start gap-0.5">
              <Link href="/legal" className={linkClass}>
                <Scale className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.legalHub}
              </Link>
              <Link href="/impressum" className={linkClass}>
                <Building2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.impressum}
              </Link>
              <Link href="/privacy" className={linkClass}>
                <Lock className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.privacy}
              </Link>
              <Link href="/cookies" className={linkClass}>
                <Cookie className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.cookies}
              </Link>
              <Link href="/terms" className={linkClass}>
                <FileText className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                {homeUi.terms}
              </Link>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <p>
              {formatUi(homeUi.allRightsReserved, {
                year: new Date().getFullYear(),
                companyPlatformName: COMPANY.platformName,
              })}
            </p>
            <p>
              {formatUi(homeUi.companyInfo, {
                companyLegalName: COMPANY.legalName,
                companyUid: COMPANY.uid,
                companyAddressStreet: COMPANY.address.street,
                companyAddressPostalCode: COMPANY.address.postalCode,
                companyAddressCity: COMPANY.address.city,
              })}
            </p>
          </div>
          <Link
            href="/disclaimer"
            className="text-[11px] text-slate-500 underline-offset-2 hover:text-amber-300 hover:underline"
          >
            {homeUi.betaDemoDisclaimer}
          </Link>
        </div>
      </div>
    </footer>
  );
}
