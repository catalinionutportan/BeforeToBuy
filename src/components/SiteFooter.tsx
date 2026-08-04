import Link from "next/link";
import {
  HelpCircle,
  Layers,
  Store,
  Mail,
  Info,
  Building2,
  Lock,
  FileText,
  Shield,
  Cookie,
} from "lucide-react";
import { ManageCookiePreferencesButton } from "@/components/ManageCookiePreferencesButton";

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
              B2B
            </div>
            <div>
              <span className="text-white font-bold text-base block">BeforeToBuy.com</span>
              <span className="text-[10px] text-slate-500">
                Operated by{" "}
                <a
                  href="https://portanx.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  PortanX - Catalin Portan
                </a>{" "}
                (CHE-373.501.736)
              </span>
            </div>
          </div>

          <nav
            aria-label="Footer legal and info links"
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium"
          >
            <Link href="/about" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" /> About
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/categories" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Categories
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/stores" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" /> Stores
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/contact" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Contact
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/affiliate-disclosure" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Info className="w-3.5 h-3.5" aria-hidden="true" /> Affiliate
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/impressum" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" /> Impressum
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/privacy" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" /> Privacy
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/cookies" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <Cookie className="w-3.5 h-3.5" aria-hidden="true" /> Cookies
            </Link>
            <span aria-hidden="true">•</span>
            <Link href="/terms" className="hover:text-emerald-400 text-slate-300 transition-colors flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Terms
            </Link>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            © 2026 BeforeToBuy.com | PortanX - Catalin Portan, Flurstrasse 24, 3014 Bern, Switzerland.
            All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <ManageCookiePreferencesButton />
            <p className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              Beta demo — Brack.ch live AWIN feed (CH); other merchants in progress.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
