"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AgentChatWidget = dynamic(() => import("@/components/AgentChatWidget"), { ssr: false });
const AgeGate = dynamic(() => import("@/components/AgeGate"), { ssr: false });
const ConsentBanner = dynamic(() => import("@/components/ConsentBanner"), { ssr: false });
const BackToTop = dynamic(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })), { ssr: false });
const ExitIntentPopup = dynamic(() => import("@/components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })), { ssr: false });
const FirstTimeBuyerPopup = dynamic(() => import("@/components/FirstTimeBuyerPopup").then(m => ({ default: m.FirstTimeBuyerPopup })), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette").then(m => ({ default: m.CommandPalette })), { ssr: false });
const LivePurchaseNotification = dynamic(() => import("@/components/LivePurchaseNotification"), { ssr: false });
const PushNotificationPrompt = dynamic(() => import("@/components/PushNotificationPrompt"), { ssr: false });
const ServiceWorkerRegistrar = dynamic(() => import("@/components/ServiceWorkerRegistrar"), { ssr: false });

const AGE_GATE_KEY = "mm_age_verified";

function isAgeVerified(): boolean {
    if (typeof window === "undefined") return false;
    try {
        const raw = localStorage.getItem(AGE_GATE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed.verified) return false;
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) return false;
        return true;
    } catch {
        return false;
    }
}

/**
 * LazyWidgets — coordinates popup display order to avoid overload.
 *
 * Stagger order (after age gate is dismissed):
 *  1. Age gate — immediate (blocks everything)
 *  2. Welcome popup (FirstTimeBuyerPopup) — 5s after age gate
 *  3. Cookie consent (ConsentBanner) — 30s after welcome shown
 *  4. Push notification prompt — 60s after age gate
 *  5. Chat widget — always rendered but starts minimized (controlled internally)
 *
 * Non-popup widgets (BackToTop, ExitIntentPopup, CommandPalette,
 * LivePurchaseNotification, ServiceWorkerRegistrar) render immediately.
 */
export default function LazyWidgets() {
    const [ageGatePassed, setAgeGatePassed] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [showPushPrompt, setShowPushPrompt] = useState(false);

    // Check initial age gate state
    useEffect(() => {
        if (isAgeVerified()) {
            setAgeGatePassed(true);
        }
    }, []);

    // Poll for age gate dismissal (user clicks "Yes, I am 19+")
    useEffect(() => {
        if (ageGatePassed) return;

        const interval = setInterval(() => {
            if (isAgeVerified()) {
                setAgeGatePassed(true);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [ageGatePassed]);

    // Stagger popups after age gate is passed
    useEffect(() => {
        if (!ageGatePassed) return;

        // 5s delay: show welcome popup
        const welcomeTimer = setTimeout(() => setShowWelcome(true), 5000);

        // 35s delay (5s + 30s): show cookie consent
        const consentTimer = setTimeout(() => setShowConsent(true), 35000);

        // 60s delay: show push notification prompt
        const pushTimer = setTimeout(() => setShowPushPrompt(true), 60000);

        return () => {
            clearTimeout(welcomeTimer);
            clearTimeout(consentTimer);
            clearTimeout(pushTimer);
        };
    }, [ageGatePassed]);

    return (
        <>
            {/* Age gate — always rendered, shows immediately if not verified */}
            <AgeGate />

            {/* Chat widget — always rendered, starts minimized (bubble only) */}
            <AgentChatWidget />

            {/* Welcome popup — only mount after age gate + 5s delay */}
            {showWelcome && <FirstTimeBuyerPopup />}

            {/* Cookie consent — only mount after age gate + 35s delay */}
            {showConsent && <ConsentBanner />}

            {/* Push notification prompt — only mount after age gate + 60s delay */}
            {showPushPrompt && <PushNotificationPrompt />}

            {/* Non-popup widgets — render immediately */}
            <BackToTop />
            <ExitIntentPopup />
            <CommandPalette />
            <LivePurchaseNotification />
            <ServiceWorkerRegistrar />
        </>
    );
}
