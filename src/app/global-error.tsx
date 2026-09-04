"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = (error?.message || "").toLowerCase();
    const isBuildMismatch =
      msg.includes("server reference id") ||
      msg.includes("failed-to-find-server-action") ||
      msg.includes("chunkloaderror") ||
      msg.includes("loading chunk");

    if (isBuildMismatch && typeof window !== "undefined") {
      const key = "btb:build-mismatch-reload";
      const lastReload = sessionStorage.getItem(key);
      if (!lastReload || Date.now() - Number(lastReload) > 10000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.reload();
                } else {
                  reset();
                }
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
