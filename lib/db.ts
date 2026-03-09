/**
 * Mohawk Medibles — Database Client & Utilities
 * Wraps Prisma for use across Next.js server components, API routes, and agents.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Prevent hot-reload from creating multiple Prisma instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const pool = new pg.Pool({
        connectionString:
            process.env.DATABASE_URL ||
            "postgresql://mohawk:password@localhost:5432/mohawkmedibles",
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ─── Query Helpers ──────────────────────────────────────────

export async function getOrdersByEmail(email: string) {
    return prisma.order.findMany({
        where: { user: { email } },
        include: {
            items: { include: { product: true } },
            statusHistory: { orderBy: { createdAt: "desc" }, take: 5 },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getOrderByNumber(orderNumber: string) {
    return prisma.order.findUnique({
        where: { orderNumber },
        include: {
            items: { include: { product: true } },
            user: { select: { name: true, email: true, phone: true } },
            address: true,
            statusHistory: { orderBy: { createdAt: "desc" } },
        },
    });
}

export async function getOrderTracking(orderNumber: string) {
    const order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
            orderNumber: true,
            status: true,
            trackingNumber: true,
            carrier: true,
            shippedAt: true,
            deliveredAt: true,
            createdAt: true,
            total: true,
            items: {
                select: { name: true, quantity: true, price: true },
            },
        },
    });
    return order;
}

export async function getDashboardStats() {
    const [totalOrders, totalRevenue, totalCustomers, pendingOrders, lowStockProducts] =
        await Promise.all([
            prisma.order.count(),
            prisma.order.aggregate({ _sum: { total: true } }),
            prisma.user.count({ where: { role: "CUSTOMER" } }),
            prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
            prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
        ]);

    return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total ?? 0,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
    };
}

export async function getRecentOrders(limit = 20) {
    return prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
            items: { select: { name: true, quantity: true } },
        },
    });
}

export async function getLowStockProducts() {
    return prisma.inventory.findMany({
        where: { quantity: { lte: 5 } },
        include: { product: true },
        orderBy: { quantity: "asc" },
    });
}

export async function updateOrderStatus(
    orderId: string,
    status: string,
    note?: string,
    changedBy?: string
) {
    return prisma.$transaction([
        prisma.order.update({
            where: { id: orderId },
            data: { status: status as any },
        }),
        prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: status as any,
                note,
                changedBy,
            },
        }),
    ]);
}
