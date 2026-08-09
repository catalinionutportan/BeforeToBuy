import { PageShell } from "@/components/PageShell";

export default function ProductLoading() {
  return (
    <PageShell maxWidthClass="max-w-7xl">
      <div className="space-y-8 animate-pulse" aria-busy="true" aria-live="polite">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="aspect-square bg-slate-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="h-5 w-64 bg-slate-200 rounded" />
          <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
          <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
        </div>
      </div>
    </PageShell>
  );
}
