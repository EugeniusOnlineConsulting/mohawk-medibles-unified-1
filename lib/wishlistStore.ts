/**
 * Wishlist Store — In-Memory LRU
 * ══════════════════════════════
 * Server-side wishlist storage keyed by visitor cookie UUID.
 * PIPEDA-compliant: no PII, only product IDs.
 */

import type { WishlistItem } from "@/hooks/useWishlist";

const wishlists = new Map<string, WishlistItem[]>();
const MAX_VISITORS = 500;

function evictIfNeeded(): void {
    if (wishlists.size < MAX_VISITORS) return;
    const keys = [...wishlists.keys()];
    for (let i = 0; i < 50 && i < keys.length; i++) {
        wishlists.delete(keys[i]);
    }
}

export function setWishlist(visitorId: string, items: WishlistItem[]): void {
    evictIfNeeded();
    wishlists.set(visitorId, items.slice(0, 50));
}

export function getWishlist(visitorId: string): WishlistItem[] {
    return wishlists.get(visitorId) || [];
}

export function getWishlistStats(): { totalWishlists: number; topProducts: { id: string; name: string; count: number }[] } {
    const productCounts: Record<string, { name: string; count: number }> = {};

    for (const items of wishlists.values()) {
        for (const item of items) {
            if (!productCounts[item.id]) {
                productCounts[item.id] = { name: item.name, count: 0 };
            }
            productCounts[item.id].count++;
        }
    }

    const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([id, { name, count }]) => ({ id, name, count }));

    return { totalWishlists: wishlists.size, topProducts };
}
