"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownTimerProps {
  endDate: string;
  size?: "sm" | "md" | "lg";
  showDays?: boolean;
  showLabels?: boolean;
  onExpired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalHours: number;
}

function calcTimeLeft(endDate: string): TimeLeft {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalHours: 0 };
  }
  const totalHours = diff / (1000 * 60 * 60);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
    totalHours,
  };
}

/** Urgency color based on time remaining */
function getUrgencyColor(totalHours: number): string {
  if (totalHours < 4) return "text-red-500 border-red-500/30 bg-red-500/10";
  if (totalHours < 24) return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
  return "text-green-500 border-green-500/30 bg-green-500/10";
}

const sizeConfig = {
  sm: {
    digit: "text-lg px-1.5 py-0.5",
    label: "text-[8px]",
    colon: "text-sm",
    gap: "gap-1",
  },
  md: {
    digit: "text-2xl px-2.5 py-1",
    label: "text-[9px]",
    colon: "text-xl",
    gap: "gap-2",
  },
  lg: {
    digit: "text-4xl md:text-5xl px-3 py-2",
    label: "text-[10px]",
    colon: "text-3xl",
    gap: "gap-3",
  },
};

export default function CountdownTimer({
  endDate,
  size = "md",
  showDays = true,
  showLabels = true,
  onExpired,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
    totalHours: 999,
  });

  const tick = useCallback(() => {
    const tl = calcTimeLeft(endDate);
    setTimeLeft(tl);
    if (tl.expired && onExpired) onExpired();
  }, [endDate, onExpired]);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  if (timeLeft.expired) {
    return (
      <span className="text-red-400 font-bold text-sm">Expired</span>
    );
  }

  const config = sizeConfig[size];
  const urgency = getUrgencyColor(timeLeft.totalHours);

  const blocks = [
    ...(showDays && timeLeft.days > 0
      ? [{ label: "Days", value: timeLeft.days }]
      : []),
    { label: "Hrs", value: showDays ? timeLeft.hours : Math.floor(timeLeft.totalHours) },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className={`inline-flex items-center ${config.gap}`}>
      {blocks.map((block, i) => (
        <div key={block.label} className={`flex items-center ${config.gap}`}>
          <div className="flex flex-col items-center">
            <span
              className={`${config.digit} font-mono font-bold tabular-nums rounded-lg border ${urgency}`}
            >
              {String(block.value).padStart(2, "0")}
            </span>
            {showLabels && (
              <span
                className={`${config.label} uppercase tracking-widest text-muted-foreground mt-1`}
              >
                {block.label}
              </span>
            )}
          </div>
          {i < blocks.length - 1 && (
            <span className={`${config.colon} font-bold text-muted-foreground/50 ${showLabels ? "-mt-4" : ""}`}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
