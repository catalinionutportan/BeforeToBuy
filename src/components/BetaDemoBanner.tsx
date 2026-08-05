import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { DEMO_DISCLAIMER } from "@/lib/site-config";

/** Subtle site-wide beta notice — matches the dark header bar, not a loud orange strip. */
export function BetaDemoBanner() {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 sm:mt-0 text-amber-400" />
          <span>
            <strong className="uppercase tracking-wide text-amber-300">Beta / Demo</strong>
            <span className="text-slate-400"> — </span>
            {DEMO_DISCLAIMER}
          </span>
        </div>
        <Link
          href="/about"
          className="sm:ml-auto underline underline-offset-2 font-semibold text-emerald-400 whitespace-nowrap hover:text-emerald-300"
        >
          Learn how it works
        </Link>
      </div>
    </div>
  );
}
