"use client";

import { useState, useEffect, useMemo } from "react";
import { Gift, Check, ChevronRight, Sparkles } from "lucide-react";
import { getEligibleGifts, getNextGiftTier, type GiftTier } from "@/lib/giftTiers";

interface GiftTierProgressProps {
  cartTotal: number;
  compact?: boolean; // For cart drawer (less height)
}

export default function GiftTierProgress({ cartTotal, compact = false }: GiftTierProgressProps) {
  const [tiers, setTiers] = useState<GiftTier[]>([]);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [prevEligibleCount, setPrevEligibleCount] = useState(0);

  useEffect(() => {
    fetch("/api/trpc/giftTiers.getAll")
      .then((r) => r.json())
      .then((data) => {
        const result = data?.result?.data?.json ?? data?.result?.data ?? [];
        if (Array.isArray(result)) setTiers(result);
      })
      .catch(() => {});
  }, []);

  const eligible = useMemo(() => getEligibleGifts(cartTotal, tiers), [cartTotal, tiers]);
  const next = useMemo(() => getNextGiftTier(cartTotal, tiers), [cartTotal, tiers]);

  // Detect newly unlocked tier for confetti effect
  useEffect(() => {
    if (eligible.length > prevEligibleCount && prevEligibleCount > 0) {
      const newest = eligible[eligible.length - 1];
      setJustUnlocked(newest.id);
      const timer = setTimeout(() => setJustUnlocked(null), 3000);
      return () => clearTimeout(timer);
    }
    setPrevEligibleCount(eligible.length);
  }, [eligible.length]);

  if (tiers.length === 0) return null;

  // Progress percentage toward next tier (or 100% if all unlocked)
  const maxThreshold = Math.max(...tiers.map((t) => t.threshold));
  const progressPercent = next
    ? Math.min((cartTotal / next.tier.threshold) * 100, 100)
    : 100;

  // Overall progress across all tiers
  const overallPercent = Math.min((cartTotal / maxThreshold) * 100, 100);

  return (
    <div className={`rounded-xl border border-border bg-white dark:bg-card ${compact ? "p-3" : "p-4"}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h4 className={`font-bold text-forest dark:text-cream ${compact ? "text-sm" : "text-base"}`}>
            Free Gift Rewards
          </h4>
          {!compact && (
            <p className="text-xs text-muted-foreground">
              Spend more, earn free gifts with your order!
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-3">
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-green-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        {/* Tier markers */}
        <div className="absolute top-0 left-0 w-full h-2.5 pointer-events-none">
          {tiers
            .filter((t) => t.active)
            .map((tier) => {
              const pos = (tier.threshold / maxThreshold) * 100;
              const unlocked = cartTotal >= tier.threshold;
              return (
                <div
                  key={tier.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${pos}%` }}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                      unlocked
                        ? "bg-green-500 border-green-600 scale-110"
                        : "bg-white dark:bg-zinc-700 border-muted-foreground/30"
                    }`}
                  >
                    {unlocked && (
                      <Check className="h-2 w-2 text-white mx-auto mt-[1px]" />
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Next tier nudge */}
      {next && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 mb-3">
          <ChevronRight className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Add <span className="font-bold">${next.remaining.toFixed(2)}</span> more to unlock{" "}
            <span className="font-bold">{next.tier.giftName}</span>!
          </p>
        </div>
      )}

      {/* Unlocked gifts */}
      {eligible.length > 0 && (
        <div className="space-y-1.5">
          {eligible.map((gift) => (
            <div
              key={gift.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 ${
                justUnlocked === gift.id
                  ? "bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 scale-[1.02]"
                  : "bg-green-50/50 dark:bg-green-900/10"
              }`}
            >
              <div className="p-1 rounded-full bg-green-500/20 flex-shrink-0">
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300 truncate">
                  {gift.giftName}
                </p>
                {!compact && (
                  <p className="text-[10px] text-green-700/70 dark:text-green-400/60 truncate">
                    {gift.giftDescription}
                  </p>
                )}
              </div>
              {justUnlocked === gift.id && (
                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* All unlocked message */}
      {!next && eligible.length > 0 && (
        <div className="text-center mt-2 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-green-50 dark:from-amber-900/20 dark:to-green-900/20">
          <p className="text-xs font-bold text-forest dark:text-cream flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            All gifts unlocked! You&apos;re getting the VIP treatment.
          </p>
        </div>
      )}

      {/* Upcoming tiers (collapsed view) */}
      {!compact && next && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Upcoming Rewards</p>
          <div className="space-y-1">
            {tiers
              .filter((t) => t.active && cartTotal < t.threshold)
              .slice(0, 3)
              .map((tier) => (
                <div key={tier.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{tier.giftName}</span>
                  <span className="font-medium text-forest dark:text-cream">${tier.threshold}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
