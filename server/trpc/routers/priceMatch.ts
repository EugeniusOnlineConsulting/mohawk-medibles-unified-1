/**
 * Price Match Router — Submit and manage price match requests
 * Public: submit requests | Protected: view own | Admin: list + review
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";

export const priceMatchRouter = router({
  // ── Public: Submit a price match request ──
  submit: publicProcedure
    .input(
      z.object({
        productName: z.string().min(2, "Product name required"),
        competitorUrl: z.string().url("Must be a valid URL"),
        competitorPrice: z.number().positive("Price must be positive"),
        screenshotUrl: z.string().url().optional(),
        email: z.string().email("Valid email required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.priceMatchRequest.create({
        data: {
          userId: ctx.userId ?? undefined,
          email: input.email,
          productName: input.productName,
          competitorUrl: input.competitorUrl,
          competitorPrice: input.competitorPrice,
          screenshotUrl: input.screenshotUrl ?? null,
        },
      });
      return { success: true, id: request.id };
    }),

  // ── Protected: Get my price match requests ──
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.priceMatchRequest.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ── Admin: List all requests with pagination ──
  list: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "ALL"]).default("ALL"),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { status = "ALL", page = 1, limit = 20 } = input ?? {};
      const where = status === "ALL" ? {} : { status: status as any };

      const [requests, total] = await Promise.all([
        ctx.prisma.priceMatchRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: { user: { select: { name: true, email: true } } },
        }),
        ctx.prisma.priceMatchRequest.count({ where }),
      ]);

      return { requests, total, page, limit };
    }),

  // ── Admin: Review (approve/reject) a request ──
  review: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["APPROVED", "REJECTED", "EXPIRED"]),
        matchedPrice: z.number().positive().optional(),
        adminNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.priceMatchRequest.update({
        where: { id: input.id },
        data: {
          status: input.status,
          matchedPrice: input.matchedPrice ?? null,
          adminNote: input.adminNote ?? null,
        },
      });
      return { success: true, request: updated };
    }),

  // ── Admin: Stats overview ──
  stats: adminProcedure.query(async ({ ctx }) => {
    const [total, pending, approved, rejected] = await Promise.all([
      ctx.prisma.priceMatchRequest.count(),
      ctx.prisma.priceMatchRequest.count({ where: { status: "PENDING" } }),
      ctx.prisma.priceMatchRequest.count({ where: { status: "APPROVED" } }),
      ctx.prisma.priceMatchRequest.count({ where: { status: "REJECTED" } }),
    ]);
    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? Math.round((approved / (approved + rejected || 1)) * 100) : 0,
    };
  }),
});
