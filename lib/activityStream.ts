/**
 * Activity Stream — In-Memory Ring Buffer
 * ════════════════════════════════════════
 * Captures site activity events for the admin real-time dashboard.
 * Last 200 events stored in a circular buffer.
 * Events are pushed from cart sync, agent chat, checkout, etc.
 */

// ─── Types ──────────────────────────────────────────────

export type ActivityEventType =
    | "cart_add"
    | "cart_remove"
    | "agent_chat"
    | "page_visit"
    | "order_placed"
    | "signup"
    | "search"
    | "product_view"
    | "wishlist_add"
    | "wishlist_remove";

export interface ActivityEvent {
    id: number;
    type: ActivityEventType;
    timestamp: number;
    data: {
        productName?: string;
        category?: string;
        page?: string;
        amount?: number;
        query?: string;
        message?: string;
    };
}

// ─── Ring Buffer ────────────────────────────────────────

const MAX_EVENTS = 200;
const events: ActivityEvent[] = [];
let nextId = 1;

export function pushEvent(
    type: ActivityEventType,
    data: ActivityEvent["data"] = {}
): ActivityEvent {
    const event: ActivityEvent = {
        id: nextId++,
        type,
        timestamp: Date.now(),
        data,
    };

    events.push(event);
    if (events.length > MAX_EVENTS) {
        events.shift();
    }

    return event;
}

/**
 * Get events after a given ID (for polling/SSE).
 * Returns newest events first.
 */
export function getEventsSince(sinceId: number): ActivityEvent[] {
    return events.filter((e) => e.id > sinceId);
}

/**
 * Get the N most recent events.
 */
export function getRecentEvents(limit: number = 50): ActivityEvent[] {
    return events.slice(-limit).reverse();
}

/**
 * Get the latest event ID (for SSE cursor tracking).
 */
export function getLatestEventId(): number {
    return events.length > 0 ? events[events.length - 1].id : 0;
}
