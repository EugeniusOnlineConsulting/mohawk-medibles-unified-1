"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { type GradeKey, GRADE_INFO, getProductGrade } from "@/lib/gradeMapping";

interface GradeBadgeProps {
  product: {
    grade?: string | null;
    price: number;
    category: string;
    specs?: { weight?: string };
  };
  showTooltip?: boolean;
  size?: "sm" | "md";
}

export default function GradeBadge({ product, showTooltip = true, size = "sm" }: GradeBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const grade = getProductGrade(product);

  if (!grade) return null;

  const info = GRADE_INFO[grade];
  const sizeClasses = size === "sm"
    ? "px-1.5 py-0.5 text-[10px]"
    : "px-2 py-1 text-xs";

  return (
    <div className="relative inline-flex items-center">
      <span
        className={`inline-flex items-center gap-0.5 font-bold rounded border ${sizeClasses} ${info.color} ${info.bgColor} ${info.borderColor} cursor-default`}
        onMouseEnter={() => showTooltip && setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
      >
        {info.shortLabel}
        {showTooltip && <Info className="h-2.5 w-2.5 opacity-50" />}
      </span>

      {/* Tooltip */}
      {tooltipOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-xl border border-border text-xs pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-150">
          <p className={`font-bold ${info.color} mb-0.5`}>{info.label}</p>
          <p className="text-muted-foreground">{info.description}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-white dark:bg-zinc-800 border-r border-b border-border" />
        </div>
      )}
    </div>
  );
}
