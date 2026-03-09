/**
 * Mohawk Medibles — Sentry Error Monitoring
 * ══════════════════════════════════════════
 * Lightweight client-side error capture without the heavy SDK.
 * Uses Sentry's HTTP API directly for minimal bundle impact.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";
const ENVIRONMENT = process.env.NODE_ENV || "development";

function parseDSN(dsn: string) {
    try {
        const url = new URL(dsn);
        const projectId = url.pathname.replace("/", "");
        const publicKey = url.username;
        const host = url.hostname;
        return { projectId, publicKey, host };
    } catch {
        return null;
    }
}

const parsed = SENTRY_DSN ? parseDSN(SENTRY_DSN) : null;

export function captureException(error: Error, context?: Record<string, unknown>) {
    if (!parsed) {
        console.error("[Sentry] DSN not configured. Error:", error.message);
        return;
    }

    const envelope = {
        event_id: crypto.randomUUID().replace(/-/g, ""),
        timestamp: new Date().toISOString(),
        platform: "javascript",
        environment: ENVIRONMENT,
        exception: {
            values: [
                {
                    type: error.name,
                    value: error.message,
                    stacktrace: error.stack
                        ? {
                            frames: error.stack


                                .split("\n")
                                .slice(1, 10)
                                .map((line) => ({ filename: line.trim() })),
                        }
                        : undefined,
                },
            ],
        },
        tags: { app: "mohawk-medibles" },
        extra: context || {},
    };

    const sentryUrl = `https://${parsed.host}/api/${parsed.projectId}/store/?sentry_version=7&sentry_key=${parsed.publicKey}`;

    fetch(sentryUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envelope),
    }).catch(() => {
        // Silently fail — we don't want error monitoring to cause errors
    });
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
    captureException(new Error(message), { level });
}

// ─── Global Error Handler (call once in layout) ─────────────

export function initErrorMonitoring() {
    if (typeof window === "undefined") return;

    window.addEventListener("unhandledrejection", (e) => {
        captureException(
            e.reason instanceof Error ? e.reason : new Error(String(e.reason)),
            { type: "unhandledrejection" }
        );
    });

    window.addEventListener("error", (e) => {
        if (e.error) {
            captureException(e.error, { type: "uncaught" });
        }
    });
}
