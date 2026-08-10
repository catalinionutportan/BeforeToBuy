"use client";

import { useEffect, useEffectEvent, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { STATUS_COPY } from "@/lib/i18n/status";
import { withLangParam } from "@/lib/seo/site-url";

type HealthPayload = {
  status: "healthy" | "degraded" | "unhealthy";
  sitePhase: string;
  responseMs: number;
  timestamp: string;
  detailLevel?: string;
  checks: Record<string, { status: string; [key: string]: unknown }>;
};

export default function StatusPage() {
  const { locale } = useBrowseLocale();
  const copy = STATUS_COPY[locale];
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/health");
      const data = (await response.json()) as HealthPayload;
      setHealth(data);
      if (!response.ok) {
        setError(`Health API returned ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.loadError);
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };
  const loadHealthEvent = useEffectEvent(loadHealth);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => loadHealthEvent(), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const statusIcon =
    health?.status === "healthy" ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />
    ) : health?.status === "unhealthy" ? (
      <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
    ) : (
      <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
    );

  return (
    <PageShell maxWidthClass="max-w-3xl">
      <div className="space-y-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            {copy.badge}
          </span>
          <h1 className="text-3xl font-extrabold">{copy.title}</h1>
          <p className="text-slate-300 text-sm">
            {copy.intro}{" "}
            <Link href={withLangParam("/help", locale)} className="text-emerald-400 underline">
              {copy.help}
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {statusIcon}
            <span>
              {isLoading ? copy.checking : health?.status === "healthy" ? copy.operational : copy.degraded}
            </span>
          </div>
          <button
            type="button"
            onClick={loadHealth}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-emerald-600 disabled:opacity-60 text-white px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            {copy.refresh}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl p-4">{error}</div>
        )}

        {health && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">{copy.phase}</p>
                <p className="font-bold text-slate-900">{health.sitePhase}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">{copy.response}</p>
                <p className="font-bold text-slate-900">{health.responseMs} ms</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">{copy.checks}</p>
                <p className="font-bold text-slate-900">{health.detailLevel || "public"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-slate-900 text-sm">{copy.checks}</h2>
              <pre className="bg-slate-950 text-emerald-300 rounded-xl p-4 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(health.checks, null, 2)}
              </pre>
            </div>

            <p className="text-slate-500">{copy.lastChecked}: {new Date(health.timestamp).toLocaleString(locale)}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
