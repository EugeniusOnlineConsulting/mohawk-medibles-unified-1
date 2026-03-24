/**
 * Mohawk Medibles — Service Worker
 * Caches static assets, product images, and the app shell.
 * Network-first strategy for API calls, cache-first for static assets.
 */

const CACHE_NAME = "mm-cache-v1";
const STATIC_CACHE = "mm-static-v1";
const IMAGE_CACHE = "mm-images-v1";

// App shell: core assets to cache on install
const APP_SHELL = [
    "/",
    "/shop",
    "/deals",
    "/about",
    "/contact",
    "/offline",
];

// ─── Install ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

// ─── Activate ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
    const allowedCaches = [CACHE_NAME, STATIC_CACHE, IMAGE_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => !allowedCaches.includes(key))
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

// ─── Fetch Strategy Router ────────────────────────────────
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip Chrome extension and non-http(s) requests
    if (!url.protocol.startsWith("http")) return;

    // API calls: Network-first with cache fallback
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(networkFirst(request, CACHE_NAME));
        return;
    }

    // Product images from WooCommerce CDN: Cache-first
    if (
        url.hostname === "mohawkmedibles.ca" &&
        url.pathname.includes("/wp-content/uploads/")
    ) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Static assets (JS, CSS, fonts, images): Cache-first
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Navigation & other requests: Network-first
    event.respondWith(networkFirst(request, CACHE_NAME));
});

// ─── Strategies ───────────────────────────────────────────

/**
 * Network-first: Try network, fall back to cache.
 * Good for API calls and HTML pages that should be fresh.
 */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;

        // If this is a navigation request, show the offline page
        if (request.mode === "navigate") {
            const offlinePage = await caches.match("/offline");
            if (offlinePage) return offlinePage;
        }

        return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
        });
    }
}

/**
 * Cache-first: Try cache, fall back to network.
 * Good for static assets and product images that rarely change.
 */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        return new Response("", { status: 408, statusText: "Request Timeout" });
    }
}

// ─── Push Notifications ──────────────────────────────────

/**
 * Handle incoming push notifications from the server.
 */
self.addEventListener("push", (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = {
            title: "Mohawk Medibles",
            body: event.data.text(),
            icon: "/icons/icon-192.png",
            url: "https://mohawkmedibles.ca",
        };
    }

    const options = {
        body: data.body || "",
        icon: data.icon || "/icons/icon-192.png",
        badge: data.badge || "/icons/badge-72.png",
        tag: data.tag || "mohawk-medibles",
        renotify: true,
        requireInteraction: false,
        data: {
            url: data.url || "https://mohawkmedibles.ca",
        },
        actions: [
            { action: "open", title: "View" },
            { action: "dismiss", title: "Dismiss" },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Mohawk Medibles", options)
    );
});

/**
 * Handle notification click — open the target URL or focus existing tab.
 */
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "dismiss") return;

    const targetUrl = event.notification.data?.url || "https://mohawkmedibles.ca";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// ─── Helpers ──────────────────────────────────────────────

/**
 * Determine if a pathname points to a static asset.
 */
function isStaticAsset(pathname) {
    const staticExtensions = [
        ".js",
        ".css",
        ".woff",
        ".woff2",
        ".ttf",
        ".otf",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".avif",
        ".svg",
        ".ico",
    ];
    return staticExtensions.some((ext) => pathname.endsWith(ext));
}
