"use client";

import { MARKET_HUB_TABS } from "@/lib/market-hubs";
import type { SiteLocale } from "@/lib/i18n/locales";
import { HOME_UI } from "@/lib/i18n/ui";

interface MarketHubTabsProps {
  selectedHub: string;
  onHubChange: (hubId: string) => void;
  locale: SiteLocale;
  hubCounts?: Record<string, number>;
}

export function MarketHubTabs({
  selectedHub,
  onHubChange,
  locale,
  hubCounts,
}: MarketHubTabsProps) {
  const ui = HOME_UI[locale];
  const labels: Record<string, string> = {
    "hub-electronics": ui.hubElectronics,
    "hub-books": ui.hubBooks,
    "hub-fashion": ui.hubFashion,
    "hub-garden": ui.hubGarden,
    "hub-diy": ui.hubDiy,
  };

  return (
    <div className="border-b border-slate-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          role="tablist"
          aria-label={ui.marketHubsLabel}
          className="flex gap-1 overflow-x-auto custom-scrollbar touch-pan-x -mb-px"
        >
          {MARKET_HUB_TABS.map((hub) => {
            const Icon = hub.icon;
            const active = selectedHub === hub.id;
            const count = hubCounts?.[hub.id];
            return (
              <button
                key={hub.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onHubChange(hub.id)}
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  active
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{labels[hub.id] ?? hub.id}</span>
                {typeof count === "number" && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
