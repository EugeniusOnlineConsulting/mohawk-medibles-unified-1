"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface PriceMatchBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

export default function PriceMatchBadge({ size = "sm", className = "" }: PriceMatchBadgeProps) {
  if (size === "sm") {
    return (
      <Link
        href="/price-match"
        className={`inline-flex items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase hover:bg-emerald-500/20 transition-colors ${className}`}
      >
        <ShieldCheck className="h-3 w-3" />
        Price Match
      </Link>
    );
  }

  return (
    <Link
      href="/price-match"
      className={`inline-flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase hover:bg-emerald-500/20 transition-colors ${className}`}
    >
      <ShieldCheck className="h-4 w-4" />
      Price Match Guarantee
    </Link>
  );
}
