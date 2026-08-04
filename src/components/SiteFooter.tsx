import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Store,
  Mail,
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
} from "lucide-react";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";
import { COMPANY } from "@/lib/company-info";

export function SiteFooter() {
  const linkClass =
    "inline-flex min-h-8 items-center gap-2 text-slate-300 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md";

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 px-4 py-12 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 border-b border-slate-800 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <section aria-labelledby="footer-brand" className="max-w-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-slate-950">
                B2B
              </div>
              <div>
                <p id="footer-brand" className="text-lg font-extrabold text-white">
                  {COMPANY.platformName}
                </p>
                <p className="text-xs text-slate-500">Compare before you buy</p>
              </div>
            </div>

            <p className="max-w-sm text-xs leading-5 text-slate-400">
              Independent Beta/Demo comparison platform operated in Bern by {COMPANY.legalName}.
              Production-feed, sample, and demo entries are labeled separately.
            </p>

            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit the official PortanX company website"
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
          </section>

          <nav aria-labelledby="footer-explore" className="space-y-3">
            <h2 id="footer-explore" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Explore
            </h2>
            <div className="flex flex-col items-start">
              <Link href="/about" className={linkClass}><Compass className="h-4 w-4 text-emerald-400" aria-hidden="true" />About</Link>
              <Link href="/categories" className={linkClass}><Layers className="h-4 w-4 text-emerald-400" aria-hidden="true" />Categories</Link>
              <Link href="/stores" className={linkClass}><Store className="h-4 w-4 text-emerald-400" aria-hidden="true" />Stores</Link>
              <Link href="/status" className={linkClass}><Activity className="h-4 w-4 text-emerald-400" aria-hidden="true" />Platform status</Link>
            </div>
          </nav>

          <nav aria-labelledby="footer-support" className="space-y-3">
            <h2 id="footer-support" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Support
            </h2>
            <div className="flex flex-col items-start">
              <Link href="/help" className={linkClass}><LifeBuoy className="h-4 w-4 text-emerald-400" aria-hidden="true" />Help &amp; FAQ</Link>
              <Link href="/contact" className={linkClass}><Mail className="h-4 w-4 text-emerald-400" aria-hidden="true" />Contact</Link>
              <Link href="/affiliate-disclosure" className={linkClass}><CircleHelp className="h-4 w-4 text-emerald-400" aria-hidden="true" />Affiliate disclosure</Link>
              <div className={linkClass}><ManageCookiePreferencesButton /></div>
            </div>
          </nav>

          <nav aria-labelledby="footer-legal" className="space-y-3">
            <h2 id="footer-legal" className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              Legal &amp; company
            </h2>
            <div className="flex flex-col items-start">
              <Link href="/legal" className={linkClass}><Scale className="h-4 w-4 text-emerald-400" aria-hidden="true" />Legal hub</Link>
              <Link href="/impressum" className={linkClass}><Building2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />Impressum</Link>
              <Link href="/privacy" className={linkClass}><Lock className="h-4 w-4 text-emerald-400" aria-hidden="true" />Privacy</Link>
              <Link href="/cookies" className={linkClass}><Cookie className="h-4 w-4 text-emerald-400" aria-hidden="true" />Cookies</Link>
              <Link href="/terms" className={linkClass}><FileText className="h-4 w-4 text-emerald-400" aria-hidden="true" />Terms</Link>
            </div>
          </nav>
        </div>

        <div className="flex flex-col gap-5 pt-7 text-xs text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p>© 2026 {COMPANY.platformName}. All rights reserved.</p>
            <p>
              {COMPANY.legalName} · {COMPANY.uid} · {COMPANY.address.street}, CH-{COMPANY.address.postalCode} {COMPANY.address.city}
            </p>
          </div>
          <p className="flex max-w-xl items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] leading-4 text-slate-400">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            Beta/Demo: Brack.ch uses AWIN sample data unless a production feed is configured. Always confirm final price and availability with the merchant.
          </p>
        </div>
      </div>
    </footer>
  );
}
