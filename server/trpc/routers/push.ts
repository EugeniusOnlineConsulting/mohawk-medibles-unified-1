/**
 * Push Notifications Router — tRPC procedures for Web Push management
 * Protected routes for subscribe/unsubscribe, admin routes for broadcast.
 */
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { broadcastPush, sendPushToUser } from "@/lib/webpush";

export const pushRouter = router({
    // ─── Subscribe ────────────────────────────────────────
    subscribe: protectedProcedure
        .input(
            z.object({
                endpoint: z.string().url(),
                p256dh: z.string().min(1),
                auth: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.pushSubscription.upsert({
                    where: { endpoint: input.endpoint },
                    update: {
                        userId: ctx.userId,
                        p256dh: input.p256dh,
                        auth: input.auth,
                        updatedAt: new Date(),
                    },
                    create: {
                        userId: ctx.userId,
                        endpoint: input.endpoint,
                        p256dh: input.p256dh,
                        auth: input.auth,
                    },
                });
                return { success: true };
            } catch (e) {
                console.warn("[push] subscribe failed (table may not exist yet):", (e as Error).message);
                return { success: false };
            }
        }),

    // ─── Unsubscribe ──────────────────────────────────────
    unsubscribe: protectedProcedure
        .input(z.object({ endpoint: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.pushSubscription.deleteMany({
                    where: {
                        endpoint: input.endpoint,
                        userId: ctx.userId,
                    },
                });
                return { success: true };
            } catch (e) {
                console.warn("[push] unsubscribe failed (table may not exist yet):", (e as Error).message);
                return { success: true };
            }
        }),

    // ─── Get Status ───────────────────────────────────────
    getStatus: protectedProcedure.query(async ({ ctx }) => {
        try {
            const count = await ctx.prisma.pushSubscription.count({
                where: { userId: ctx.userId },
            });
            return { isSubscribed: count > 0, subscriptionCount: count };
        } catch (e) {
            console.warn("[push] getStatus failed (table may not exist yet):", (e as Error).message);
            return { isSubscribed: false, subscriptionCount: 0 };
        }
    }),

    // ─── Admin: Send to All ───────────────────────────────
    sendToAll: adminProcedure
        .input(
            z.object({
                title: z.string().min(1).max(100),
                body: z.string().min(1).max(500),
                url: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const result = await broadcastPush(input.title, input.body, input.url);
            return result;
        }),

    // ─── Admin: Send to Specific User ─────────────────────
    sendToUser: adminProcedure
        .input(
            z.object({
                userId: z.string().min(1),
                title: z.string().min(1).max(100),
                body: z.string().min(1).max(500),
                url: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const count = await sendPushToUser(
                input.userId,
                input.title,
                input.body,
                input.url
            );
            return { sent: count };
        }),

    // ─── Admin: Get Subscriber Count ──────────────────────
    getSubscriberCount: adminProcedure.query(async ({ ctx }) => {
        const [total, uniqueUsers] = await Promise.all([
            ctx.prisma.pushSubscription.count(),
            ctx.prisma.pushSubscription.groupBy({
                by: ["userId"],
            }),
        ]);
        return { totalSubscriptions: total, uniqueUsers: uniqueUsers.length };
    }),

    // ─── Admin: Recent Subscribers ────────────────────────
    recentSubscribers: adminProcedure
        .input(z.object({ limit: z.number().default(20) }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.pushSubscription.findMany({
                take: input.limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
            });
        }),
});
