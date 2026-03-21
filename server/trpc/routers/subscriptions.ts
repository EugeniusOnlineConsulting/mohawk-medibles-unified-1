/**
 * Subscriptions Router — Auto-reorder subscription management
 * Ported from mohawk-medibles2 (Express/Drizzle) to Next.js/Prisma
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const subscriptionsRouter = router({
  // ─── Admin List ────────────────────────────────────────
  adminList: adminProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const subscriptions = await ctx.prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, price: true } },
        },
      });

      return {
        subscriptions: subscriptions.map((s) => ({
          id: s.id,
          userId: s.userId,
          userName: s.user.name,
          userEmail: s.user.email,
          productId: s.productId,
          productName: s.product.name,
          quantity: s.quantity,
          frequency: s.frequency,
          price: s.product.price * s.quantity * (1 - s.discountPercent / 100),
          status: s.status,
          nextOrderAt: s.nextOrderDate,
          lastOrderAt: s.lastOrderDate,
          totalOrders: s.totalOrders,
          createdAt: s.createdAt,
        })),
      };
    }),

  // ─── Admin Stats ───────────────────────────────────────
  adminStats: adminProcedure.query(async ({ ctx }) => {
    const [active, total, paused] = await Promise.all([
      ctx.prisma.subscription.count({ where: { status: "active" } }),
      ctx.prisma.subscription.count(),
      ctx.prisma.subscription.count({ where: { status: "paused" } }),
    ]);

    // Sum total orders across all subscriptions
    const agg = await ctx.prisma.subscription.aggregate({
      _sum: { totalOrders: true },
    });

    return {
      active,
      total,
      paused,
      totalOrders: agg._sum.totalOrders || 0,
    };
  }),
});
