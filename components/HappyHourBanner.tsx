"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Flame } from "lucide-react";

interface ActiveHappyHour {
  id: string;
  name: string;
  discountPercent: number;
  categorySlug: string | null;
  startHour: number;
  endHour: number;
  daysOfWeek: number[];
}

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getSecondsUntilEnd(endHour: number): number {
  const now = new Date();
  const eastern = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  const currentHour = eastern.getHours();
  const currentMin = eastern.getMinutes();
  const currentSec = eastern.getSeconds();

  let hoursLeft = endHour - currentHour;
  if (hoursLeft <= 0) hoursLeft += 24; // overnight wrap
  const totalSeconds = hoursLeft * 3600 - currentMin * 60 - currentSec;
  return Math.max(0, totalSeconds);
}

export default function HappyHourBanner() {
  const [happyHours, setHappyHours] = useState<ActiveHappyHour[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Fetch active happy hours
  useEffect(() => {
    fetch("/api/trpc/happyHour.getActive?input={}")
      .then((r) => r.json())
      .then((res) => {
        const data = res?.result?.data;
        if (Array.isArray(data) && data.length > 0) {
          setHappyHours(data);
          setCountdown(getSecondsUntilEnd(data[0].endHour));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (happyHours.length === 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Re-fetch when timer hits zero
          clearInterval(interval);
          setHappyHours([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [happyHours]);

  // Don't render if no active happy hours, not loaded, or dismissed
  if (!loaded || happyHours.length === 0 || dismissed) return null;

  // Pick the "best" happy hour to display (highest discount)
  const primary = happyHours.reduce((best, hh) =>
    hh.discountPercent > best.discountPercent ? hh : best
  );

  const categoryLabel = primary.categorySlug
    ? primary.categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Everything";

  return (
    <div className="relative overflow-hidden z-40">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/80 via-orange-500/80 to-red-600/80" />

      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
          animation: "shimmer 2s infinite linear",
        }}
      />

      <div className="relative flex items-center justify-center gap-3 px-4 py-2.5 text-white">
        <Flame className="w-5 h-5 text-yellow-200 animate-bounce shrink-0" />

        <p className="text-sm md:text-base font-bold tracking-wide text-center">
          <span className="uppercase">Happy Hour!</span>
          {" "}
          <span className="font-black">{primary.discountPercent}% off</span>
          {" "}
          <span className="font-medium">{categoryLabel}</span>
          {" — "}
          <span className="font-mono tabular-nums">
            Ends in {formatTimeRemaining(countdown)}
          </span>
        </p>

        <Flame className="w-5 h-5 text-yellow-200 animate-bounce shrink-0 hidden sm:block" />

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss happy hour banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CSS animation for shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
