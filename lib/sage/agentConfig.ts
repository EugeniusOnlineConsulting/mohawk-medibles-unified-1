/**
 * Agent Configuration Store
 * ═════════════════════════
 * Runtime-configurable MedAgent settings.
 * Defaults loaded from data/agent-config.json.
 * Changes stored in-memory (persists within serverless instance).
 * Admin can modify via /api/admin/agent-config.
 */

import defaultConfig from "@/data/agent-config.json";

// ─── Types ──────────────────────────────────────────────

export interface AgentConfig {
    /** Extra instructions appended to the base system prompt */
    systemPromptOverride: string | null;
    /** Enable/disable turbo router (local pattern matching) */
    turboEnabled: boolean;
    /** Enable/disable text-to-speech */
    ttsEnabled: boolean;
    /** Max response length in characters */
    maxResponseLength: number;
    /** Which personas are active */
    personasEnabled: {
        medagent: boolean;
        turtle: boolean;
        trickster: boolean;
    };
    /** Additional blocked topic keywords */
    blockedTopics: string[];
    /** Custom greeting override (null = default) */
    customGreeting: string | null;
    /** Free shipping threshold in dollars */
    freeShippingThreshold: number;
    /** Compliance strictness level */
    complianceMode: "strict" | "standard";
}

// ─── Store ──────────────────────────────────────────────

let config: AgentConfig = { ...defaultConfig } as AgentConfig;

export function getAgentConfig(): AgentConfig {
    return { ...config };
}

export function updateAgentConfig(patch: Partial<AgentConfig>): AgentConfig {
    // Validate and merge
    if (patch.systemPromptOverride !== undefined) {
        config.systemPromptOverride = typeof patch.systemPromptOverride === "string"
            ? patch.systemPromptOverride.slice(0, 2000)
            : null;
    }
    if (typeof patch.turboEnabled === "boolean") {
        config.turboEnabled = patch.turboEnabled;
    }
    if (typeof patch.ttsEnabled === "boolean") {
        config.ttsEnabled = patch.ttsEnabled;
    }
    if (typeof patch.maxResponseLength === "number") {
        config.maxResponseLength = Math.max(100, Math.min(patch.maxResponseLength, 2000));
    }
    if (patch.personasEnabled && typeof patch.personasEnabled === "object") {
        const p = patch.personasEnabled;
        if (typeof p.medagent === "boolean") config.personasEnabled.medagent = p.medagent;
        if (typeof p.turtle === "boolean") config.personasEnabled.turtle = p.turtle;
        if (typeof p.trickster === "boolean") config.personasEnabled.trickster = p.trickster;
    }
    if (Array.isArray(patch.blockedTopics)) {
        config.blockedTopics = patch.blockedTopics
            .filter((t): t is string => typeof t === "string")
            .map((t) => t.slice(0, 100).toLowerCase().trim())
            .slice(0, 50);
    }
    if (patch.customGreeting !== undefined) {
        config.customGreeting = typeof patch.customGreeting === "string"
            ? patch.customGreeting.slice(0, 500)
            : null;
    }
    if (typeof patch.freeShippingThreshold === "number") {
        config.freeShippingThreshold = Math.max(0, Math.min(patch.freeShippingThreshold, 1000));
    }
    if (patch.complianceMode === "strict" || patch.complianceMode === "standard") {
        config.complianceMode = patch.complianceMode;
    }

    return { ...config };
}

/** Reset config to defaults */
export function resetAgentConfig(): AgentConfig {
    config = { ...defaultConfig } as AgentConfig;
    return { ...config };
}
