"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product } from "@/types";

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const COMPARE_STORAGE_KEY = "btb:compare-list:v1";
const LEGACY_COMPARE_STORAGE_KEY = "compareList";

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const compareListRef = useRef<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(COMPARE_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_COMPARE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const next = parsed.slice(0, 2) as Product[];
          compareListRef.current = next;
          setCompareList(next);
          localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
        }
      }
      localStorage.removeItem(LEGACY_COMPARE_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to parse compareList", e);
    }
  }, []);

  const persistCompareList = (next: Product[]) => {
    try {
      if (next.length > 0) localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private mode; comparison still works in memory.
    }
  };

  const addToCompare = (product: Product) => {
    const prev = compareListRef.current;
    if (prev.some((item) => item.id === product.id)) return;
    const next = prev.length >= 2 ? [prev[1], product] : [...prev, product];
    compareListRef.current = next;
    setCompareList(next);
    persistCompareList(next);
  };

  const removeFromCompare = (productId: string) => {
    const next = compareListRef.current.filter((product) => product.id !== productId);
    compareListRef.current = next;
    setCompareList(next);
    persistCompareList(next);
  };

  const clearCompare = () => {
    compareListRef.current = [];
    setCompareList([]);
    persistCompareList([]);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
