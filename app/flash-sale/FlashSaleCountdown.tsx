"use client";

import { useState, useEffect, useCallback } from "react";

interface FlashSaleCountdownProps {
    endTime: string;
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
}

function calcTimeLeft(endTime: string): TimeLeft {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }
    return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
    };
}

export default function FlashSaleCountdown({ endTime }: FlashSaleCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, expired: false });

    const tick = useCallback(() => {
        setTimeLeft(calcTimeLeft(endTime));
    }, [endTime]);

    useEffect(() => {
        tick(); // sync on mount
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [tick]);

    if (timeLeft.expired) {
        return (
            <p className="text-lg font-bold text-red-400">
                This sale has ended!
            </p>
        );
    }

    const blocks = [
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
    ];

    return (
        <div className="flex items-center justify-center gap-3">
            {blocks.map((block, i) => (
                <div key={block.label} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl md:text-5xl font-mono font-bold text-foreground tabular-nums">
                            {String(block.value).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                            {block.label}
                        </span>
                    </div>
                    {i < blocks.length - 1 && (
                        <span className="text-3xl font-bold text-muted-foreground/50 -mt-4">:</span>
                    )}
                </div>
            ))}
        </div>
    );
}
