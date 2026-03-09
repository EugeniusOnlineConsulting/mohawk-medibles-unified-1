/**
 * Mohawk Medibles — Input Validation Schemas
 * ═══════════════════════════════════════════
 * Zod schemas for all API route inputs.
 * Prevents malformed data, XSS, and type coercion attacks.
 */
import { z } from "zod";

// ─── Sanitizer ──────────────────────────────────────────────

/** Strip HTML tags to prevent stored XSS */
function sanitize(maxLen: number) {
    return z.string().max(maxLen).transform((val) =>
        val.replace(/<[^>]*>/g, "").trim()
    );
}

// ─── Auth Schemas ───────────────────────────────────────────

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const RegisterSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(100).transform((v) => v.trim()),
    phone: z.string().max(20).optional(),
});

// ─── Order Schemas ──────────────────────────────────────────

export const OrderStatusUpdate = z.object({
    action: z.literal("update-status"),
    orderId: z.string().cuid(),
    status: z.enum([
        "PENDING", "PROCESSING", "PAYMENT_CONFIRMED", "LABEL_PRINTED",
        "SHIPPED", "IN_TRANSIT", "DELIVERED", "COMPLETED",
        "CANCELLED", "REFUNDED", "ON_HOLD", "FAILED",
    ]),
    note: sanitize(500).optional(),
});

export const ShipOrderRequest = z.object({
    action: z.literal("ship-order"),
    orderData: z.object({
        orderId: z.string(),
        recipientName: z.string().min(1).max(200),
        street1: z.string().min(1).max(200),
        street2: z.string().max(200).optional(),
        city: z.string().min(1).max(100),
        province: z.string().min(2).max(100),
        postalCode: z.string().min(3).max(10),
        country: z.string().length(2).default("CA"),
        phone: z.string().max(20).optional(),
        items: z.array(
            z.object({
                name: z.string().max(200),
                quantity: z.number().int().positive().max(999),
                price: z.number().nonnegative().max(99999),
                weight: z.number().nonnegative().optional(),
            })
        ).min(1).max(100),
    }),
});

export const TrackingRequest = z.object({
    action: z.literal("track"),
    carrier: z.string().min(1).max(50),
    trackingNumber: z.string().min(1).max(100),
});

export const AdminOrderAction = z.discriminatedUnion("action", [
    OrderStatusUpdate,
    ShipOrderRequest,
    TrackingRequest,
]);

// ─── Admin Query Schemas ────────────────────────────────────

export const AdminOrdersQuery = z.object({
    action: z.enum(["list", "stats", "detail", "low-stock"]).default("list"),
    limit: z.coerce.number().int().positive().max(100).default(20),
    orderNumber: z.string().max(50).optional(),
});

// ─── Support Agent Schemas ──────────────────────────────────

export const SupportIntent = z.object({
    intent: z.enum([
        "track_order",
        "order_history",
        "order_status",
        "return_request",
        "general_inquiry",
    ]),
    params: z.object({
        orderNumber: z.string().max(50).optional(),
        email: z.string().email().max(255).optional(),
    }).default({}),
});

// ─── Content Agent Schemas ──────────────────────────────────

export const ContentGenerate = z.object({
    action: z.enum(["generate", "calendar", "batch", "blog", "product_copy"]).default("generate"),
    channel: z.enum([
        "instagram_post", "instagram_reel", "instagram_story",
        "tiktok", "gmb_post", "blog_post", "email", "twitter_x",
        "product_description",
    ]).default("instagram_post"),
    pillar: z.enum([
        "education", "product_story", "heritage",
        "behind_scenes", "community",
    ]).optional(),
    product_slug: z.string().max(200).optional(),
    keyword: z.string().max(100).optional(),
    custom_topic: sanitize(300).optional(),
    count: z.coerce.number().int().positive().max(50).default(10),
    days: z.coerce.number().int().positive().max(30).default(7),
    channels: z.array(z.string().max(50)).max(10).optional(),
});

// ─── Webhook Schemas ────────────────────────────────────────

export const ShipStationWebhook = z.object({
    resource_url: z.string().url(),
    resource_type: z.enum(["SHIP_NOTIFY", "ORDER_NOTIFY", "ITEM_ORDER_NOTIFY"]),
});

// ─── Address Schema ─────────────────────────────────────────

export const AddressSchema = z.object({
    firstName: z.string().min(1).max(100).transform((v) => v.trim()),
    lastName: z.string().min(1).max(100).transform((v) => v.trim()),
    street1: z.string().min(1).max(200),
    street2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    province: z.string().min(2).max(100),
    postalCode: z.string().min(3).max(10).transform((v) =>
        v.toUpperCase().replace(/\s+/g, " ").trim()
    ),
    country: z.string().length(2).default("CA"),
    phone: z.string().max(20).optional(),
});

// ─── Search / Query ─────────────────────────────────────────

export const SearchQuery = z.object({
    q: sanitize(200),
    category: z.string().max(50).optional(),
    page: z.coerce.number().int().positive().max(100).default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    sort: z.enum(["price_asc", "price_desc", "name", "newest", "popular"]).default("popular"),
});

// ─── Validation Helper ──────────────────────────────────────

import { NextResponse } from "next/server";

/**
 * Validate request body against a Zod schema.
 * Returns parsed data or a 400 error response.
 */
export function validateBody<T extends z.ZodType>(
    schema: T,
    data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: NextResponse } {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));

        return {
            success: false,
            error: NextResponse.json(
                { error: "Validation failed", details: errors },
                { status: 400 }
            ),
        };
    }

    return { success: true, data: result.data };
}

/**
 * Validate query params against a Zod schema.
 */
export function validateQuery<T extends z.ZodType>(
    schema: T,
    searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; error: NextResponse } {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return validateBody(schema, params);
}
