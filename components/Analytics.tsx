"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { getConsentStatus } from "@/components/ConsentBanner";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
    const [consented, setConsented] = useState(false);

    useEffect(() => {
        setConsented(getConsentStatus() === "accepted");
    }, []);

    // Only load GA4 if user has accepted AND measurement ID is set
    if (!GA_ID || !consented) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                        cookie_flags: 'SameSite=None;Secure',
                    });
                `}
            </Script>
        </>
    );
}

// ─── E-commerce Event Helpers ───────────────────────────────

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

export function trackViewItem(product: { id: string; name: string; price: number; category: string }) {
    window.gtag?.("event", "view_item", {
        currency: "CAD",
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }],
    });
}

export function trackAddToCart(product: { id: string; name: string; price: number; category: string; quantity: number }) {
    window.gtag?.("event", "add_to_cart", {
        currency: "CAD",
        value: product.price * product.quantity,
        items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity: product.quantity }],
    });
}

export function trackPurchase(data: { transactionId: string; value: number; tax: number; shipping: number; items: { id: string; name: string; price: number; quantity: number }[] }) {
    window.gtag?.("event", "purchase", {
        transaction_id: data.transactionId,
        currency: "CAD",
        value: data.value,
        tax: data.tax,
        shipping: data.shipping,
        items: data.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
    });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
    window.gtag?.("event", name, params);
}
