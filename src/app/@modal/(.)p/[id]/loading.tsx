import { Modal } from "@/components/Modal";

export default function ProductModalLoading() {
  return (
    <Modal>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 animate-pulse" aria-busy="true" aria-live="polite">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="aspect-square bg-slate-100 rounded-2xl border border-slate-100" />
          <div className="space-y-4">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-7 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-6 space-y-3">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="h-16 bg-white rounded-2xl border border-slate-200" />
          <div className="h-16 bg-white rounded-2xl border border-slate-200" />
        </div>
      </div>
    </Modal>
  );
}
