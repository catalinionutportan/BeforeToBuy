"use client";

import { BadgeCheck } from "lucide-react";
import { LEGAL_DRAFT_NOTICE, LEGAL_DOCUMENT_VERSION, LEGAL_LAST_UPDATED } from "@/lib/legal-config";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";
import { pickLocaleString } from "@/lib/i18n/locales";

interface LegalDraftNoticeProps {
  showVersion?: boolean;
}

export function LegalDraftNotice({ showVersion = true }: LegalDraftNoticeProps) {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
        <div className="font-bold flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          {homeUi.legalDraftNotice}
        </div>
      <p>{pickLocaleString(LEGAL_DRAFT_NOTICE, browseLocale, LEGAL_DRAFT_NOTICE.en)}</p>
      {showVersion && (
        <p className="text-emerald-800/80">
          {homeUi.documentVersion} <strong>{LEGAL_DOCUMENT_VERSION}</strong> · {homeUi.lastUpdated}{" "}
          <strong>{LEGAL_LAST_UPDATED}</strong>
        </p>
      )}
    </div>
  );
}
