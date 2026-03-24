/**
 * Fraud Detection Router — Admin fraud review and management
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const fraudRouter = router({
  // ─── Get fraud alerts (orders with fraud flags) ────────────
  getAlerts: adminProcedure
    .input(
      z.object({
        status: z.enum(["ALL", "SUSPICIOUS", "BLOCKED", "CLEAN"]).optional().default("ALL"),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input.status !== "ALL") {
        where.status = input.status;
      }

      const [alerts, total] = await Promise.all([
        ctx.prisma.fraudCheck.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
          skip: input.offset,
          include: {
            order: {
              include: {
                user: { select: { id: true, name: true, email: true, createdAt: true } },
                items: { select: { name: true, quantity: true, price: true, total: true } },
              },
            },
          },
        }),
        ctx.prisma.fraudCheck.count({ where }),
      ]);

      // Stats
      const [pendingReview, suspicious, blocked] = await Promise.all([
        ctx.prisma.fraudCheck.count({ where: { status: "BLOCKED" } }),
        ctx.prisma.fraudCheck.count({ where: { status: "SUSPICIOUS" } }),
        ctx.prisma.fraudCheck.count({
          where: { status: "BLOCKED", reviewedAt: null },
        }),
      ]);

      return {
        alerts,
        total,
        stats: {
          pendingReview: blocked,
          suspicious,
          totalBlocked: pendingReview,
        },
      };
    }),

  // ─── Review a fraud alert (approve or block) ───────────────
  reviewAlert: adminProcedure
    .input(
      z.object({
        fraudCheckId: z.string(),
        action: z.enum(["APPROVE", "BLOCK"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const fraudCheck = await ctx.prisma.fraudCheck.findUnique({
        where: { id: input.fraudCheckId },
        include: { order: true },
      });

      if (!fraudCheck) {
        throw new Error("Fraud check not found");
      }

      if (input.action === "APPROVE") {
        // Approve: move order back to PENDING for processing
        await ctx.prisma.order.update({
          where: { id: fraudCheck.orderId },
          data: { status: "PENDING" },
        });

        await ctx.prisma.orderStatusHistory.create({
          data: {
            orderId: fraudCheck.orderId,
            status: "PENDING",
            note: `Fraud review approved by admin. Original score: ${fraudCheck.score}/100.`,
            changedBy: ctx.userId,
          },
        });

        await ctx.prisma.fraudCheck.update({
          where: { id: input.fraudCheckId },
          data: {
            status: "CLEAN",
            reviewedBy: ctx.userId,
            reviewedAt: new Date(),
          },
        });

        return { success: true, action: "APPROVED", orderId: fraudCheck.orderId };
      } else {
        // Block: cancel the order
        await ctx.prisma.order.update({
          where: { id: fraudCheck.orderId },
          data: { status: "CANCELLED", paymentStatus: "FAILED" },
        });

        await ctx.prisma.orderStatusHistory.create({
          data: {
            orderId: fraudCheck.orderId,
            status: "CANCELLED",
            note: `Order blocked by admin fraud review. Score: ${fraudCheck.score}/100. Flags: ${JSON.stringify(fraudCheck.flags)}`,
            changedBy: ctx.userId,
          },
        });

        await ctx.prisma.fraudCheck.update({
          where: { id: input.fraudCheckId },
          data: {
            status: "BLOCKED",
            reviewedBy: ctx.userId,
            reviewedAt: new Date(),
          },
        });

        return { success: true, action: "BLOCKED", orderId: fraudCheck.orderId };
      }
    }),

  // ─── Get fraud stats for dashboard ─────────────────────────
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalChecks, clean, suspicious, blocked, pendingReview] =
      await Promise.all([
        ctx.prisma.fraudCheck.count(),
        ctx.prisma.fraudCheck.count({ where: { status: "CLEAN" } }),
        ctx.prisma.fraudCheck.count({ where: { status: "SUSPICIOUS" } }),
        ctx.prisma.fraudCheck.count({ where: { status: "BLOCKED" } }),
        ctx.prisma.fraudCheck.count({
          where: { status: "BLOCKED", reviewedAt: null },
        }),
      ]);

    // Average fraud score (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChecks = await ctx.prisma.fraudCheck.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { score: true },
    });

    const avgScore =
      recentChecks.length > 0
        ? Math.round(
            recentChecks.reduce((sum, c) => sum + c.score, 0) /
              recentChecks.length
          )
        : 0;

    return {
      totalChecks,
      clean,
      suspicious,
      blocked,
      pendingReview,
      avgScore,
    };
  }),
});
