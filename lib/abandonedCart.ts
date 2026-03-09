/**
 * Abandoned Cart Store — In-Memory with TTL
 * ═══════════════════════════════════════════
 * Tracks server-side cart snapshots for abandoned cart recovery.
 * In-memory Map survives within serverless function lifetime.
 * When PostgreSQL is connected, migrate to Prisma model.
 */

// ─── Types ──────────────────────────────────────────────────

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface CartSnapshot {
    id: string;
    email?: string;
    items: CartItem[];
    total: number;
    createdAt: number;
    lastUpdated: number;
    remindersSent: string[]; // "6h", "24h"
    converted: boolean;
}

// ─── Store ──────────────────────────────────────────────────

const carts = new Map<string, CartSnapshot>();
const MAX_CARTS = 5000;
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Operations ─────────────────────────────────────────────

export function saveCart(cartId: string, items: CartItem[], email?: string): CartSnapshot {
    // Evict oldest carts if at capacity
    if (carts.size >= MAX_CARTS && !carts.has(cartId)) {
        const oldest = [...carts.entries()].sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);
        for (let i = 0; i < 100 && i < oldest.length; i++) {
            carts.delete(oldest[i][0]);
        }
    }

    const existing = carts.get(cartId);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const snapshot: CartSnapshot = {
        id: cartId,
        email: email || existing?.email,
        items,
        total,
        createdAt: existing?.createdAt || Date.now(),
        lastUpdated: Date.now(),
        remindersSent: existing?.remindersSent || [],
        converted: false,
    };

    carts.set(cartId, snapshot);
    return snapshot;
}

export function getCart(cartId: string): CartSnapshot | null {
    return carts.get(cartId) || null;
}

export function markConverted(cartId: string): void {
    const cart = carts.get(cartId);
    if (cart) {
        cart.converted = true;
        carts.set(cartId, cart);
    }
}

export function markReminderSent(cartId: string, stage: string): void {
    const cart = carts.get(cartId);
    if (cart && !cart.remindersSent.includes(stage)) {
        cart.remindersSent.push(stage);
        carts.set(cartId, cart);
    }
}

/**
 * Get abandoned carts that are eligible for a reminder.
 * A cart is "abandoned" if:
 * - Has items (total > 0)
 * - Has an email
 * - Not converted
 * - Older than minAgeMs
 * - The specified stage reminder hasn't been sent yet
 */
export function getAbandonedCarts(minAgeMs: number, stage: string): CartSnapshot[] {
    const now = Date.now();
    const results: CartSnapshot[] = [];

    for (const cart of carts.values()) {
        // Purge expired carts
        if (now - cart.lastUpdated > CART_TTL_MS) {
            carts.delete(cart.id);
            continue;
        }

        if (
            cart.items.length > 0 &&
            cart.total > 0 &&
            cart.email &&
            !cart.converted &&
            !cart.remindersSent.includes(stage) &&
            (now - cart.lastUpdated) >= minAgeMs
        ) {
            results.push(cart);
        }
    }

    return results;
}

/** Get store stats for admin dashboard */
export function getCartStoreStats(): { totalCarts: number; withEmail: number; abandoned6h: number; abandoned24h: number } {
    const now = Date.now();
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    let withEmail = 0;
    let abandoned6h = 0;
    let abandoned24h = 0;

    for (const cart of carts.values()) {
        if (cart.email) withEmail++;
        const age = now - cart.lastUpdated;
        if (age >= SIX_HOURS && !cart.converted && cart.items.length > 0) abandoned6h++;
        if (age >= TWENTY_FOUR_HOURS && !cart.converted && cart.items.length > 0) abandoned24h++;
    }

    return { totalCarts: carts.size, withEmail, abandoned6h, abandoned24h };
}
