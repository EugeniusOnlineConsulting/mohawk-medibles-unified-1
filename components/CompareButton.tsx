"use client";

import { useState, useEffect } from "react";
import { GitCompareArrows } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";

interface CompareButtonProps {
  slug: string;
  className?: string;
}

export default function CompareButton({ slug, className = "" }: CompareButtonProps) {
  const { add, has, count } = useCompare();
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isComparing = mounted && has(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = add(slug);

    if (result === "added") {
      const newCount = count + 1;
      setToast(`Added to comparison (${newCount}/4)`);
    } else if (result === "removed") {
      setToast("Removed from comparison");
    } else if (result === "full") {
      setToast("Comparison full (4 max)");
    }

    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
          isComparing
            ? "bg-forest text-white dark:bg-lime dark:text-black"
            : "bg-white/90 dark:bg-black/50 backdrop-blur text-muted-foreground hover:text-forest dark:hover:text-lime hover:bg-white dark:hover:bg-black/70"
        }`}
        aria-label={isComparing ? "Remove from comparison" : "Add to comparison"}
        title={isComparing ? "Remove from comparison" : "Compare this product"}
      >
        <GitCompareArrows className="h-4 w-4" />
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-50 px-3 py-1.5 bg-card text-foreground text-xs font-medium rounded-lg shadow-lg border border-border animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
