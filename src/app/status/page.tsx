"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/PageShell";

type HealthPayload = {
  status: "healthy" | "degraded" | "unhealthy";
  sitePhase: string;
  commit: string | null;
  environment: string;
  responseMs: number;
  timestamp: string;
  checks: Record<string, { status: string; [key: string]: unknown }>;
};

export default function StatusPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const data = (await response.json()) as HealthPayload;
      setHealth(data);
      if (!response.ok) {
        setError(`Health API returned ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load health status");
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
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
            Platform Status
          </span>
          <h1 className="text-3xl font-extrabold">BeforeToBuy.com Status</h1>
          <p className="text-slate-300 text-sm">
            Operational health for the Beta/Demo platform. For consumer help, see{" "}
            <Link href="/help" className="text-emerald-400 underline">
              Help & FAQ
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {statusIcon}
            <span>
              {isLoading ? "Checking..." : health?.status === "healthy" ? "All systems operational" : "Degraded"}
            </span>
          </div>
          <button
            type="button"
            onClick={loadHealth}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-emerald-600 disabled:opacity-60 text-white px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl p-4">{error}</div>
        )}

        {health && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Phase</p>
                <p className="font-bold text-slate-900">{health.sitePhase}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Environment</p>
                <p className="font-bold text-slate-900">{health.environment}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Commit</p>
                <p className="font-bold text-slate-900 font-mono">{health.commit || "local"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Response</p>
                <p className="font-bold text-slate-900">{health.responseMs} ms</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold text-slate-900 text-sm">Checks</h2>
              <pre className="bg-slate-950 text-emerald-300 rounded-xl p-4 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(health.checks, null, 2)}
              </pre>
            </div>

            <p className="text-slate-500">Last checked: {new Date(health.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
