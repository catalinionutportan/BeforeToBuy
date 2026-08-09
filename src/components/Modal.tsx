"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Timeout helps with entrance animation
    setIsOpen(true);
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    setIsOpen(false);
    setTimeout(() => {
      router.back();
    }, 200); // Wait for transition
  }

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 m-0 w-full h-full max-w-none max-h-none bg-transparent transition-all duration-300 ease-out`}
      onClose={onDismiss}
    >
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${isOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={onDismiss} 
      />

      <div 
        className={`relative w-full sm:w-[90vw] md:w-[80vw] lg:w-[1000px] sm:max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out origin-bottom sm:origin-center
          ${isOpen ? "translate-y-0 sm:scale-100 opacity-100" : "translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"}
        `}
      >
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
    </dialog>
  );
}