"use client";

import { useEffect, useRef, useCallback } from "react";

interface CaptchaProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
    className?: string;
}

declare global {
    interface Window {
        turnstile?: {
            render: (element: HTMLElement, options: Record<string, unknown>) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

/**
 * Cloudflare Turnstile CAPTCHA widget.
 * Renders an invisible/managed challenge — no user interaction needed in most cases.
 *
 * If NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, renders nothing (dev mode).
 */
export default function Captcha({
    onVerify,
    onExpire,
    onError,
    theme = "auto",
    size = "normal",
    className = "",
}: CaptchaProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoaded = useRef(false);

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const renderWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile || !siteKey) return;
        if (widgetIdRef.current) return; // Already rendered

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme,
            size,
            callback: onVerify,
            "expired-callback": onExpire,
            "error-callback": onError,
        });
    }, [siteKey, theme, size, onVerify, onExpire, onError]);

    useEffect(() => {
        if (!siteKey) return; // Skip in dev mode

        // Load Turnstile script if not already loaded
        if (!scriptLoaded.current) {
            const existingScript = document.querySelector('script[src*="turnstile"]');
            if (!existingScript) {
                window.onTurnstileLoad = renderWidget;
                const script = document.createElement("script");
                script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            } else if (window.turnstile) {
                renderWidget();
            }
            scriptLoaded.current = true;
        } else if (window.turnstile) {
            renderWidget();
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [siteKey, renderWidget]);

    // Don't render anything if not configured (development mode)
    if (!siteKey) return null;

    return <div ref={containerRef} className={className} />;
}
