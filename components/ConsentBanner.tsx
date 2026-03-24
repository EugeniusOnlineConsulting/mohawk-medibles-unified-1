"use client";

import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "mm_analytics_consent";

export type ConsentStatus = "pending" | "accepted" | "declined";

export function getConsentStatus(): ConsentStatus {
    if (typeof window === "undefined") return "pending";
    return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) || "pending";
}

export default function ConsentBanner() {
    const [status, setStatus] = useState<ConsentStatus>("accepted"); // SSR default: don't flash
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const saved = getConsentStatus();
        setStatus(saved);
        if (saved === "pending") {
            // Show immediately — delay is handled by LazyWidgets stagger system
            setVisible(true);
        }
    }, []);

    if (!visible || status !== "pending") return null;

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setStatus("accepted");
        setVisible(false);
        // Reload to let Analytics component pick up consent
        window.location.reload();
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, "declined");
        setStatus("declined");
        setVisible(false);
    };

    return (
        <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6" role="dialog" aria-label="Cookie consent">
            <div className="max-w-2xl mx-auto bg-white dark:bg-[#0D1F0A] border border-border rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-start gap-4">
                    <Shield className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-foreground/80 dark:text-cream/80 leading-relaxed">
                            We use cookies to improve your experience and analyze site traffic.
                            Your data stays in Canada and is never sold.{" "}
                            <a href="/privacy" className="text-forest dark:text-lime underline underline-offset-2 hover:text-forest/80 dark:hover:text-lime/80 font-medium">
                                Privacy Policy
                            </a>
                        </p>
                        <div className="flex gap-3 mt-4">
                            <Button
                                onClick={handleAccept}
                                size="sm"
                                variant="brand"
                                className="rounded-full px-6"
                            >
                                Accept
                            </Button>
                            <Button
                                onClick={handleDecline}
                                size="sm"
                                variant="outline"
                                className="rounded-full px-6 text-muted-foreground border-border hover:text-foreground dark:hover:text-cream"
                            >
                                Decline
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={handleDecline}
                        className="text-muted-foreground/60 hover:text-foreground dark:hover:text-cream transition-colors"
                        aria-label="Dismiss cookie notice"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
