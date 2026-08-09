"use client";

import { useCompare } from "./CompareContext";
import { Product } from "@/types";
import { Scale } from "lucide-react";

export function CompareButton({ product }: { product: Product }) {
  const { compareList, addToCompare, removeFromCompare } = useCompare();

  const isSelected = compareList.some((p) => p.id === product.id);
  const isFull = compareList.length >= 2 && !isSelected;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSelected) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isFull}
      className={`absolute top-2 right-2 z-20 p-2 rounded-full shadow-sm border transition-all duration-200 flex items-center justify-center 
        ${isSelected 
          ? "bg-orange-500 border-orange-600 text-white" 
          : isFull 
            ? "bg-white/80 border-slate-200 text-slate-300 cursor-not-allowed" 
            : "bg-white/90 border-slate-200 text-slate-500 hover:text-orange-500 hover:border-orange-200 hover:bg-white"
        }`}
      title={isSelected ? "Elimină din comparare" : "Adaugă la comparare"}
      aria-label={isSelected ? "Elimină din comparare" : "Adaugă la comparare"}
    >
      <Scale className="w-4 h-4" />
    </button>
  );
}
