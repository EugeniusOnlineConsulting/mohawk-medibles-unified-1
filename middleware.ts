/**
 * Mohawk Medibles — Auth Middleware
 * ═════════════════════════════════
 * Protects /admin routes + /api/admin/* endpoints.
 * Validates session tokens from cookies or Authorization header.
 * Enforces role-based access control.
 *
 * MedAgent Integration:
 * All /api/sage/* routes are registered as public (no auth).
 * MedAgent-specific headers (X-MedAgent-Version) are injected.
 */
import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PATHS = ["/admin", "/api/admin"];

// Routes that require specific roles
const ROLE_REQUIREMENTS: Record<string, string[]> = {
    "/admin": ["ADMIN", "SUPER_ADMIN", "LOGISTICS", "SUPPORT"],
    "/api/admin": ["ADMIN", "SUPER_ADMIN", "LOGISTICS", "SUPPORT"],
    "/api/admin/orders": ["ADMIN", "SUPER_ADMIN", "LOGISTICS"],
};

// Public API routes (no auth needed)
const PUBLIC_PATHS = [
    "/api/sage",
    "/api/chat",
    "/api/support",
    "/api/content",
    "/api/webhooks",
    "/api/health",
    "/api/voice",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Skip public paths ───────────────────────────────────
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        const response = applySecurityHeaders(NextResponse.next());
        // MedAgent-specific headers for /api/sage/* routes
        if (pathname.startsWith("/api/sage")) {
            response.headers.set("X-MedAgent-Version", "2.2.0");
            response.headers.set("X-Powered-By", "MedAgent Bot");
            response.headers.set("X-UCP-Compatible", "google-ucp-v1");
        }
        return response;
    }

    // ── Skip static files and non-protected routes ──────────
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname.includes(".") ||
        !PROTECTED_PATHS.some((p) => pathname.startsWith(p))
    ) {
        return applySecurityHeaders(NextResponse.next());
    }

    // ── Extract session token ───────────────────────────────
    const token =
        request.cookies.get("mm-session")?.value ||
        request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
        // API routes get 401; pages redirect to login
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Validate token (lightweight check in middleware) ─────
    // Full DB validation happens in the API route itself.
    // Middleware does a structural check + expiry decode.
    try {
        const payload = decodeSessionToken(token);

        if (!payload || payload.exp < Date.now() / 1000) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { error: "Session expired" },
                    { status: 401 }
                );
            }
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // ── Role-based access check ────────────────────────
        const requiredRoles = getRequiredRoles(pathname);
        if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
            if (pathname.startsWith("/api/")) {
                return NextResponse.json(
                    { error: "Insufficient permissions", required: requiredRoles },
                    { status: 403 }
                );
            }
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        // ── Attach user info to request headers ─────────────
        const response = NextResponse.next();
        response.headers.set("x-user-id", payload.sub);
        response.headers.set("x-user-role", payload.role);
        response.headers.set("x-user-email", payload.email || "");

        return applySecurityHeaders(response);
    } catch {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Invalid session token" },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

// ─── Token Decoder ──────────────────────────────────────────

interface SessionPayload {
    sub: string; // user ID
    email?: string;
    role: string;
    exp: number; // expiry timestamp
}

function decodeSessionToken(token: string): SessionPayload | null {
    try {
        // JWT-style: base64url decode the payload (middle segment)
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString("utf-8")
        );

        return {
            sub: payload.sub || payload.userId,
            email: payload.email,
            role: payload.role || "CUSTOMER",
            exp: payload.exp || 0,
        };
    } catch {
        return null;
    }
}

// ─── Role Resolver ──────────────────────────────────────────

function getRequiredRoles(pathname: string): string[] {
    // Find the most specific matching path
    const sortedPaths = Object.keys(ROLE_REQUIREMENTS).sort(
        (a, b) => b.length - a.length
    );
    for (const path of sortedPaths) {
        if (pathname.startsWith(path)) {
            return ROLE_REQUIREMENTS[path];
        }
    }
    return [];
}

// ─── Security Headers ───────────────────────────────────────

function applySecurityHeaders(response: NextResponse): NextResponse {
    // Prevent clickjacking
    response.headers.set("X-Frame-Options", "DENY");
    // Prevent MIME sniffing
    response.headers.set("X-Content-Type-Options", "nosniff");
    // XSS protection (legacy browsers)
    response.headers.set("X-XSS-Protection", "1; mode=block");
    // Referrer policy
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    // Permissions policy
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(self), geolocation=(), payment=()"
    );

    return response;
}

// ─── Matcher ────────────────────────────────────────────────

export const config = {
    matcher: [
        // Match all routes except static files
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
