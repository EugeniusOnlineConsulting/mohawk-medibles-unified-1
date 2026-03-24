/**
 * Affiliate Program Router — tRPC endpoints for affiliate management
 * Handles applications, tracking, conversions, payouts, and admin operations
 */
import { z } from "zod";
import { router, protectedProcedure, adminProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const affiliateRouter = router({
  // ─── Public: Apply to become an affiliate ─────────────
  submitApplication: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        website: z.string().optional(),
        socialMedia: z.string().optional(),
        audience: z.string().optional(),
        howPromote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if already applied
        const existing = await ctx.prisma.affiliateApplication.findUnique({
          where: { userId: ctx.userId! },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already submitted an affiliate application.",
          });
        }

        // Check if already an affiliate
        const existingAffiliate = await ctx.prisma.affiliate.findUnique({
          where: { userId: ctx.userId! },
        });
        if (existingAffiliate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You are already an affiliate.",
          });
        }

        return await ctx.prisma.affiliateApplication.create({
          data: {
            userId: ctx.userId!,
            name: input.name,
            email: input.email,
            website: input.website || null,
            socialMedia: input.socialMedia || null,
            audience: input.audience || null,
            howPromote: input.howPromote || null,
          },
        });
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        console.warn("[affiliate] submitApplication failed (table may not exist yet):", (e as Error).message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The affiliate program is being set up. Please try again later.",
        });
      }
    }),

  // ─── Get current user's affiliate status ──────────────
  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [application, affiliate] = await Promise.all([
        ctx.prisma.affiliateApplication.findUnique({
          where: { userId: ctx.userId! },
        }),
        ctx.prisma.affiliate.findUnique({
          where: { userId: ctx.userId! },
        }),
      ]);
      return { application, affiliate };
    } catch (e) {
      console.warn("[affiliate] getMyStatus failed (table may not exist yet):", (e as Error).message);
      return { application: null, affiliate: null };
    }
  }),

  // ─── Get dashboard stats for affiliate ────────────────
  getMyStats: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await ctx.prisma.affiliate.findUnique({
      where: { userId: ctx.userId! },
    });
    if (!affiliate) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Not an affiliate" });
    }

    const [pendingCommission, approvedConversions, totalConversions] =
      await Promise.all([
        ctx.prisma.affiliateConversion.aggregate({
          where: { affiliateId: affiliate.id, status: "PENDING" },
          _sum: { commission: true },
        }),
        ctx.prisma.affiliateConversion.count({
          where: { affiliateId: affiliate.id, status: "APPROVED" },
        }),
        ctx.prisma.affiliateConversion.count({
          where: { affiliateId: affiliate.id },
        }),
      ]);

    const conversionRate =
      affiliate.totalClicks > 0
        ? ((affiliate.totalReferrals / affiliate.totalClicks) * 100).toFixed(1)
        : "0.0";

    return {
      totalEarnings: affiliate.totalEarnings,
      pendingCommission: pendingCommission._sum.commission ?? 0,
      totalReferrals: affiliate.totalReferrals,
      totalClicks: affiliate.totalClicks,
      conversionRate,
      code: affiliate.code,
      commissionRate: affiliate.commissionRate,
      status: affiliate.status,
    };
  }),

  // ─── Get conversions list ─────────────────────────────
  getMyConversions: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const affiliate = await ctx.prisma.affiliate.findUnique({
        where: { userId: ctx.userId! },
      });
      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not an affiliate" });
      }

      return ctx.prisma.affiliateConversion.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Get payouts list ─────────────────────────────────
  getMyPayouts: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const affiliate = await ctx.prisma.affiliate.findUnique({
        where: { userId: ctx.userId! },
      });
      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not an affiliate" });
      }

      return ctx.prisma.affiliatePayout.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Request a payout (min $50) ───────────────────────
  requestPayout: protectedProcedure
    .input(
      z.object({
        method: z.enum(["ETRANSFER", "CRYPTO"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const affiliate = await ctx.prisma.affiliate.findUnique({
        where: { userId: ctx.userId! },
      });
      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not an affiliate" });
      }

      // Calculate available balance (approved conversions minus completed payouts)
      const [approvedCommissions, completedPayouts, pendingPayouts] =
        await Promise.all([
          ctx.prisma.affiliateConversion.aggregate({
            where: { affiliateId: affiliate.id, status: "APPROVED" },
            _sum: { commission: true },
          }),
          ctx.prisma.affiliatePayout.aggregate({
            where: { affiliateId: affiliate.id, status: "COMPLETED" },
            _sum: { amount: true },
          }),
          ctx.prisma.affiliatePayout.aggregate({
            where: { affiliateId: affiliate.id, status: "PENDING" },
            _sum: { amount: true },
          }),
        ]);

      const available =
        (approvedCommissions._sum.commission ?? 0) -
        (completedPayouts._sum.amount ?? 0) -
        (pendingPayouts._sum.amount ?? 0);

      if (available < 50) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum payout is $50. Your available balance is $${available.toFixed(2)}.`,
        });
      }

      return ctx.prisma.affiliatePayout.create({
        data: {
          affiliateId: affiliate.id,
          amount: available,
          method: input.method,
        },
      });
    }),

  // ─── Track a click (public endpoint) ──────────────────
  trackClick: publicProcedure
    .input(
      z.object({
        code: z.string(),
        ip: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
        page: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const affiliate = await ctx.prisma.affiliate.findUnique({
          where: { code: input.code },
        });
        if (!affiliate || affiliate.status !== "ACTIVE") {
          return { success: false };
        }

        await Promise.all([
          ctx.prisma.affiliateClick.create({
            data: {
              affiliateId: affiliate.id,
              ip: input.ip || null,
              userAgent: input.userAgent || null,
              referrer: input.referrer || null,
              page: input.page || null,
            },
          }),
          ctx.prisma.affiliate.update({
            where: { id: affiliate.id },
            data: { totalClicks: { increment: 1 } },
          }),
        ]);

        return { success: true };
      } catch (e) {
        console.warn("[affiliate] trackClick failed (table may not exist yet):", (e as Error).message);
        return { success: false };
      }
    }),

  // ═══════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ═══════════════════════════════════════════════════════

  // ─── List applications ────────────────────────────────
  listApplications: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["PENDING", "APPROVED", "REJECTED"])
          .optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.affiliateApplication.findMany({
        where: input.status ? { status: input.status } : undefined,
        include: { user: { select: { name: true, email: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Approve application ──────────────────────────────
  approveApplication: adminProcedure
    .input(
      z.object({
        applicationId: z.string(),
        commissionRate: z.number().min(1).max(50).default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.prisma.affiliateApplication.findUnique({
        where: { id: input.applicationId },
        include: { user: true },
      });
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      if (app.status !== "PENDING") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Application already processed" });
      }

      // Generate affiliate code from name
      const firstName = app.name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const code = `MOHAWK-${firstName || "AFF"}-${suffix}`;

      // Check uniqueness
      const existing = await ctx.prisma.affiliate.findUnique({ where: { code } });
      const finalCode = existing ? `MOHAWK-${firstName || "AFF"}-${suffix + 1}` : code;

      const [updatedApp, affiliate] = await ctx.prisma.$transaction([
        ctx.prisma.affiliateApplication.update({
          where: { id: input.applicationId },
          data: { status: "APPROVED" },
        }),
        ctx.prisma.affiliate.create({
          data: {
            userId: app.userId,
            code: finalCode,
            commissionRate: input.commissionRate,
          },
        }),
      ]);

      return { application: updatedApp, affiliate };
    }),

  // ─── Reject application ───────────────────────────────
  rejectApplication: adminProcedure
    .input(
      z.object({
        applicationId: z.string(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.affiliateApplication.update({
        where: { id: input.applicationId },
        data: {
          status: "REJECTED",
          adminNote: input.note || null,
        },
      });
    }),

  // ─── List affiliates ──────────────────────────────────
  listAffiliates: adminProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "PAUSED", "BANNED"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.affiliate.findMany({
        where: input.status ? { status: input.status } : undefined,
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          _count: { select: { conversions: true, clicks: true, payouts: true } },
        },
        orderBy: { totalEarnings: "desc" },
        take: input.limit,
      });
    }),

  // ─── Update affiliate (commission, status) ────────────
  updateAffiliate: adminProcedure
    .input(
      z.object({
        affiliateId: z.string(),
        commissionRate: z.number().min(1).max(50).optional(),
        status: z.enum(["ACTIVE", "PAUSED", "BANNED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.affiliate.update({
        where: { id: input.affiliateId },
        data: {
          ...(input.commissionRate !== undefined && {
            commissionRate: input.commissionRate,
          }),
          ...(input.status !== undefined && { status: input.status }),
        },
      });
    }),

  // ─── List payouts (admin) ─────────────────────────────
  listPayouts: adminProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "COMPLETED"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.affiliatePayout.findMany({
        where: input.status ? { status: input.status } : undefined,
        include: {
          affiliate: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Complete a payout ────────────────────────────────
  completePayout: adminProcedure
    .input(z.object({ payoutId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payout = await ctx.prisma.affiliatePayout.findUnique({
        where: { id: input.payoutId },
      });
      if (!payout) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payout not found" });
      }
      if (payout.status === "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payout already completed",
        });
      }

      return ctx.prisma.affiliatePayout.update({
        where: { id: input.payoutId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }),

  // ─── Admin: Approve a conversion ──────────────────────
  approveConversion: adminProcedure
    .input(z.object({ conversionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conversion = await ctx.prisma.affiliateConversion.findUnique({
        where: { id: input.conversionId },
        include: { affiliate: true },
      });
      if (!conversion) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Conversion not found" });
      }

      await ctx.prisma.$transaction([
        ctx.prisma.affiliateConversion.update({
          where: { id: input.conversionId },
          data: { status: "APPROVED" },
        }),
        ctx.prisma.affiliate.update({
          where: { id: conversion.affiliateId },
          data: {
            totalEarnings: { increment: conversion.commission },
          },
        }),
      ]);

      return { success: true };
    }),
});
