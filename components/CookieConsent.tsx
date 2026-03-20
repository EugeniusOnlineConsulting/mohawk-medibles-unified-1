"use client";

import { useState, useEffect, useCallback } from "react";

const COOKIE_CONSENT_KEY = "mm_cookie_consent";

interface CookiePreferences {
    necessary: boolean;    // Always true — required for site function
    analytics: boolean;    // Google Analytics, Vercel Analytics
    marketing: boolean;    // Retargeting, ad pixels
    functional: boolean;   // Live chat, preferences, recommendations
    timestamp: number;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
    timestamp: 0,
};

function getSavedPreferences(): CookiePreferences | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as CookiePreferences;
    } catch {
        return null;
    }
}

function savePreferences(prefs: CookiePreferences) {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...prefs, timestamp: Date.now() }));
}

/** Hook: read consent status from any component */
export function useCookieConsent(): CookiePreferences {
    const saved = getSavedPreferences();
    return saved ?? DEFAULT_PREFERENCES;
}

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);
    const [showManage, setShowManage] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

    useEffect(() => {
        const saved = getSavedPreferences();
        if (!saved) {
            // Show banner after a short delay to avoid blocking first paint
            const timer = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(timer);
        }
        setPreferences(saved);
    }, []);

    const accept = useCallback((prefs: CookiePreferences) => {
        savePreferences(prefs);
        setPreferences(prefs);
        setVisible(false);
        setShowManage(false);
    }, []);

    function handleAcceptAll() {
        accept({
            necessary: true,
            analytics: true,
            marketing: true,
            functional: true,
            timestamp: Date.now(),
        });
    }

    function handleNecessaryOnly() {
        accept({ ...DEFAULT_PREFERENCES, timestamp: Date.now() });
    }

    function handleSavePreferences() {
        accept(preferences);
    }

    function togglePref(key: keyof Omit<CookiePreferences, "necessary" | "timestamp">) {
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    if (!visible) return null;

    return (
        <div
            className="fixed bottom-0 inset-x-0 z-[70] p-4 md:p-6"
            role="dialog"
            aria-label="Cookie consent"
        >
            <div className="max-w-2xl mx-auto bg-[#1e1e26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Main Banner */}
                {!showManage && (
                    <div className="p-5 md:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-0.5 text-[#C8E63E]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-white mb-1">
                                    We Respect Your Privacy
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    We use cookies to improve your experience and analyze site traffic.
                                    Your data stays in Canada and is never sold. PIPEDA-compliant.{" "}
                                    <a
                                        href="/privacy"
                                        className="text-[#C8E63E] underline underline-offset-2 hover:opacity-80"
                                    >
                                        Privacy Policy
                                    </a>
                                </p>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-5 py-2.5 bg-[#C8E63E] text-[#0a0a0f] font-semibold text-sm rounded-lg hover:bg-[#CAF880] transition-colors"
                                    >
                                        Accept All
                                    </button>
                                    <button
                                        onClick={handleNecessaryOnly}
                                        className="px-5 py-2.5 border border-white/20 text-white/80 font-semibold text-sm rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        Necessary Only
                                    </button>
                                    <button
                                        onClick={() => setShowManage(true)}
                                        className="px-5 py-2.5 text-white/50 font-medium text-sm rounded-lg hover:text-white/80 transition-colors"
                                    >
                                        Manage Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Preferences Panel */}
                {showManage && (
                    <div className="p-5 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-white">
                                Cookie Preferences
                            </h3>
                            <button
                                onClick={() => setShowManage(false)}
                                className="text-white/40 hover:text-white/70 transition-colors"
                                aria-label="Close preferences"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Necessary — always on */}
                            <div className="flex items-center justify-between py-3 border-b border-white/10">
                                <div>
                                    <p className="text-sm font-medium text-white">Necessary</p>
                                    <p className="text-xs text-white/40 mt-0.5">
                                        Required for the website to function. Cannot be disabled.
                                    </p>
                                </div>
                                <div className="w-11 h-6 bg-[#C8E63E]/30 rounded-full relative cursor-not-allowed">
                                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-[#C8E63E] rounded-full" />
                                </div>
                            </div>

                            {/* Analytics */}
                            <CookieToggle
                                label="Analytics"
                                description="Helps us understand how visitors use the site to improve your experience."
                                checked={preferences.analytics}
                                onChange={() => togglePref("analytics")}
                            />

                            {/* Functional */}
                            <CookieToggle
                                label="Functional"
                                description="Enables features like live chat, saved preferences, and recommendations."
                                checked={preferences.functional}
                                onChange={() => togglePref("functional")}
                            />

                            {/* Marketing */}
                            <CookieToggle
                                label="Marketing"
                                description="Used to deliver relevant advertisements and measure campaign effectiveness."
                                checked={preferences.marketing}
                                onChange={() => togglePref("marketing")}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSavePreferences}
                                className="flex-1 px-5 py-2.5 bg-[#C8E63E] text-[#0a0a0f] font-semibold text-sm rounded-lg hover:bg-[#CAF880] transition-colors"
                            >
                                Save Preferences
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-5 py-2.5 border border-white/20 text-white/80 font-semibold text-sm rounded-lg hover:bg-white/5 transition-colors"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Toggle Sub-component ──────────────────────────────── */

function CookieToggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-white/40 mt-0.5">{description}</p>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                aria-label={`${label} cookies`}
                onClick={onChange}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                    checked ? "bg-[#C8E63E]/30" : "bg-white/10"
                }`}
            >
                <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
                        checked
                            ? "right-0.5 bg-[#C8E63E]"
                            : "left-0.5 bg-white/40"
                    }`}
                />
            </button>
        </div>
    );
}
