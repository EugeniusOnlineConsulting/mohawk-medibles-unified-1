/**
 * Web Push Notifications — Mohawk Medibles
 * ==========================================
 * Server-side push notification utilities using the web-push library.
 * Requires VAPID keys in environment variables.
 *
 * Generate VAPID keys:
 *   npx web-push generate-vapid-keys
 */
import webpush from "web-push";
import { prisma } from "@/lib/db";

// ─── VAPID Configuration ──────────────────────────────────

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@mohawkmedibles.ca";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else if (process.env.NODE_ENV === "production") {
    console.warn("[webpush] VAPID keys not configured — push notifications disabled");
}

// ─── Types ────────────────────────────────────────────────

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
}

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

// ─── Send Push Notification ───────────────────────────────

/**
 * Send a push notification to a single subscription.
 * Returns true on success, false on failure (subscription may be expired).
 */
export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
): Promise<boolean> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn("[webpush] VAPID keys not configured, skipping push");
        return false;
    }

    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
            JSON.stringify({
                title: payload.title,
                body: payload.body,
                icon: payload.icon || "/icons/icon-192.png",
                badge: payload.badge || "/icons/badge-72.png",
                url: payload.url || "https://mohawkmedibles.ca",
                tag: payload.tag || "mohawk-medibles",
            })
        );
        return true;
    } catch (error: any) {
        // 410 Gone or 404 means subscription expired — should be cleaned up
        if (error.statusCode === 410 || error.statusCode === 404) {
            try {
                await prisma.pushSubscription.delete({
                    where: { endpoint: subscription.endpoint },
                });
                console.log(`[webpush] Removed expired subscription: ${subscription.endpoint.slice(0, 60)}...`);
            } catch {
                // Already deleted or doesn't exist
            }
        } else {
            console.error("[webpush] Failed to send notification:", error.message);
        }
        return false;
    }
}

// ─── Send Push to a Specific User ─────────────────────────

/**
 * Send a push notification to all devices registered for a user.
 * Returns the number of successful deliveries.
 */
export async function sendPushToUser(
    userId: string,
    title: string,
    body: string,
    url?: string
): Promise<number> {
    let subscriptions;
    try {
        subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });
    } catch (e) {
        console.warn("[webpush] sendPushToUser failed (table may not exist yet):", (e as Error).message);
        return 0;
    }

    if (subscriptions.length === 0) return 0;

    let successCount = 0;
    const payload: PushPayload = { title, body, url };

    await Promise.allSettled(
        subscriptions.map(async (sub) => {
            const ok = await sendPushNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
            );
            if (ok) successCount++;
        })
    );

    return successCount;
}

// ─── Broadcast to All Subscribers ─────────────────────────

/**
 * Send a push notification to all subscribers (e.g., flash sale announcements).
 * Returns { total, successful, failed }.
 */
export async function broadcastPush(
    title: string,
    body: string,
    url?: string
): Promise<{ total: number; successful: number; failed: number }> {
    let subscriptions;
    try {
        subscriptions = await prisma.pushSubscription.findMany();
    } catch (e) {
        console.warn("[webpush] broadcastPush failed (table may not exist yet):", (e as Error).message);
        return { total: 0, successful: 0, failed: 0 };
    }
    const total = subscriptions.length;
    let successful = 0;

    const payload: PushPayload = { title, body, url };

    // Process in batches of 100 to avoid overwhelming
    const BATCH_SIZE = 100;
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
        const batch = subscriptions.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
            batch.map(async (sub) => {
                const ok = await sendPushNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                );
                if (ok) successful++;
            })
        );
    }

    return { total, successful, failed: total - successful };
}

// ─── Convenience: Order Status Push ───────────────────────

const ORDER_STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
    PROCESSING: {
        title: "Order Confirmed!",
        body: "Your order is being processed. We'll notify you when it ships.",
    },
    PAYMENT_CONFIRMED: {
        title: "Payment Received",
        body: "Your payment has been confirmed. Preparing your order now.",
    },
    SHIPPED: {
        title: "Order Shipped!",
        body: "Your order is on its way! Track it in your account.",
    },
    IN_TRANSIT: {
        title: "Out for Delivery",
        body: "Your order is out for delivery. It should arrive soon!",
    },
    DELIVERED: {
        title: "Order Delivered",
        body: "Your order has been delivered. Enjoy!",
    },
};

/**
 * Send push notification for order status change.
 */
export async function notifyOrderStatusChange(
    userId: string,
    orderNumber: string,
    status: string
): Promise<void> {
    const msg = ORDER_STATUS_MESSAGES[status];
    if (!msg) return; // Don't push for every status

    await sendPushToUser(
        userId,
        msg.title,
        `${msg.body} (Order #${orderNumber})`,
        `https://mohawkmedibles.ca/account?tab=orders`
    );
}

/**
 * Notify users who subscribed for back-in-stock alerts via push.
 */
export async function notifyBackInStock(
    productName: string,
    productSlug: string,
    userIds: string[]
): Promise<number> {
    let total = 0;
    for (const userId of userIds) {
        const count = await sendPushToUser(
            userId,
            "Back in Stock!",
            `${productName} is back in stock. Get it before it's gone!`,
            `https://mohawkmedibles.ca/product/${productSlug}`
        );
        total += count;
    }
    return total;
}
