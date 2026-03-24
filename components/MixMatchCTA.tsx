"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function MixMatchCTA() {
    return (
        <section className="container mx-auto px-6 py-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/60 via-emerald-900/40 to-green-800/60 p-8 md:p-12">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-bold tracking-wider uppercase mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            New Feature
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
                            Build Your Own Ounce
                        </h2>
                        <p className="text-white/70 text-sm md:text-base max-w-lg leading-relaxed">
                            Mix your favorite strains and save up to <span className="text-green-400 font-bold">20% off</span>.
                            Choose from 40+ premium flower strains and build a custom bundle.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                                Half Oz — 10% Off
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                                Full Oz — 15% Off
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold">
                                Double Oz — 20% Off
                            </span>
                        </div>
                    </div>
                    <Link
                        href="/mix-match"
                        className="group flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-sm uppercase tracking-wider rounded-full transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-400/40 shrink-0"
                    >
                        Start Building
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
