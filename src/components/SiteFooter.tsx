"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { openConsentPreferences } from "@/lib/consent";
import { COMPANY } from "@/lib/company-info";
import { DEFAULT_COUNTRY } from "@/lib/countries";
import { useBrowseLocale } from "@/lib/i18n/use-browse-locale";
import { formatUi, HOME_UI } from "@/lib/i18n/ui";

export function SiteFooter() {
  const { locale: browseLocale } = useBrowseLocale(DEFAULT_COUNTRY);
  const homeUi = HOME_UI[browseLocale];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <footer className="mt-auto bg-[#fafafa] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        <div className="min-w-0 max-w-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative block h-8 w-8 shrink-0">
              <Image
                src="/beforetobuy-mark.png"
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight text-slate-900">BeforeToBuy</p>
              <p className="text-[11px] text-slate-500">{homeUi.compareBeforeYouBuy}</p>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400">
            {formatUi(homeUi.portanxProductLine, { companyTradeName: COMPANY.tradeName })}
          </p>

          <div className="space-y-1 text-[11px] leading-relaxed text-slate-600">
            <p className="font-medium text-slate-800">{COMPANY.legalName}</p>
            <p className="text-slate-500">{COMPANY.address.formattedDe}</p>
            <p className="text-slate-500">
              UID {COMPANY.uid}
              <span className="mx-1.5 text-slate-300">·</span>
              HR {COMPANY.hrNumber}
            </p>
            <p className="pt-1">
              <a href={`mailto:${COMPANY.email}`} className="text-slate-600 hover:text-[#e85d04]">
                {COMPANY.email}
              </a>
              <span className="mx-1.5 text-slate-300">·</span>
              <a href={COMPANY.phoneHref} className="text-slate-600 hover:text-[#e85d04]">
                {COMPANY.phone}
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-5 sm:items-end sm:pt-1" ref={menuRef}>
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-800 shadow-sm transition-colors hover:border-[#e85d04]/40 hover:text-[#e85d04]"
            >
              {homeUi.legalSupportMenu}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {menuOpen ? (
              <div
                id={menuId}
                role="menu"
                className="absolute left-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg sm:left-auto sm:right-0"
              >
                <Link
                  href="/legal"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-[#e85d04]"
                >
                  {homeUi.legalHub}
                </Link>
                <Link
                  href="/help"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-[#e85d04]"
                >
                  {homeUi.helpFAQ}
                </Link>
                <Link
                  href="/contact"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-[#e85d04]"
                >
                  {homeUi.contact}
                </Link>
                <Link
                  href="/impressum"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3.5 py-2 text-[12px] text-slate-700 hover:bg-slate-50 hover:text-[#e85d04]"
                >
                  {homeUi.impressum}
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    openConsentPreferences();
                  }}
                  className="block w-full px-3.5 py-2 text-left text-[12px] text-slate-700 hover:bg-slate-50 hover:text-[#e85d04]"
                >
                  Cookie Settings
                </button>
              </div>
            ) : null}
          </div>

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
