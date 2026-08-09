"use client";

import { useCompare } from "./CompareContext";
import { X, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { shouldUseNativeProductImage } from "@/lib/utils/product-image";
import {
  isComparePath,
  saveBrowseScrollAnchor,
  saveBrowseScrollY,
} from "@/lib/browse-scroll";

export function CompareBar() {
  const pathname = usePathname();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  // Already on the compare page — don't cover the product presentation.
  if (isComparePath(pathname)) return null;
  if (compareList.length === 0) return null;

  const compareUrl = `/compare-products?ids=${compareList.map(p => p.id).join(",")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] p-4 sm:p-6 transition-transform translate-y-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Header/Clear */}
        <div className="flex items-center gap-4 md:w-1/4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">Compară Produse</h3>
            <button 
              onClick={clearCompare}
              className="text-xs text-slate-500 hover:text-slate-800 underline mt-0.5"
            >
              Golește lista
            </button>
          </div>
        </div>

        {/* Selected Products */}
        <div className="flex items-center justify-center gap-4 flex-1 w-full overflow-x-auto pb-2 md:pb-0 px-2">
          {[0, 1].map((index) => {
            const product = compareList[index];
            
            return product ? (
              <div key={product.id} className="relative flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2 w-[240px] shrink-0">
                <button 
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="relative w-12 h-12 bg-white rounded-lg border border-slate-100 shrink-0 overflow-hidden">
                  {product.image && (
                    shouldUseNativeProductImage(product.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />
                    )
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider truncate">{product.brand}</p>
                  <p className="text-xs font-semibold text-slate-900 truncate">{product.title}</p>
                </div>
              </div>
            ) : (
              <div key={`empty-${index}`} className="flex items-center gap-3 border border-dashed border-slate-300 rounded-xl p-2 w-[240px] shrink-0 bg-slate-50/50 opacity-60">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xl opacity-20">+</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Adaugă încă un produs</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="md:w-1/4 flex justify-end w-full">
          <Link 
            href={compareUrl}
            scroll={false}
            className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm text-center transition-all ${
              compareList.length === 2 
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
                : "bg-slate-200 text-slate-400 pointer-events-none"
            }`}
            onClick={(e) => {
              if (compareList.length < 2) {
                e.preventDefault();
                return;
              }
              saveBrowseScrollY();
              saveBrowseScrollAnchor(compareList[0]?.id);
            }}
          >
            Compară Acum
          </Link>
        </div>

      </div>
    </div>
  );
}
