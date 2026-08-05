import { AlertTriangle } from "lucide-react";
import { LEGAL_DRAFT_NOTICE, LEGAL_DOCUMENT_VERSION, LEGAL_LAST_UPDATED } from "@/lib/legal-config";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI, formatUi } from "@/lib/i18n/ui";
import { pickLocaleString } from "@/lib/i18n/locales";

interface LegalDraftNoticeProps {
  showVersion?: boolean;
}

export function LegalDraftNotice({ showVersion = true }: LegalDraftNoticeProps) {
  const { browseLocale } = useBrowseLocale();
  const homeUi = HOME_UI[browseLocale];
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
        <div className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          {homeUi.legalDraftNotice}
        </div>
      <p>{pickLocaleString(LEGAL_DRAFT_NOTICE, browseLocale)}</p>
      {showVersion && (
        <p className="text-amber-800/80">
          {homeUi.documentVersion} <strong>{LEGAL_DOCUMENT_VERSION}</strong> · {homeUi.lastUpdated}{" "}
          <strong>{LEGAL_LAST_UPDATED}</strong>
        </p>
      )}
    </div>
  );
}
