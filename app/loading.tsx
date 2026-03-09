"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-forest text-cream">
            <div className="flex flex-col items-center gap-4">
                {/* Animated Smoke Text */}
                <h2 className="text-3xl font-bold animate-pulse">Loading Mohawk Medibles...</h2>

                {/* Bear/Smoke Loading Bar */}
                <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-leaf to-emerald-400"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <p className="text-sm opacity-50">Curating premium inventory...</p>
            </div>
        </div>
    );
}
