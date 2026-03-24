"use client";

import Link from "next/link";
import { Cloud, Zap, Leaf, Moon, Heart, ArrowRight } from "lucide-react";
import { INTENTS, type IntentConfig } from "@/lib/intentMapping";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud,
    Zap,
    Leaf,
    Moon,
    Heart,
};

const CARD_STYLES: Record<string, { bg: string; glow: string; iconColor: string }> = {
    relax: {
        bg: "bg-gradient-to-br from-purple-950/60 to-violet-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(168,85,247,0.3)]",
        iconColor: "text-purple-400",
    },
    energize: {
        bg: "bg-gradient-to-br from-amber-950/60 to-orange-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(245,158,11,0.3)]",
        iconColor: "text-amber-400",
    },
    balance: {
        bg: "bg-gradient-to-br from-emerald-950/60 to-teal-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(16,185,129,0.3)]",
        iconColor: "text-emerald-400",
    },
    sleep: {
        bg: "bg-gradient-to-br from-indigo-950/60 to-blue-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(99,102,241,0.3)]",
        iconColor: "text-indigo-400",
    },
    relief: {
        bg: "bg-gradient-to-br from-rose-950/60 to-red-950/40",
        glow: "shadow-[0_8px_40px_-12px_rgba(244,63,94,0.3)]",
        iconColor: "text-rose-400",
    },
};

function MoodPill({ intent }: { intent: IntentConfig }) {
    const Icon = ICON_MAP[intent.icon] ?? Leaf;
    const styles = CARD_STYLES[intent.key];

    return (
        <Link
            href={`/shop?intent=${intent.key}`}
            className={`group relative flex flex-col items-center p-5 md:p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.04] hover:-translate-y-1 ${styles.bg} ${styles.glow}`}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/5 to-transparent" />
            <Icon className={`w-7 h-7 md:w-8 md:h-8 mb-3 transition-transform duration-300 group-hover:scale-110 ${styles.iconColor}`} />
            <span className="text-sm md:text-base font-bold text-white mb-1">{intent.label}</span>
            <span className="text-[11px] md:text-xs text-white/40 text-center">{intent.tagline}</span>
        </Link>
    );
}

export default function ShopByMood() {
    return (
        <section className="py-14 md:py-20 px-4 bg-[#0a0a0f]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                        How Do You Want{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            to Feel?
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-white/40 max-w-md mx-auto">
                        Skip the science. Shop by the experience you&apos;re looking for.
                    </p>
                </div>

                {/* Mood Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {INTENTS.map((intent) => (
                        <MoodPill key={intent.key} intent={intent} />
                    ))}
                </div>

                {/* Browse all moods link */}
                <div className="text-center mt-8">
                    <Link
                        href="/shop-by-mood"
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white transition-colors"
                    >
                        Explore all moods
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
