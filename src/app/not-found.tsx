import Link from "next/link";
import { SearchX } from "lucide-react";
import { getRequestMarketCountry } from "@/lib/request-market";
import { defaultLocaleFromCountry } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";
import { withLangParam } from "@/lib/seo/site-url";

export default async function NotFound() {
  const countryCode = await getRequestMarketCountry();
  const locale = defaultLocaleFromCountry(countryCode);
  const ui = HOME_UI[locale];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <SearchX className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">{ui.pageNotFoundTitle}</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          {ui.pageNotFoundBody}
        </p>
        <Link
          href={withLangParam("/", locale)}
          className="inline-flex bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
        >
          {ui.backToHome}
        </Link>
      </div>
    </div>
  );
}
