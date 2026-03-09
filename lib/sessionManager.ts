/**
 * Mohawk Medibles — Session Manager
 * ══════════════════════════════════
 * In-memory session store for voice agent conversations.
 * Handles concurrent customers with unique session IDs.
 * Scalable to Redis/Upstash in production.
 */

import type { GeminiMessage } from "@/lib/gemini";

// ─── Types ──────────────────────────────────────────────────

interface Session {
    id: string;
    messages: GeminiMessage[];
    createdAt: number;
    lastActiveAt: number;
    metadata: {
        userAgent?: string;
        page?: string;
    };
}

// ─── In-Memory Store ────────────────────────────────────────

const sessions = new Map<string, Session>();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_MESSAGES_PER_SESSION = 50;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean every 5 min

// ─── Auto-cleanup stale sessions ────────────────────────────

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        let cleaned = 0;
        for (const [id, session] of sessions) {
            if (now - session.lastActiveAt > SESSION_TTL_MS) {
                sessions.delete(id);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`[SessionManager] Cleaned ${cleaned} stale sessions. Active: ${sessions.size}`);
        }
    }, CLEANUP_INTERVAL_MS);
}

// Start cleanup on module load
startCleanup();

// ─── Public API ─────────────────────────────────────────────

export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

export function getSession(sessionId: string): Session | undefined {
    const session = sessions.get(sessionId);
    if (session) {
        session.lastActiveAt = Date.now();
    }
    return session;
}

export function createSession(sessionId: string, metadata?: Session["metadata"]): Session {
    const session: Session = {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        metadata: metadata || {},
    };
    sessions.set(sessionId, session);
    return session;
}

export function getOrCreateSession(sessionId: string): Session {
    return getSession(sessionId) || createSession(sessionId);
}

export function addMessage(sessionId: string, message: GeminiMessage): void {
    const session = getOrCreateSession(sessionId);
    session.messages.push(message);
    session.lastActiveAt = Date.now();

    // Trim old messages if over limit (keep latest, remove from start)
    if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
        session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
    }
}

export function getMessages(sessionId: string): GeminiMessage[] {
    return getSession(sessionId)?.messages || [];
}

export function deleteSession(sessionId: string): boolean {
    return sessions.delete(sessionId);
}

export function getActiveSessionCount(): number {
    return sessions.size;
}

export function getSessionStats() {
    const now = Date.now();
    let totalMessages = 0;
    let oldestSession = now;

    for (const session of sessions.values()) {
        totalMessages += session.messages.length;
        if (session.createdAt < oldestSession) {
            oldestSession = session.createdAt;
        }
    }

    return {
        activeSessions: sessions.size,
        totalMessages,
        oldestSessionAge: sessions.size > 0 ? Math.round((now - oldestSession) / 1000 / 60) : 0, // minutes
    };
}
