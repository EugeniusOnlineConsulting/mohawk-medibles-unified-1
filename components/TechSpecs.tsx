"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { getFeaturedProducts, getShortName, PRODUCTS } from "@/lib/productData";

export function TechSpecs() {
    // Pick the first featured product, fall back to first product in catalog
    const featured = getFeaturedProducts();
    const hero = featured[0] ?? PRODUCTS[0];

    // Guard: if the catalog is somehow empty, render nothing
    if (!hero || !hero.specs) return null;

    const specs = [
        { label: "THC", value: hero.specs.thc, desc: `${hero.specs.type} Potency` },
        { label: "Terpenes", value: hero.specs.terpenes?.slice(0, 2).join(" · ") || "N/A", desc: "Dominant Profile" },
        { label: "Lineage", value: hero.specs.type, desc: hero.specs.lineage },
        { label: "Weight", value: hero.specs.weight, desc: "Per Unit" },
    ];

    return (
        <section className="py-32 bg-black text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                {/* Left: Text Specs */}
                <div className="flex-1 space-y-12">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-4xl font-medium tracking-tight"
                    >
                        {getShortName(hero)}. <br />
                        <span className="text-zinc-500">Engineered by Nature.</span>
                    </motion.h2>

                    <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                        {hero.eeatNarrative}
                    </p>

                    <div className="grid grid-cols-2 gap-y-12 gap-x-8">
                        {specs.map((spec, i) => (
                            <motion.div
                                key={spec.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="space-y-1"
                            >
                                <div className="text-4xl font-bold tracking-tighter">{spec.value}</div>
                                <div className="text-sm font-medium text-white/80 uppercase tracking-widest">{spec.label}</div>
                                <div className="text-xs text-zinc-500">{spec.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right: Visual */}
                <div className="flex-1 relative h-[600px] w-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-900/20 to-transparent rounded-full blur-[100px]" />
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="relative w-full h-full flex items-center justify-center"
                    >
                        <div className="w-80 h-80 rounded-full bg-gradient-to-br from-green-900/40 via-zinc-900 to-black flex items-center justify-center border border-green-500/10">
                            <Leaf className="h-32 w-32 text-green-600/50" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
