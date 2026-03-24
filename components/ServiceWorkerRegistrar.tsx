"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistrar — Registers the service worker on mount.
 * Loaded via LazyWidgets (client-only, no SSR).
 */
export default function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator)) return;

        navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((reg) => {
                console.log("[SW] Registered:", reg.scope);
            })
            .catch((err) => {
                console.warn("[SW] Registration failed:", err.message);
            });
    }, []);

    return null;
}
