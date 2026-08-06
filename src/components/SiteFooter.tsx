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
  Shield,
  Cookie,
  Scale,
  LifeBuoy,
  Activity,
  CircleHelp,
  Compass,
  ShoppingBag,
} from "lucide-react";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { FooterQuickIndex } from "@/components/FooterQuickIndex";
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
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-12 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <section aria-labelledby="footer-brand" className="max-w-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p id="footer-brand" className="text-lg font-extrabold text-white">
                  {COMPANY.platformName}
                </p>
                <p className="text-xs text-slate-500">{homeUi.compareBeforeYouBuy}</p>
              </div>
            </div>

            <p className="max-w-sm text-xs leading-5 text-slate-400">
              {formatUi(homeUi.independentBetaDemoPlatform, { companyLegalName: COMPANY.legalName })}
            </p>

            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={formatUi(homeUi.visitOfficialWebsite, { companyPlatformName: COMPANY.platformName })}
              className="group block w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-700 bg-black transition-all duration-300 hover:border-sky-400 hover:shadow-[0_0_24px_rgba(56,189,248,0.32)] focus-visible:border-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.99] active:border-sky-400 active:shadow-[0_0_18px_rgba(56,189,248,0.3)]"
            >
              <Image
                src="/portanx-logo.png"
                alt="PortanX"
                width={640}
                height={200}
                sizes="(max-width: 640px) 80vw, 280px"
                className="h-auto w-full opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:brightness-110 group-focus-visible:opacity-100 group-focus-visible:brightness-110"
              />
            </a>

            <div className="max-w-[280px] space-y-1.5 border-l-2 border-sky-500/50 pl-3 text-xs">
              <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">
              {homeUi.portanxContact}
              </p>
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex min-h-7 items-center gap-2 text-slate-300 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
              >
                <Mail className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                {COMPANY.email}
              </a>
              <a
                href={COMPANY.phoneHref}
                className="flex min-h-7 items-center gap-2 text-slate-300 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-md"
              >
                <Phone className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                {COMPANY.phone}
              </a>
            </div>
          </section>

          <nav aria-labelledby="footer-explore" className="space-y-3">
            <h2 id="footer-explore" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {homeUi.explore}
            </h2>
            <div className="flex flex-col items-start">
              <Link href="/about" className={linkClass}><Compass className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.about}</Link>
              <Link href="/categories" className={linkClass}><Layers className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.categories}</Link>
              <Link href="/stores" className={linkClass}><Store className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.stores}</Link>
              <Link href="/status" className={linkClass}><Activity className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.platformStatus}</Link>
            </div>
          </nav>

          <nav aria-labelledby="footer-support" className="space-y-3">
            <h2 id="footer-support" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {homeUi.support}
            </h2>
            <div className="flex flex-col items-start">
              <Link href="/help" className={linkClass}><LifeBuoy className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.helpFAQ}</Link>
              <Link href="/contact" className={linkClass}><Mail className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.contact}</Link>
              <Link href="/affiliate-disclosure" className={linkClass}><CircleHelp className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.affiliateDisclosure}</Link>
              <div className={linkClass}><ManageCookiePreferencesButton /></div>
            </div>
          </nav>

          <nav aria-labelledby="footer-legal" className="space-y-3">
            <h2 id="footer-legal" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {homeUi.legalCompany}
            </h2>
            <div className="flex flex-col items-start">
              <Link href="/legal" className={linkClass}><Scale className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.legalHub}</Link>
              <Link href="/impressum" className={linkClass}><Building2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.impressum}</Link>
              <Link href="/privacy" className={linkClass}><Lock className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.privacy}</Link>
              <Link href="/cookies" className={linkClass}><Cookie className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.cookies}</Link>
              <Link href="/terms" className={linkClass}><FileText className="h-4 w-4 text-emerald-400" aria-hidden="true" />{homeUi.terms}</Link>
            </div>
          </nav>
        </div>

        {/* Quick Index & Notice Cards Hub */}
        <FooterQuickIndex />

        <div className="flex flex-col gap-5 pt-7 text-xs text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p>{formatUi(homeUi.allRightsReserved, { year: new Date().getFullYear(), companyPlatformName: COMPANY.platformName })}</p>
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
            <p className="flex max-w-xl items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-4 text-slate-400">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              {homeUi.betaDemoDisclaimer}
            </p>
        </div>
      </div>
    </footer>
  );
}
