/**
 * Admin Orders API — Hardened with rate limiting + validation
 * POST /api/admin/orders (mutations: update-status, ship-order, track)
 * GET  /api/admin/orders?action=list|stats|detail|low-stock
 */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import { AdminOrderAction, AdminOrdersQuery, validateBody, validateQuery } from "@/lib/validation";
import { log } from "@/lib/logger";
import { requireAdmin, isAuthError } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    // ── Auth check ───────────────────────────────────────────
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    // ── Validate query ──────────────────────────────────────
    const parsed = validateQuery(AdminOrdersQuery, req.nextUrl.searchParams);
    if (!parsed.success) return parsed.error;

    const { action, limit, orderNumber } = parsed.data;

    try {
        const { prisma } = await import("@/lib/db");

        switch (action) {
            case "stats": {
                const [totalOrders, totalCustomers, totalProducts] = await Promise.all([
                    prisma.order.count(),
                    prisma.user.count({ where: { role: "CUSTOMER" } }),
                    prisma.product.count({ where: { status: "ACTIVE" } }),
                ]);
                const recentRevenue = await prisma.order.aggregate({
                    _sum: { total: true },
                    where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
                });
                return NextResponse.json({
                    totalOrders,
                    totalCustomers,
                    totalProducts,
                    monthlyRevenue: recentRevenue._sum.total || 0,
                });
            }

            case "detail": {
                if (!orderNumber) {
                    return NextResponse.json({ error: "orderNumber required" }, { status: 400 });
                }
                const order = await prisma.order.findUnique({
                    where: { orderNumber },
                    include: { items: true, statusHistory: true, user: { select: { name: true, email: true } } },
                });
                if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
                return NextResponse.json(order);
            }

            case "low-stock": {
                const lowStock = await prisma.inventory.findMany({
                    where: { quantity: { lte: 5 } },
                    include: { product: { select: { name: true, slug: true, price: true } } },
                    take: limit,
                });
                return NextResponse.json({ items: lowStock });
            }

            default: {
                const orders = await prisma.order.findMany({
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        items: { select: { name: true, quantity: true, price: true } },
                        user: { select: { name: true, email: true } },
                    },
                });
                return NextResponse.json({ orders });
            }
        }
    } catch (error) {
        log.admin.error("Orders GET error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    // ── Rate limit ──────────────────────────────────────────
    const limited = await applyRateLimit(req, RATE_LIMITS.admin);
    if (limited) return limited;

    // ── Auth check ───────────────────────────────────────────
    const auth = requireAdmin(req);
    if (isAuthError(auth)) return auth;

    // ── Parse & validate body ───────────────────────────────
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = validateBody(AdminOrderAction, body);
    if (!parsed.success) return parsed.error;

    const data = parsed.data;

    try {
        const { prisma } = await import("@/lib/db");
        const { processOrderForShipping, getTracking } = await import("@/lib/shipstation");

        switch (data.action) {
            case "update-status": {
                const order = await prisma.order.update({
                    where: { id: data.orderId },
                    data: { status: data.status },
                    include: { user: { select: { id: true } } },
                });
                // Add to status history
                await prisma.orderStatusHistory.create({
                    data: {
                        orderId: data.orderId,
                        status: data.status,
                        note: data.note || `Status updated to ${data.status}`,
                        changedBy: auth.userId,
                    },
                });
                // Send push notification for order status change
                if (order.userId) {
                    import("@/lib/webpush").then(({ notifyOrderStatusChange }) => {
                        notifyOrderStatusChange(order.userId!, order.orderNumber, data.status).catch(() => {});
                    });
                }
                return NextResponse.json({ success: true, order });
            }

            case "ship-order": {
                const od = data.orderData;
                const totalWeight = od.items.reduce((sum, i) => sum + (i.weight || 1) * i.quantity, 0);
                const result = await processOrderForShipping({
                    customerEmail: "",
                    customerName: od.recipientName,
                    shippingAddress: {
                        name: od.recipientName,
                        address_line1: od.street1,
                        address_line2: od.street2,
                        city_locality: od.city,
                        state_province: od.province,
                        postal_code: od.postalCode,
                        country_code: od.country || "CA",
                        phone: od.phone,
                    },
                    items: od.items.map((item) => ({
                        name: item.name,
                        quantity: item.quantity,
                        sku: (item as Record<string, unknown>).sku as string || undefined,
                        unit_price: { amount: item.price, currency: "CAD" },
                        weight: { value: item.weight || 1, unit: "ounce" as const },
                    })),
                    totalWeight: { value: totalWeight, unit: "ounce" },
                });
                if (result.labelId) {
                    await prisma.order.update({
                        where: { id: od.orderId },
                        data: {
                            shipstationId: result.labelId,
                            trackingNumber: result.trackingNumber || undefined,
                            carrier: result.carrier || undefined,
                            shippingLabel: result.labelPdfUrl || undefined,
                            status: "LABEL_PRINTED",
                        },
                    });
                }
                return NextResponse.json({ success: true, ...result });
            }

            case "track": {
                const trackingInfo = await getTracking(data.labelId);
                return NextResponse.json(trackingInfo);
            }
        }
    } catch (error) {
        log.admin.error("Orders POST error", { error: error instanceof Error ? error.message : "Unknown" });
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
