"use client";

import { motion } from "framer-motion";

export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 mr-auto bg-card text-foreground rounded-2xl rounded-bl-none border border-border px-4 py-3 shadow-sm max-w-[80%]">
            <span className="text-xs text-muted-foreground mr-1 font-medium">MedAgent</span>
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="block h-1.5 w-1.5 rounded-full bg-primary/60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}
