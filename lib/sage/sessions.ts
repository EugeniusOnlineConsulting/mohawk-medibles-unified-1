/**
 * MedAgent Session Manager
 * ════════════════════════════
 * In-memory session store for MedAgent conversations.
 * Handles concurrent customers with unique session IDs.
 * Scalable to Redis/Upstash in production.
 *
 * Extracted into lib/sage/ as part of the MedAgent middleware integration.
 */

import type { GeminiMessage } from "@/lib/gemini";

// ─── Types ──────────────────────────────────────────────────

export interface MedAgentSession {
    id: string;
    channel: "chat" | "voice";
    messages: GeminiMessage[];
    createdAt: number;
    lastActiveAt: number;
    metadata: {
        userAgent?: string;
        page?: string;
        locale?: string;
    };
}

// ─── In-Memory Store ────────────────────────────────────────

const sessions = new Map<string, MedAgentSession>();
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
            console.log(`[MedAgent Sessions] Cleaned ${cleaned} stale sessions. Active: ${sessions.size}`);
        }
    }, CLEANUP_INTERVAL_MS);
}

// Start cleanup on module load
startCleanup();

// ─── Public API ─────────────────────────────────────────────

export function generateSessionId(): string {
    return `medagent_${crypto.randomUUID()}`;
}

export function getSession(sessionId: string): MedAgentSession | undefined {
    const session = sessions.get(sessionId);
    if (session) {
        session.lastActiveAt = Date.now();
    }
    return session;
}

export function createSession(
    sessionId: string,
    channel: "chat" | "voice" = "chat",
    metadata?: MedAgentSession["metadata"]
): MedAgentSession {
    const session: MedAgentSession = {
        id: sessionId,
        channel,
        messages: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        metadata: metadata || {},
    };
    sessions.set(sessionId, session);
    return session;
}

export function getOrCreateSession(
    sessionId: string,
    channel: "chat" | "voice" = "chat"
): MedAgentSession {
    return getSession(sessionId) || createSession(sessionId, channel);
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
    let chatSessions = 0;
    let voiceSessions = 0;
    let oldestSession = now;

    for (const session of sessions.values()) {
        totalMessages += session.messages.length;
        if (session.channel === "chat") chatSessions++;
        if (session.channel === "voice") voiceSessions++;
        if (session.createdAt < oldestSession) {
            oldestSession = session.createdAt;
        }
    }

    return {
        activeSessions: sessions.size,
        chatSessions,
        voiceSessions,
        totalMessages,
        oldestSessionAge: sessions.size > 0 ? Math.round((now - oldestSession) / 1000 / 60) : 0,
    };
}
