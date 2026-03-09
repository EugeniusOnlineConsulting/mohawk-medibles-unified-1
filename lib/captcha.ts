/**
 * Mohawk Medibles — CAPTCHA Verification (Cloudflare Turnstile)
 * ═══════════════════════════════════════════════════════════════
 * Server-side token verification for Cloudflare Turnstile.
 * Protects contact forms, newsletter signup, and auth routes from bots.
 *
 * Environment Variables:
 *   TURNSTILE_SECRET_KEY — Server-side secret key from Cloudflare dashboard
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY — Client-side widget key
 *
 * Usage:
 *   const valid = await verifyCaptcha(token, ip);
 *   if (!valid) return NextResponse.json({ error: "CAPTCHA failed" }, { status: 400 });
 */

import { log } from "@/lib/logger";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Cloudflare Turnstile CAPTCHA token server-side.
 * Returns true if token is valid, false otherwise.
 * If TURNSTILE_SECRET_KEY is not configured, always returns true (dev mode).
 */
export async function verifyCaptcha(
    token: string | undefined | null,
    remoteIp?: string | null
): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;

    // Skip CAPTCHA in development or if not configured
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            log.admin.warn("TURNSTILE_SECRET_KEY not configured — CAPTCHA bypass active");
        }
        return true;
    }

    if (!token) {
        return false;
    }

    try {
        const formData = new URLSearchParams();
        formData.append("secret", secret);
        formData.append("response", token);
        if (remoteIp) formData.append("remoteip", remoteIp);

        const res = await fetch(TURNSTILE_VERIFY_URL, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.success === true;
    } catch (err) {
        log.admin.error("CAPTCHA verification failed", {
            error: err instanceof Error ? err.message : "Unknown",
        });
        // On verification service failure, allow the request through
        // to prevent blocking legitimate users
        return true;
    }
}

/**
 * Get the client IP address from a NextRequest.
 */
export function getClientIp(headers: Headers): string | null {
    return (
        headers.get("cf-connecting-ip") ||
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        null
    );
}
