"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { ALL_GRADES, GRADE_INFO } from "@/lib/gradeMapping";

export default function GradeExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-forest dark:text-cream">
          <Info className="h-4 w-4 text-muted-foreground" />
          What do flower grades mean?
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            We grade our flower products based on quality, potency, terpene profile, and cultivation methods.
            Grades are assigned by our expert budtenders and verified through lab testing.
          </p>
          {ALL_GRADES.map((grade) => {
            const info = GRADE_INFO[grade];
            return (
              <div
                key={grade}
                className={`flex items-start gap-3 p-2.5 rounded-lg ${info.bgColor} border ${info.borderColor}`}
              >
                <span className={`font-black text-sm min-w-[48px] ${info.color}`}>
                  {info.shortLabel}
                </span>
                <div>
                  <p className={`text-xs font-semibold ${info.color}`}>
                    {info.label.split(" — ")[1]}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{info.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
