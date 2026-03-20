"use client";

import { useState, useEffect } from "react";

const AGE_GATE_KEY = "mm_age_verified";
const AGE_GATE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredVerification {
    verified: boolean;
    timestamp: number;
}

function getVerification(): boolean {
    if (typeof window === "undefined") return true; // SSR: assume verified to avoid flash
    try {
        const raw = localStorage.getItem(AGE_GATE_KEY);
        if (!raw) return false;
        const parsed: StoredVerification = JSON.parse(raw);
        if (!parsed.verified) return false;
        if (Date.now() - parsed.timestamp > AGE_GATE_TTL_MS) {
            localStorage.removeItem(AGE_GATE_KEY);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

function setVerification() {
    const data: StoredVerification = { verified: true, timestamp: Date.now() };
    localStorage.setItem(AGE_GATE_KEY, JSON.stringify(data));
}

export default function AgeGate() {
    const [verified, setVerified] = useState(true); // Default true to prevent SSR flash
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setVerified(getVerification());
    }, []);

    // Don't render anything until client-side mounted
    if (!mounted || verified) return null;

    function handleVerify() {
        setVerification();
        setVerified(true);
    }

    function handleDeny() {
        // Redirect away from the site
        window.location.href = "https://www.google.com";
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/95 backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Age verification"
        >
            <div className="w-full max-w-md mx-4 rounded-3xl bg-[#1e1e26] border border-white/10 p-8 md:p-10 text-center shadow-2xl">
                {/* Logo / Brand */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Mohawk Medibles
                    </h1>
                    <div className="w-16 h-0.5 bg-[#C8E63E] mx-auto mt-3" />
                </div>

                {/* Age Gate Content */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-white mb-3">
                        Are you 19 years of age or older?
                    </h2>
                    <p className="text-sm text-white/60 leading-relaxed">
                        You must be of legal age in your province or territory to enter this
                        website. By entering, you confirm that you are at least 19 years old and
                        agree to our{" "}
                        <a
                            href="/terms"
                            className="text-[#C8E63E] underline underline-offset-2 hover:opacity-80"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="/privacy"
                            className="text-[#C8E63E] underline underline-offset-2 hover:opacity-80"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleVerify}
                        className="w-full py-4 bg-[#C8E63E] text-[#0a0a0f] font-bold text-lg rounded-xl hover:bg-[#CAF880] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8E63E]/50 focus:ring-offset-2 focus:ring-offset-[#1e1e26]"
                    >
                        Yes, I am 19+
                    </button>
                    <button
                        onClick={handleDeny}
                        className="w-full py-4 border border-white/20 text-white/70 font-semibold text-lg rounded-xl hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#1e1e26]"
                    >
                        No, I am under 19
                    </button>
                </div>

                {/* Legal Note */}
                <p className="mt-6 text-[10px] text-white/30 leading-relaxed">
                    This site is intended for adults of legal cannabis consumption age only.
                    Cannabis products are for use by individuals 19 years of age or older in
                    Canada. Please consume responsibly.
                </p>
            </div>
        </div>
    );
}
