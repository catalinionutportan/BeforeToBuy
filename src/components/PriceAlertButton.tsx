"use client";

import { useState } from "react";
import { Bell, Heart } from "lucide-react";
import { Product } from "@/types";

export function PriceAlertButton({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          email,
          countryCode: product.targetCountries?.[0] || "RO",
          targetPrice: product.basePrice ? product.basePrice * 0.9 : 0 // Anunță la o scădere de 10%
        })
      });
      
      if (!res.ok) throw new Error();
      setStatus("success");
      setTimeout(() => setIsOpen(false), 2000);
    } catch {
      setStatus("error");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="absolute top-2 right-12 z-20 p-2 rounded-full shadow-sm border transition-all duration-200 flex items-center justify-center bg-white/90 border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 hover:bg-white"
        title="Alertă de Preț / Favorite"
      >
        <Heart className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div 
      className="absolute top-2 right-2 z-30 bg-white rounded-xl shadow-lg border border-slate-200 p-3 w-64 origin-top-right animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-rose-500" />
          Alertă de scădere preț
        </h4>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
      
      {status === "success" ? (
        <div className="text-xs text-emerald-600 font-medium py-2 bg-emerald-50 rounded-lg text-center">
          Gata! Te vom anunța pe email.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            required
            placeholder="Adresa ta de email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
          />
          <button 
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-1.5 rounded-lg transition-colors"
          >
            {status === "loading" ? "Se activează..." : "Activează Alerta"}
          </button>
          {status === "error" && (
            <p className="text-[10px] text-red-500 mt-1">O eroare a apărut. Încearcă din nou.</p>
          )}
        </form>
      )}
    </div>
  );
}
