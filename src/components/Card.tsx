import React from "react";
import { cn } from "./utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors duration-200", className)}>
      {children}
    </div>
  );
}
