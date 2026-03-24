"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * usePushNotifications — Client hook for Web Push subscription management.
 *
 * Returns:
 *   isSupported  — Whether the browser supports push notifications
 *   permission   — Current Notification permission state
 *   isSubscribed — Whether the user has an active push subscription
 *   isLoading    — Loading state during subscribe/unsubscribe
 *   subscribe    — Subscribe to push notifications
 *   unsubscribe  — Unsubscribe from push notifications
 */
export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    // Check support and existing subscription on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        const supported =
            "serviceWorker" in navigator &&
            "PushManager" in window &&
            "Notification" in window;

        setIsSupported(supported);

        if (!supported) return;

        setPermission(Notification.permission);

        // Register/get service worker and check existing subscription
        navigator.serviceWorker.ready.then((reg) => {
            setRegistration(reg);
            reg.pushManager.getSubscription().then((sub) => {
                setIsSubscribed(!!sub);
            });
        });
    }, []);

    /**
     * Subscribe to push notifications.
     * Requests permission, subscribes via PushManager, sends to server.
     */
    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported || !registration) return false;

        setIsLoading(true);
        try {
            // Request notification permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== "granted") {
                setIsLoading(false);
                return false;
            }

            // Get VAPID public key from env
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                console.error("[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");
                setIsLoading(false);
                return false;
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            });

            // Send subscription to server
            const res = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
                        auth: arrayBufferToBase64(subscription.getKey("auth")),
                    },
                }),
            });

            if (res.ok) {
                setIsSubscribed(true);
                setIsLoading(false);
                return true;
            } else {
                console.error("[push] Server rejected subscription:", await res.text());
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error("[push] Subscribe failed:", error);
            setIsLoading(false);
            return false;
        }
    }, [isSupported, registration]);

    /**
     * Unsubscribe from push notifications.
     */
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!registration) return false;

        setIsLoading(true);
        try {
            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                setIsSubscribed(false);
                setIsLoading(false);
                return true;
            }

            // Unsubscribe from browser
            await subscription.unsubscribe();

            // Remove from server
            await fetch("/api/push/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
            });

            setIsSubscribed(false);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error("[push] Unsubscribe failed:", error);
            setIsLoading(false);
            return false;
        }
    }, [registration]);

    return {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe,
    };
}

// ─── Helpers ──────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return "";
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
