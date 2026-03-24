/**
 * Wholesale / B2B Router — tRPC endpoints for wholesale program
 * Handles applications, accounts, orders, and admin management
 */
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const wholesaleRouter = router({
  // ─── Submit wholesale application ─────────────────────
  submitApplication: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(2),
        businessType: z.enum(["DISPENSARY", "DELIVERY", "RETAILER", "OTHER"]),
        taxId: z.string().optional(),
        website: z.string().optional(),
        phone: z.string().min(7),
        email: z.string().email(),
        estimatedMonthlyVolume: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = await ctx.prisma.wholesaleApplication.findUnique({
          where: { userId: ctx.userId },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already submitted a wholesale application.",
          });
        }

        const existingAccount = await ctx.prisma.wholesaleAccount.findUnique({
          where: { userId: ctx.userId },
        });
        if (existingAccount) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You already have a wholesale account.",
          });
        }

        return await ctx.prisma.wholesaleApplication.create({
          data: {
            userId: ctx.userId,
            businessName: input.businessName,
            businessType: input.businessType,
            taxId: input.taxId || null,
            website: input.website || null,
            phone: input.phone,
            email: input.email,
            estimatedMonthlyVolume: input.estimatedMonthlyVolume || null,
            message: input.message || null,
          },
        });
      } catch (e) {
        if (e instanceof TRPCError) throw e;
        console.warn("[wholesale] submitApplication failed (table may not exist yet):", (e as Error).message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "The wholesale program is being set up. Please try again later.",
        });
      }
    }),

  // ─── Get my wholesale account ─────────────────────────
  getMyAccount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const account = await ctx.prisma.wholesaleAccount.findUnique({
        where: { userId: ctx.userId },
      });
      const application = await ctx.prisma.wholesaleApplication.findUnique({
        where: { userId: ctx.userId },
      });
      return { account, application };
    } catch (e) {
      console.warn("[wholesale] getMyAccount failed (table may not exist yet):", (e as Error).message);
      return { account: null, application: null };
    }
  }),

  // ─── Get my wholesale orders ──────────────────────────
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    try {
      const account = await ctx.prisma.wholesaleAccount.findUnique({
        where: { userId: ctx.userId },
      });
      if (!account) return [];
      return await ctx.prisma.wholesaleOrder.findMany({
        where: { wholesaleAccountId: account.id },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("[wholesale] getMyOrders failed (table may not exist yet):", (e as Error).message);
      return [];
    }
  }),

  // ─── Place wholesale order ────────────────────────────
  placeOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            name: z.string(),
            sku: z.string().optional(),
            quantity: z.number().min(1),
            unitPrice: z.number().min(0),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.wholesaleAccount.findUnique({
        where: { userId: ctx.userId },
      });
      if (!account || !account.approved) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have an approved wholesale account.",
        });
      }

      const subtotal = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const discountAmount = subtotal * (account.discountPercent / 100);
      const total = subtotal - discountAmount;

      const orderNumber = `WS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const paymentDueDate =
        account.netTerms > 0
          ? new Date(Date.now() + account.netTerms * 24 * 60 * 60 * 1000)
          : null;

      return ctx.prisma.wholesaleOrder.create({
        data: {
          wholesaleAccountId: account.id,
          orderNumber,
          items: input.items,
          subtotal,
          discount: discountAmount,
          total,
          paymentDueDate,
          notes: input.notes || null,
        },
      });
    }),

  // ─── Admin: List applications ─────────────────────────
  listApplications: adminProcedure
    .input(
      z
        .object({
          status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.wholesaleApplication.findMany({
        where: input?.status ? { status: input.status } : undefined,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    }),

  // ─── Admin: Approve application ───────────────────────
  approveApplication: adminProcedure
    .input(
      z.object({
        applicationId: z.string(),
        tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).default("BRONZE"),
        discountPercent: z.number().min(0).max(50).default(10),
        creditLimit: z.number().min(0).default(0),
        netTerms: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.prisma.wholesaleApplication.findUnique({
        where: { id: input.applicationId },
      });
      if (!app) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }

      await ctx.prisma.$transaction([
        ctx.prisma.wholesaleApplication.update({
          where: { id: input.applicationId },
          data: { status: "APPROVED" },
        }),
        ctx.prisma.wholesaleAccount.create({
          data: {
            userId: app.userId,
            businessName: app.businessName,
            taxId: app.taxId,
            tier: input.tier,
            discountPercent: input.discountPercent,
            creditLimit: input.creditLimit,
            netTerms: input.netTerms,
            approved: true,
            approvedAt: new Date(),
          },
        }),
      ]);

      return { success: true };
    }),

  // ─── Admin: Reject application ────────────────────────
  rejectApplication: adminProcedure
    .input(z.object({ applicationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.wholesaleApplication.update({
        where: { id: input.applicationId },
        data: { status: "REJECTED" },
      });
    }),

  // ─── Admin: List accounts ─────────────────────────────
  listAccounts: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.wholesaleAccount.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ─── Admin: Update account ────────────────────────────
  updateAccount: adminProcedure
    .input(
      z.object({
        accountId: z.string(),
        tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
        discountPercent: z.number().min(0).max(50).optional(),
        creditLimit: z.number().min(0).optional(),
        netTerms: z.number().min(0).optional(),
        approved: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { accountId, ...data } = input;
      return ctx.prisma.wholesaleAccount.update({
        where: { id: accountId },
        data,
      });
    }),

  // ─── Admin: List orders ───────────────────────────────
  listOrders: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.wholesaleOrder.findMany({
      include: {
        wholesaleAccount: {
          select: { businessName: true, user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ─── Admin: Update order status ───────────────────────
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
        paymentStatus: z.enum(["UNPAID", "PAID", "OVERDUE"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { orderId, ...data } = input;
      return ctx.prisma.wholesaleOrder.update({
        where: { id: orderId },
        data,
      });
    }),
});
