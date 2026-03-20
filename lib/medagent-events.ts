/**
 * MedAgent Event Bus — Real-Time Two-Way Communication
 * ════════════════════════════════════════════════════
 * Lightweight pub/sub for instant communication between
 * MedAgent, Cart, ShopClient, and Navigation.
 *
 * Uses CustomEvent on window — zero dependencies, SSR-safe.
 */

// ─── Event Types ─────────────────────────────────────────

export interface MedAgentCartEvent {
    action: "add" | "remove" | "clear" | "sync";
    item?: { id: string; name: string; price: number; quantity: number };
    items?: { id: string; name: string; price: number; quantity: number }[];
    total?: number;
    source: "medagent" | "shop" | "product" | "checkout";
}

export interface MedAgentNavEvent {
    path: string;
    source: "medagent" | "quicknav";
}

export interface MedAgentFilterEvent {
    category?: string;
    search?: string;
    source: "medagent";
}

// ─── Emit Events ─────────────────────────────────────────

export function emitCartEvent(detail: MedAgentCartEvent) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("medagent:cart", { detail }));
}

export function emitNavEvent(detail: MedAgentNavEvent) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("medagent:nav", { detail }));
}

export function emitFilterEvent(detail: MedAgentFilterEvent) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("medagent:filter", { detail }));
}

// ─── Subscribe to Events ─────────────────────────────────

export function onCartEvent(handler: (e: MedAgentCartEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};
    const listener = (e: Event) => handler((e as CustomEvent<MedAgentCartEvent>).detail);
    window.addEventListener("medagent:cart", listener);
    return () => window.removeEventListener("medagent:cart", listener);
}

export function onNavEvent(handler: (e: MedAgentNavEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};
    const listener = (e: Event) => handler((e as CustomEvent<MedAgentNavEvent>).detail);
    window.addEventListener("medagent:nav", listener);
    return () => window.removeEventListener("medagent:nav", listener);
}

export function onFilterEvent(handler: (e: MedAgentFilterEvent) => void): () => void {
    if (typeof window === "undefined") return () => {};
    const listener = (e: Event) => handler((e as CustomEvent<MedAgentFilterEvent>).detail);
    window.addEventListener("medagent:filter", listener);
    return () => window.removeEventListener("medagent:filter", listener);
}
