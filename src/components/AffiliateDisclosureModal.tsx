"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, X, Sparkles } from "lucide-react";

interface AffiliateDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AffiliateDisclosureModal({
  isOpen,
  onClose,
}: AffiliateDisclosureModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="affiliate-disclosure-title"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close affiliate disclosure dialog"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 id="affiliate-disclosure-title" className="text-xl font-bold text-slate-900">
              100% Free App & Affiliate Disclosure
            </h3>
            <p className="text-xs text-slate-500 font-medium">How BeforeToBuy.com works & monetizes</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          <p>
            This application is <strong className="text-slate-900">completely free for all users</strong>. We do not charge subscription fees, hidden service fees, or mark up any product prices.
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              How commissions work:
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-600">
              <li>When you click a store link, you are redirected to the official partner store (e.g. Digitec Galaxus, Amazon, MediaMarkt, eMAG).</li>
              <li>You complete the order directly on their official checkout page.</li>
              <li>If you complete a purchase, the store may pay us a small affiliate referral commission at zero extra cost to you.</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            Location data is used to estimate store distances and filter regional demo offers. Your exact location is not sold.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-sm shadow-md"
          >
            Understood & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
