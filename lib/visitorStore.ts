/**
 * Visitor Profile Store — In-Memory LRU
 * ══════════════════════════════════════
 * Server-side visitor tracking for CRM insights.
 * Anonymous profiles keyed by mm-visitor cookie UUID.
 * PIPEDA-compliant: no PII, only browsing behavior aggregates.
 */

// ─── Types ──────────────────────────────────────────────────

export interface VisitorProfile {
    visitorId: string;
    firstSeen: number;
    lastSeen: number;
    categoryInterests: Record<string, number>;
    productsViewed: string[];
    searches: string[];
    totalEvents: number;
}

export interface TrackEvent {
    event: "category_view" | "product_view" | "search" | "page_visit" | "cart_add";
    data: Record<string, string>;
}

// ─── Store ──────────────────────────────────────────────────

const visitors = new Map<string, VisitorProfile>();
const MAX_VISITORS = 1000;

// ─── LRU Eviction ───────────────────────────────────────────

function evictIfNeeded(): void {
    if (visitors.size < MAX_VISITORS) return;
    const sorted = [...visitors.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen);
    for (let i = 0; i < 100 && i < sorted.length; i++) {
        visitors.delete(sorted[i][0]);
    }
}

// ─── Operations ─────────────────────────────────────────────

export function trackEvent(visitorId: string, event: TrackEvent): void {
    evictIfNeeded();

    let profile = visitors.get(visitorId);
    if (!profile) {
        profile = {
            visitorId,
            firstSeen: Date.now(),
            lastSeen: Date.now(),
            categoryInterests: {},
            productsViewed: [],
            searches: [],
            totalEvents: 0,
        };
    }

    profile.lastSeen = Date.now();
    profile.totalEvents++;

    switch (event.event) {
        case "category_view":
            if (event.data.category) {
                const cat = event.data.category;
                profile.categoryInterests[cat] = (profile.categoryInterests[cat] || 0) + 1;
            }
            break;
        case "product_view":
            if (event.data.slug) {
                profile.productsViewed = [event.data.slug, ...profile.productsViewed.filter((s) => s !== event.data.slug)].slice(0, 20);
            }
            break;
        case "search":
            if (event.data.query) {
                profile.searches = [event.data.query, ...profile.searches.filter((q) => q !== event.data.query)].slice(0, 10);
            }
            break;
        case "cart_add":
            if (event.data.category) {
                const cat = event.data.category;
                profile.categoryInterests[cat] = (profile.categoryInterests[cat] || 0) + 3; // Weight cart adds higher
            }
            break;
    }

    visitors.set(visitorId, profile);
}

export function getVisitorProfile(visitorId: string): VisitorProfile | null {
    return visitors.get(visitorId) || null;
}

/** Get aggregate stats for admin dashboard */
export function getVisitorStats(): {
    activeVisitors: number;
    topCategories: { name: string; views: number }[];
    recentSearches: string[];
} {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    let activeCount = 0;
    const categoryAgg: Record<string, number> = {};
    const searchAgg: string[] = [];

    for (const profile of visitors.values()) {
        if (now - profile.lastSeen < ONE_HOUR) activeCount++;

        for (const [cat, count] of Object.entries(profile.categoryInterests)) {
            categoryAgg[cat] = (categoryAgg[cat] || 0) + count;
        }

        for (const q of profile.searches.slice(0, 3)) {
            if (!searchAgg.includes(q)) searchAgg.push(q);
        }
    }

    const topCategories = Object.entries(categoryAgg)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, views]) => ({ name, views }));

    return {
        activeVisitors: activeCount,
        topCategories,
        recentSearches: searchAgg.slice(0, 15),
    };
}
