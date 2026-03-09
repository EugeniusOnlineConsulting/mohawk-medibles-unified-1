/**
 * Cart Sync API — /api/cart/sync
 * ═══════════════════════════════
 * POST: Sync client cart state to server for abandoned cart tracking.
 * Sets mm-cart-id cookie for cross-session identification.
 */

import { NextRequest, NextResponse } from "next/server";
import { saveCart } from "@/lib/abandonedCart";
import { pushEvent } from "@/lib/activityStream";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
    const limited = applyRateLimit(req, RATE_LIMITS.support);
    if (limited) return limited;

    let body: { items?: { id: string; name: string; price: number; quantity: number }[]; email?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { items, email } = body;

    if (!items || !Array.isArray(items)) {
        return NextResponse.json({ error: "items[] required" }, { status: 400 });
    }

    // Validate items
    const validItems = items
        .filter((i) => i.id && typeof i.price === "number" && typeof i.quantity === "number")
        .slice(0, 50); // cap at 50 items

    // Get or create cart ID from cookie
    let cartId = req.cookies.get("mm-cart-id")?.value;
    const isNew = !cartId;
    if (!cartId) {
        cartId = randomUUID();
    }

    // Validate email if provided
    const safeEmail = email && typeof email === "string" && email.includes("@") && email.length < 255
        ? email.trim().toLowerCase()
        : undefined;

    // Save to in-memory store
    const snapshot = saveCart(cartId, validItems, safeEmail);

    // Push activity event
    if (validItems.length > 0) {
        const topItem = validItems[0];
        pushEvent("cart_add", {
            productName: topItem.name || "Unknown",
            amount: snapshot.total,
        });
    }

    const response = NextResponse.json({
        cartId,
        itemCount: snapshot.items.length,
        total: snapshot.total,
    });

    // Set cart ID cookie (30 days, httpOnly)
    if (isNew) {
        response.cookies.set("mm-cart-id", cartId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: "/",
        });
    }

    return response;
}
