"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Product overlay. Avoids native <dialog>.showModal() because focusing a
 * late-in-DOM dialog scrolls the document to the page bottom under Next's
 * @modal slot.
 */
export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const scrollYRef = useRef(0);

  useEffect(() => {
    scrollYRef.current = window.scrollY;

    // Freeze background exactly where the user was (no jump to top/bottom).
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

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
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dismiss closes via router
  }, []);

  function onDismiss() {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 160);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0"
      role="presentation"
    >
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onDismiss}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full sm:w-[90vw] md:w-[80vw] lg:w-[1000px] sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden outline-none transition-opacity duration-200 ease-out
          ${isOpen ? "opacity-100" : "opacity-0"}
        `}
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
