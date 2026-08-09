"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("compareList");
      if (saved) {
        setCompareList(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse compareList", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product: Product) => {
    setCompareList((prev) => {
      // Don't add if already exists
      if (prev.some((p) => p.id === product.id)) return prev;
      // Max 2 products for now
      if (prev.length >= 2) {
        return [prev[1], product]; // Replace the oldest one
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
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
