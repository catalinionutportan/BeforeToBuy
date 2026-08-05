import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { DEMO_DISCLAIMER } from "@/lib/site-config";

export function BetaDemoBanner() {
  return (
    <div className="bg-amber-500 text-amber-950 text-xs sm:text-sm py-2.5 px-4 border-b border-amber-600/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-start sm:items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="uppercase tracking-wide">Beta / Demo</strong> — {DEMO_DISCLAIMER}
          </span>
        </div>
        <Link
          href="/about"
          className="sm:ml-auto underline underline-offset-2 font-bold whitespace-nowrap hover:text-amber-900"
        >
          Learn how it works
        </Link>
      </div>
    </div>
  );
}
