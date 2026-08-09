"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useBrowseLocale();
  const ui = HOME_UI[locale];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Something went wrong</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          BeforeToBuy.com hit an unexpected error. You can try again or return to the homepage.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 break-all">
            {error.message}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
          >
            Try again
          </button>
          <Link
            href={withLangParam("/", locale)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            {ui.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
