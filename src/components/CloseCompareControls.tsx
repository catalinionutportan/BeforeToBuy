"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  closeLabel: string;
  backLabel: string;
};

/** Back / close for compare page — return to previous browse scroll via history. */
export function CloseCompareControls({ title, closeLabel, backLabel }: Props) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <>
      <button
        type="button"
        onClick={goBack}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        aria-label={backLabel}
      >
        <ArrowLeft className="w-5 h-5 text-slate-600" />
      </button>
      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <button
        type="button"
        onClick={goBack}
        className="ml-auto text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        {closeLabel}
      </button>
    </>
  );
}
