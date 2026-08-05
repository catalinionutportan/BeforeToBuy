"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CategoryBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function CategoryBreadcrumbs({ items }: CategoryBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-emerald-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-emerald-800" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
