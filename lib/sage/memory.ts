/**
 * MedAgent Persistent Memory — "A Friend Who Remembers"
 * ══════════════════════════════════════════════════════
 * PIPEDA-Compliant persistent memory for returning customers.
 *
 * Stores in localStorage (client-side only, user-controlled):
 * - Preferred name (if voluntarily shared)
 * - Conversation topics and preferences
 * - Favorite categories and products
 * - Session count and last visit
 *
 * Does NOT store: PII, IP addresses, email, payment info, order details.
 * Users can clear all data via browser settings at any time.
 *
 * For authenticated users: server-side memory from their account data
 * supplements this with order history context (never revealed directly).
 */

// ─── Types ──────────────────────────────────────────

export interface CustomerMemory {
    /** Version for future migration */
    version: number;
    /** Preferred name if voluntarily shared in conversation */
    preferredName?: string;
    /** Topics discussed across sessions (last 20) */
    topicsDiscussed: string[];
    /** Preferences expressed (e.g., "prefers indica", "likes edibles") */
    preferences: string[];
    /** Favorite categories based on repeated interest */
    favoriteCategories: string[];
    /** Last products they asked about (slugs, last 10) */
    lastProductsDiscussed: string[];
    /** Total conversation sessions */
    sessionCount: number;
    /** First interaction timestamp */
    firstSeen: number;
    /** Last interaction timestamp */
    lastSeen: number;
    /** Whether privacy notice has been acknowledged */
    privacyAcknowledged: boolean;
    /** Whether the user has an account (set on login) */
    isAuthenticated: boolean;
    /** Mood pattern — what moods they tend to come in with */
    moodPattern: Record<string, number>;
}

// ─── Storage Key ─────────────────────────────────────

const MEMORY_KEY = "mm_customer_memory";

// ─── Read / Write ────────────────────────────────────

/** Maximum age for memory data: 12 months in milliseconds */
const MEMORY_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function getMemory(): CustomerMemory {
    if (typeof window === "undefined") return createDefaultMemory();
    try {
        const raw = localStorage.getItem(MEMORY_KEY);
        if (!raw) return createDefaultMemory();
        const data = JSON.parse(raw) as CustomerMemory;
        // TTL check: purge stale data older than 12 months
        if (data.lastSeen && (Date.now() - data.lastSeen) > MEMORY_TTL_MS) {
            localStorage.removeItem(MEMORY_KEY);
            return createDefaultMemory();
        }
        // Migration: ensure all fields exist
        return { ...createDefaultMemory(), ...data };
    } catch {
        return createDefaultMemory();
    }
}

function createDefaultMemory(): CustomerMemory {
    return {
        version: 1,
        topicsDiscussed: [],
        preferences: [],
        favoriteCategories: [],
        lastProductsDiscussed: [],
        sessionCount: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        privacyAcknowledged: false,
        isAuthenticated: false,
        moodPattern: {},
    };
}

export function saveMemory(memory: CustomerMemory): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    } catch {
        // localStorage full — silently fail
    }
}

// ─── Memory Update Methods ───────────────────────────

/** Record that a new conversation session started */
export function recordSessionStart(): CustomerMemory {
    const memory = getMemory();
    memory.sessionCount += 1;
    memory.lastSeen = Date.now();
    if (memory.firstSeen === 0) {
        memory.firstSeen = Date.now();
    }
    saveMemory(memory);
    return memory;
}

/** Store the user's preferred name (if they share it voluntarily) */
export function rememberName(name: string): void {
    const memory = getMemory();
    // Only store first name, max 30 chars, sanitized
    const clean = name.trim().split(/\s+/)[0].slice(0, 30).replace(/[^a-zA-Z'-]/g, "");
    if (clean.length > 0) {
        memory.preferredName = clean;
        saveMemory(memory);
    }
}

/** Add a topic that was discussed */
export function rememberTopic(topic: string): void {
    const memory = getMemory();
    const clean = topic.trim().toLowerCase().slice(0, 100);
    if (!clean) return;
    memory.topicsDiscussed = [clean, ...memory.topicsDiscussed.filter(t => t !== clean)].slice(0, 20);
    saveMemory(memory);
}

/** Store a preference the user expressed */
export function rememberPreference(pref: string): void {
    const memory = getMemory();
    const clean = pref.trim().toLowerCase().slice(0, 100);
    if (!clean) return;
    if (!memory.preferences.includes(clean)) {
        memory.preferences = [...memory.preferences, clean].slice(0, 15);
        saveMemory(memory);
    }
}

/** Track a product they asked about */
export function rememberProductDiscussed(slug: string): void {
    const memory = getMemory();
    memory.lastProductsDiscussed = [slug, ...memory.lastProductsDiscussed.filter(s => s !== slug)].slice(0, 10);
    saveMemory(memory);
}

/** Track favorite categories based on repeated interest */
export function updateFavoriteCategories(category: string): void {
    const memory = getMemory();
    const clean = category.trim().toLowerCase();
    if (!memory.favoriteCategories.includes(clean)) {
        memory.favoriteCategories = [...memory.favoriteCategories, clean].slice(0, 8);
    }
    saveMemory(memory);
}

/** Record mood from sentiment analysis */
export function recordMood(mood: string): void {
    const memory = getMemory();
    memory.moodPattern[mood] = (memory.moodPattern[mood] || 0) + 1;
    saveMemory(memory);
}

/** Mark privacy notice as acknowledged */
export function acknowledgePrivacy(): void {
    const memory = getMemory();
    memory.privacyAcknowledged = true;
    saveMemory(memory);
}

/** Mark user as authenticated */
export function markAuthenticated(): void {
    const memory = getMemory();
    memory.isAuthenticated = true;
    saveMemory(memory);
}

/** Clear all memory (user-initiated) */
export function clearMemory(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(MEMORY_KEY);
    } catch {
        // silently fail
    }
}

// ─── Prompt Sanitization ─────────────────────────────

/** Strip prompt injection patterns from user-controlled strings before injecting into LLM prompt */
function sanitizeForPrompt(text: string): string {
    return text
        // Remove common injection patterns
        .replace(/ignore\s*(all\s*)?(previous|prior|above)\s*(instructions?|rules?|prompts?)/gi, "")
        .replace(/(forget|disregard|override|bypass)\s*(your|all|the)\s*(rules?|instructions?|prompt)/gi, "")
        .replace(/(you\s+are\s+now|act\s+as|pretend\s+to\s+be|new\s+persona|system\s+prompt)/gi, "")
        .replace(/(jailbreak|DAN|developer\s+mode)/gi, "")
        // Remove control characters and excessive whitespace
        .replace(/[\x00-\x1F\x7F]/g, "")
        .replace(/\s{3,}/g, " ")
        .trim()
        .slice(0, 100);
}

// ─── Memory Context Builder (for MedAgent prompt) ────

export function buildMemoryContext(memory: CustomerMemory): string {
    const parts: string[] = [];

    // Returning customer context
    if (memory.sessionCount > 1) {
        const daysSinceFirst = Math.floor((Date.now() - memory.firstSeen) / (1000 * 60 * 60 * 24));
        const daysSinceLast = Math.floor((Date.now() - memory.lastSeen) / (1000 * 60 * 60 * 24));

        if (memory.preferredName) {
            parts.push(`PERSISTENT MEMORY: This is a returning customer who goes by "${memory.preferredName}". They've chatted with you ${memory.sessionCount} times over ${daysSinceFirst} days. Greet them by name naturally — like a friend who remembers them. Don't overdo it.`);
        } else {
            parts.push(`PERSISTENT MEMORY: Returning visitor — ${memory.sessionCount} conversations over ${daysSinceFirst} days. They're familiar with the site. No need to over-explain.`);
        }

        if (daysSinceLast > 14) {
            parts.push(`NOTE: It's been ${daysSinceLast} days since they last chatted. Welcome them back warmly but naturally.`);
        }
    }

    // Known preferences (sanitized)
    if (memory.preferences.length > 0) {
        const safePrefs = memory.preferences.map(sanitizeForPrompt).filter(Boolean);
        if (safePrefs.length > 0) {
            parts.push(`KNOWN PREFERENCES: ${safePrefs.join(", ")}. Use these to inform your guidance — but always confirm before assuming. Tastes evolve.`);
        }
    }

    // Favorite categories (sanitized)
    if (memory.favoriteCategories.length > 0) {
        const safeCats = memory.favoriteCategories.map(sanitizeForPrompt).filter(Boolean);
        if (safeCats.length > 0) {
            parts.push(`FAVORITE CATEGORIES: ${safeCats.join(", ")}. They gravitate toward these — relevant for recommendations if they ask.`);
        }
    }

    // Recent topics (sanitized)
    if (memory.topicsDiscussed.length > 0) {
        const safeTopics = memory.topicsDiscussed.slice(0, 5).map(sanitizeForPrompt).filter(Boolean);
        if (safeTopics.length > 0) {
            parts.push(`PREVIOUS TOPICS: ${safeTopics.join(", ")}. If they circle back to these, show continuity — "Last time we talked about X" — but only if natural.`);
        }
    }

    // Privacy assurance instruction
    parts.push("PRIVACY MANDATE: NEVER mention that you track or store data. NEVER reference analytics, cookies, localStorage, or behavioral tracking. If asked about privacy, explain that conversations are private, not shared with third parties, and only used to provide better assistance. The customer can clear their browser data at any time to reset everything.");

    return parts.length > 0 ? "\n\n" + parts.join("\n\n") : "";
}

// ─── Smart Name Detection ────────────────────────────

/**
 * Detect if the user voluntarily shared their name in a message.
 * Only captures explicit self-introductions, never infers.
 */
export function detectNameInMessage(message: string): string | null {
    const patterns = [
        /(?:my name is|i'm|i am|call me|they call me|name's|it's)\s+([A-Z][a-z]{1,20})/i,
        /^(?:hey,?\s+)?([A-Z][a-z]{1,20})\s+here\b/i,
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            const name = match[1];
            // Filter out common false positives
            const falsePositives = new Set([
                "looking", "interested", "wondering", "trying", "hoping",
                "just", "really", "very", "pretty", "quite", "super",
                "not", "the", "this", "that", "here", "there",
            ]);
            if (!falsePositives.has(name.toLowerCase())) {
                return name;
            }
        }
    }
    return null;
}

/**
 * Extract preferences from conversation messages.
 * Detects statements like "I prefer indica", "I love edibles", etc.
 */
export function detectPreferences(message: string): string[] {
    const found: string[] = [];
    const prefPatterns = [
        /i\s+(?:prefer|love|like|enjoy|usually\s+get|always\s+go\s+(?:for|with))\s+(.+?)(?:\.|$|,)/gi,
        /(?:my\s+favorite|my\s+go[\s-]to)\s+(?:is|are)\s+(.+?)(?:\.|$|,)/gi,
    ];

    for (const pattern of prefPatterns) {
        let match;
        while ((match = pattern.exec(message)) !== null) {
            const pref = match[1].trim().slice(0, 80);
            if (pref.length > 2 && pref.length < 80) {
                found.push(pref.toLowerCase());
            }
        }
    }
    return found;
}
