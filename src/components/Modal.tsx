"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import {
  notifyBrowseScrollRestored,
  pinBrowseScrollY,
  readBrowseScrollY,
} from "@/lib/browse-scroll";
import { useBrowseLocale } from "@/hooks/useBrowseLocale";
import { HOME_UI } from "@/lib/i18n/ui";

/**
 * Product overlay.
 * Avoid body position:fixed (page flash). Prefer pinning browse Y over
 * overflow:hidden when possible — overflow:hidden often clamps scroll to the
 * end of a short lazy-loaded grid.
 */
export function Modal({
  children,
  /**
   * When false (instant product shell): do not touch overflow — only pin the
   * saved browse scroll so closing never lands at the catalog end.
   */
  lockScroll = true,
  onClose,
  elevated = false,
  /** 0 until the first complete frame is ready — avoids empty-shell flash. */
  paintOpacity = 1,
}: {
  children: React.ReactNode;
  lockScroll?: boolean;
  onClose?: () => void;
  elevated?: boolean;
  paintOpacity?: number;
}) {
  const router = useRouter();
  const { locale } = useBrowseLocale();
  const ui = HOME_UI[locale];
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);
  const closedRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const saved = readBrowseScrollY();
    scrollYRef.current =
      saved != null ? saved : Math.max(0, Math.floor(window.scrollY));

    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const backgroundElements = Array.from(
      document.querySelectorAll<HTMLElement>("header, main, footer")
    ).filter((element) => !element.contains(panelRef.current));
    const backgroundState = backgroundElements.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    for (const element of backgroundElements) {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    }

    const pin = () => {
      window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
    };

    let removeSoftScrollListener = () => {};
    if (lockScroll) {
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      if (scrollbar > 0) {
        body.style.paddingRight = `${scrollbar}px`;
      }
      body.style.overflow = "hidden";
      documentElement.style.overflow = "hidden";
      pin();
    } else {
      // Soft pin: block background scroll without collapsing document height.
      pin();
      const onScroll = () => {
        if (Math.abs(window.scrollY - scrollYRef.current) > 1) pin();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      removeSoftScrollListener = () => {
        window.removeEventListener("scroll", onScroll);
      };
    }

    panelRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");

      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      removeSoftScrollListener();
      body.style.overflow = prevBodyOverflow;
      documentElement.style.overflow = prevHtmlOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
      for (const { element, inert, ariaHidden } of backgroundState) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      }
      notifyBrowseScrollRestored();
      pinBrowseScrollY();
      returnFocusRef.current?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dismiss closes via router
  }, [lockScroll]);

  function onDismiss() {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose?.();

    if (lockScroll) {
      const { body, documentElement } = document;
      body.style.overflow = "";
      documentElement.style.overflow = "";
      body.style.paddingRight = "";
    }
    notifyBrowseScrollRestored();
    pinBrowseScrollY();
    router.back();
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col justify-end sm:justify-center items-center p-0 transition-opacity duration-150 ease-out ${
        elevated ? "z-[60]" : "z-50"
      }`}
      style={{ opacity: paintOpacity }}
      role="presentation"
    >
      {/* Solid dim — backdrop-blur paints late and feels like a second flash. */}
      <div
        className="fixed inset-0 bg-slate-900/50"
        onClick={onDismiss}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full sm:w-[90vw] md:w-[80vw] lg:w-[1000px] h-[min(92dvh,880px)] max-h-[92dvh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden outline-none"
      >
        <span id={titleId} className="sr-only">
          {ui.productOfferHeading}
        </span>
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          aria-label={ui.compareProductsClose}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto w-full flex-1 min-h-0 pb-10 sm:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
