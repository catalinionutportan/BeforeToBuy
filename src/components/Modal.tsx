"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { readBrowseScrollY, restoreBrowseScrollY } from "@/lib/browse-scroll";

/**
 * Product overlay. No body position:fixed (that flashes the page on close).
 * No fade-out delay before router.back() (that feels like a reload).
 */
export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const closedRef = useRef(false);

  useEffect(() => {
    const saved = readBrowseScrollY();
    scrollYRef.current =
      saved != null ? saved : Math.max(0, Math.floor(window.scrollY));

    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;

    // Lock scroll without taking the body out of flow (avoids close flash).
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`;
    }
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    // Keep the saved browse offset if focus already jumped the document.
    window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
    panelRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overflow = prevHtmlOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
      window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
      restoreBrowseScrollY();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dismiss closes via router
  }, []);

  function onDismiss() {
    if (closedRef.current) return;
    closedRef.current = true;

    // Unlock + pin scroll before navigation so Next soft-nav cannot flash top/bottom.
    const { body, documentElement } = document;
    body.style.overflow = "";
    documentElement.style.overflow = "";
    body.style.paddingRight = "";
    window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });

    router.back();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full sm:w-[90vw] md:w-[80vw] lg:w-[1000px] sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden outline-none"
      >
        <span id={titleId} className="sr-only">
          Product details
        </span>
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto w-full h-full sm:max-h-[90vh] pb-10 sm:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
