"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const STORAGE_KEY = "mm-push-prompt";
const VISIT_COUNT_KEY = "mm-visit-count";
const DISMISS_DAYS = 7;
const MIN_VISITS = 3;

/**
 * PushNotificationPrompt — Subtle banner prompting users to enable push notifications.
 * Shows after 3rd visit or first purchase. Dismisses for 7 days.
 * Dark theme with fire/amber accents, shadow-only depth.
 */
export default function PushNotificationPrompt() {
    const [visible, setVisible] = useState(false);
    const { isSupported, permission, isSubscribed, isLoading, subscribe } = usePushNotifications();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Don't show if already subscribed or permission denied
        if (isSubscribed || permission === "denied") return;

        // Don't show if not supported
        if (!isSupported) return;

        // Track visit count
        const visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10) + 1;
        localStorage.setItem(VISIT_COUNT_KEY, String(visitCount));

        // Check dismissal
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (dismissedAt) {
            const dismissDate = new Date(dismissedAt);
            const daysSince = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < DISMISS_DAYS) return;
        }

        // Check if user had a purchase (stored by checkout flow)
        const hasPurchased = localStorage.getItem("mm-has-purchased") === "true";

        // Show after MIN_VISITS visits or after first purchase
        // Show immediately — delay is handled by LazyWidgets stagger system
        if (visitCount >= MIN_VISITS || hasPurchased) {
            setVisible(true);
        }
    }, [isSupported, isSubscribed, permission]);

    const handleSubscribe = async () => {
        const ok = await subscribe();
        if (ok) {
            setVisible(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="bg-[#1a1a2e] rounded-2xl p-5 shadow-2xl shadow-amber-500/5 border border-amber-500/10">
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1">
                            Stay in the Loop
                        </h3>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                            Get notified about flash sales, order updates, and back-in-stock alerts.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSubscribe}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Enabling..." : "Enable Notifications"}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
