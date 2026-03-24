"use client";

import Link from "next/link";
import { Cloud, Zap, Leaf, Moon, Heart, ArrowRight, Sparkles } from "lucide-react";
import { INTENTS, type IntentConfig } from "@/lib/intentMapping";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud,
    Zap,
    Leaf,
    Moon,
    Heart,
};

// Each mood card has unique gradient styling (dark theme, premium feel)
const CARD_STYLES: Record<string, { bg: string; glow: string; iconBg: string }> = {
    relax: {
        bg: "bg-gradient-to-br from-purple-950/80 via-purple-900/50 to-violet-950/80",
        glow: "shadow-[0_0_60px_-15px_rgba(168,85,247,0.35)]",
        iconBg: "bg-purple-500/20 text-purple-300",
    },
    energize: {
        bg: "bg-gradient-to-br from-amber-950/80 via-orange-900/50 to-yellow-950/80",
        glow: "shadow-[0_0_60px_-15px_rgba(245,158,11,0.35)]",
        iconBg: "bg-amber-500/20 text-amber-300",
    },
    balance: {
        bg: "bg-gradient-to-br from-emerald-950/80 via-teal-900/50 to-green-950/80",
        glow: "shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]",
        iconBg: "bg-emerald-500/20 text-emerald-300",
    },
    sleep: {
        bg: "bg-gradient-to-br from-indigo-950/80 via-blue-900/50 to-slate-950/80",
        glow: "shadow-[0_0_60px_-15px_rgba(99,102,241,0.35)]",
        iconBg: "bg-indigo-500/20 text-indigo-300",
    },
    relief: {
        bg: "bg-gradient-to-br from-rose-950/80 via-red-900/50 to-pink-950/80",
        glow: "shadow-[0_0_60px_-15px_rgba(244,63,94,0.35)]",
        iconBg: "bg-rose-500/20 text-rose-300",
    },
};

function MoodCard({ intent }: { intent: IntentConfig }) {
    const Icon = ICON_MAP[intent.icon] ?? Leaf;
    const styles = CARD_STYLES[intent.key];

    return (
        <Link
            href={`/shop?intent=${intent.key}`}
            className={`group relative flex flex-col items-center justify-center p-8 md:p-10 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 ${styles.bg} ${styles.glow}`}
        >
            {/* Subtle animated background glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-white/5 to-transparent" />

            {/* Icon */}
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 ${styles.iconBg}`}>
                <Icon className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            {/* Label */}
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                {intent.label}
            </h3>

            {/* Tagline */}
            <p className="text-sm md:text-base text-white/60 mb-1 text-center">
                {intent.tagline}
            </p>

            {/* Description */}
            <p className="text-xs md:text-sm text-white/40 text-center max-w-[240px] mb-5 leading-relaxed">
                {intent.description}
            </p>

            {/* CTA arrow */}
            <div className="flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Shop {intent.label}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

export default function ShopByMoodClient() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] pt-28 pb-20">
            <div className="container mx-auto px-6">
                {/* Hero */}
                <div className="text-center mb-14 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-white/50 text-xs font-medium tracking-widest uppercase mb-6 ring-1 ring-white/10">
                        <Sparkles className="w-3.5 h-3.5" />
                        Intent-Based Shopping
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5 leading-[1.1]">
                        How Do You Want{" "}
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            to Feel?
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                        Skip the science. Shop by the experience you&apos;re looking for.
                        We&apos;ll match you with the perfect products.
                    </p>
                </div>

                {/* Mood Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
                    {INTENTS.map((intent) => (
                        <MoodCard key={intent.key} intent={intent} />
                    ))}
                </div>

                {/* Bottom explainer */}
                <div className="mt-16 text-center max-w-xl mx-auto">
                    <p className="text-sm text-white/30 leading-relaxed">
                        Products are matched to moods based on strain type, terpene profiles,
                        effects data, and product characteristics. A single product can appear
                        under multiple moods.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                        Or browse the full collection
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
