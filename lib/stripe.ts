/**
 * Mohawk Medibles — Stripe Payment Integration
 * ═════════════════════════════════════════════
 * Handles checkout sessions, webhooks, and refunds.
 */

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";

// ─── Stripe API Helper ──────────────────────────────────────

async function stripeRequest(endpoint: string, body: Record<string, string | number>) {
    const formBody = Object.entries(body)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");

    const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${STRIPE_SECRET}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Stripe API error: ${err.error?.message || res.statusText}`);
    }

    return res.json();
}

async function stripeGet(endpoint: string) {
    const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
        headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
    });
    if (!res.ok) throw new Error(`Stripe GET error: ${res.statusText}`);
    return res.json();
}

// ─── Checkout Session ───────────────────────────────────────

export interface CheckoutItem {
    name: string;
    price: number;     // in dollars (CAD)
    quantity: number;
    productId: string;
}

export async function createCheckoutSession(
    items: CheckoutItem[],
    customerEmail?: string,
    discountAmount?: number,
    freeShipping?: boolean,
    couponCode?: string
) {
    // Build line_items in Stripe's form-encoded format
    const lineItemParams: Record<string, string | number> = {};
    items.forEach((item, i) => {
        lineItemParams[`line_items[${i}][price_data][currency]`] = "cad";
        lineItemParams[`line_items[${i}][price_data][unit_amount]`] = Math.round(item.price * 100);
        lineItemParams[`line_items[${i}][price_data][product_data][name]`] = item.name;
        lineItemParams[`line_items[${i}][quantity]`] = item.quantity;
    });

    const params: Record<string, string | number> = {
        ...lineItemParams,
        mode: "payment",
        success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/checkout/cancelled`,
        "shipping_address_collection[allowed_countries][0]": "CA",
        "payment_method_types[0]": "card",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
    };

    // Store coupon info in session metadata for the webhook to process
    if (couponCode) {
        params["metadata[couponCode]"] = couponCode;
    }
    if (discountAmount && discountAmount > 0) {
        params["metadata[discountAmount]"] = String(discountAmount.toFixed(2));
    }
    if (freeShipping) {
        params["metadata[freeShipping]"] = "true";
    }

    return stripeRequest("/checkout/sessions", params);
}

// ─── Retrieve Session ───────────────────────────────────────

export async function getCheckoutSession(sessionId: string) {
    return stripeGet(`/checkout/sessions/${sessionId}`);
}

// ─── Refund ─────────────────────────────────────────────────

export async function createRefund(paymentIntentId: string, amountCents?: number) {
    const params: Record<string, string | number> = {
        payment_intent: paymentIntentId,
    };
    if (amountCents) params.amount = amountCents;
    return stripeRequest("/refunds", params);
}

// ─── Webhook Signature Verification ─────────────────────────

export async function verifyStripeWebhook(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    // Stripe uses HMAC-SHA256 for webhook verification
    const encoder = new TextEncoder();
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
    const sig = parts.find((p) => p.startsWith("v1="))?.split("=").slice(1).join("=");

    if (!timestamp || !sig) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const expected = Array.from(new Uint8Array(mac))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return expected === sig;
}
