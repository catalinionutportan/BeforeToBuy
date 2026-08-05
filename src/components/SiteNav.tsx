import Link from "next/link";
import {
  ShoppingBag,
  HelpCircle,
  Layers,
  Store,
  Mail,
  LifeBuoy,
  Scale,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About", icon: HelpCircle },
  { href: "/", label: "Compare", icon: Layers },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/help", label: "Help", icon: LifeBuoy },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/legal", label: "Legal", icon: Scale },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 block leading-tight">
              BeforeToBuy.com
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Beta / Demo</span>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
