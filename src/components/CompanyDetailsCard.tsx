"use client";

import Link from "next/link";
import { Building2, Globe, Mail, MapPin, FileText, Phone } from "lucide-react";
import { COMPANY } from "@/lib/company-info";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { pickLocaleString } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

export function CompanyDetailsCard() {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs text-slate-700">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Building2 className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{COMPANY.legalName}</h2>
          <p className="text-slate-500">{pickLocaleString(COMPANY.legalForm, browseLocale, COMPANY.legalForm.en)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            Address
          </div>
          <p className="text-slate-600 leading-relaxed">
            {COMPANY.address.street}
            <br />
            CH-{COMPANY.address.postalCode} {COMPANY.address.city}
            <br />
            {COMPANY.address.country}
          </p>
        </div>

        <div className="space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            {homeUi.registry}
          </div>
          <p className="text-slate-600 leading-relaxed">
            UID: {COMPANY.uid}
            <br />
            {pickLocaleString(COMPANY.vatStatus, browseLocale, COMPANY.vatStatus.en)}
            <br />
            HR-Nr: {COMPANY.hrNumber}
            <br />
            Registered: {COMPANY.registrationDate}
            <br />
            SHAB: {COMPANY.registryPublication.shabMessageNumber} (
            {COMPANY.registryPublication.publicationDate})
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
        <a
          href={`mailto:${COMPANY.email}`}
          className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline"
        >
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          {COMPANY.email}
        </a>
        <a
          href={COMPANY.phoneHref}
          className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline"
        >
          <Phone className="w-3.5 h-3.5" aria-hidden="true" />
          {COMPANY.phone}
        </a>
        <a
          href={COMPANY.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline"
        >
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
          {COMPANY.website.replace("https://", "")}
        </a>
      </div>

      <p className="text-slate-500 pt-1">
        {homeUi.operatorOf}{" "}
        <Link href="/" className="text-emerald-700 font-semibold hover:underline">
          {COMPANY.platformName}
        </Link>
      </p>
    </div>
  );
}
