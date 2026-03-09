/**
 * GA4 Analytics — Centralized Event Tracking
 * ════════════════════════════════════════════
 * Consent-gated wrappers for Google Analytics 4 e-commerce events.
 * Silently no-ops if GA is not configured or consent is declined.
 */

"use client";

import { getConsentStatus } from "@/components/ConsentBanner";

// Re-export existing helpers from Analytics.tsx
export { trackViewItem, trackAddToCart, trackPurchase, trackEvent } from "@/components/Analytics";

function isEnabled(): boolean {
    return (
        typeof window !== "undefined" &&
        !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
        getConsentStatus() === "accepted" &&
        typeof window.gtag === "function"
    );
}

// ─── Additional GA4 E-commerce Events ───────────────────

export function trackViewItemList(
    items: { id: string; name: string; price: number; category: string }[],
    listName: string
): void {
    if (!isEnabled()) return;
    window.gtag?.("event", "view_item_list", {
        item_list_name: listName,
        currency: "CAD",
        items: items.slice(0, 20).map((item, index) => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            index,
        })),
    });
}

export function trackBeginCheckout(
    items: { id: string; name: string; price: number; quantity: number }[],
    value: number
): void {
    if (!isEnabled()) return;
    window.gtag?.("event", "begin_checkout", {
        currency: "CAD",
        value,
        items: items.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
    });
}

export function trackSearch(query: string, resultCount: number): void {
    if (!isEnabled()) return;
    window.gtag?.("event", "search", {
        search_term: query,
        result_count: resultCount,
    });
}

export function trackRemoveFromCart(product: { id: string; name: string; price: number; quantity: number }): void {
    if (!isEnabled()) return;
    window.gtag?.("event", "remove_from_cart", {
        currency: "CAD",
        value: product.price * product.quantity,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: product.quantity }],
    });
}
