"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { readBrowseScrollY } from "@/lib/browse-scroll";

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
    // Prefer the scroll saved on card click — window.scrollY is often already
    // wrong here (focus on the modal node at the end of the DOM → page bottom).
    const saved = readBrowseScrollY();
    scrollYRef.current =
      saved != null ? saved : Math.max(0, Math.floor(window.scrollY));

    const { body, documentElement } = document;
    const previous = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: documentElement.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    // Undo any focus-driven jump that happened before this effect ran.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

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
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.left = previous.bodyLeft;
      body.style.right = previous.bodyRight;
      body.style.width = previous.bodyWidth;
      body.style.overflow = previous.bodyOverflow;
      documentElement.style.overflow = previous.htmlOverflow;
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
