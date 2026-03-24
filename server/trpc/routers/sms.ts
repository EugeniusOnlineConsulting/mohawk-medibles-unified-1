/**
 * SMS Router — tRPC procedures for SMS notifications
 * Handles opt-in management, admin SMS blasts, and log viewing.
 */
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { validatePhone, formatPhone, maskPhone } from "@/lib/phoneValidation";
import { sendPromoSMS, sendAndLogSMS } from "@/lib/sms";

export const smsRouter = router({
  /**
   * Get current user's SMS opt-in status.
   */
  getOptInStatus: protectedProcedure.query(async ({ ctx }) => {
    const optIn = await ctx.prisma.smsOptIn.findUnique({
      where: { userId: ctx.userId },
    });

    return {
      optedIn: optIn?.optedIn ?? false,
      phone: optIn?.phone ?? null,
      hasOptIn: !!optIn,
    };
  }),

  /**
   * Update SMS opt-in status and phone number.
   */
  updateOptIn: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(1),
        optedIn: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate phone
      const validation = validatePhone(input.phone);
      if (!validation.valid) {
        throw new Error(validation.reason || "Invalid phone number");
      }

      const formatted = formatPhone(input.phone);
      if (!formatted) {
        throw new Error("Could not format phone number");
      }

      const existing = await ctx.prisma.smsOptIn.findUnique({
        where: { userId: ctx.userId },
      });

      if (existing) {
        await ctx.prisma.smsOptIn.update({
          where: { userId: ctx.userId },
          data: {
            phone: formatted,
            optedIn: input.optedIn,
          },
        });
      } else {
        await ctx.prisma.smsOptIn.create({
          data: {
            userId: ctx.userId,
            phone: formatted,
            optedIn: input.optedIn,
          },
        });
      }

      return { success: true, phone: formatted, optedIn: input.optedIn };
    }),

  /**
   * Admin: Get SMS logs with filtering.
   */
  getLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(0).default(0),
        limit: z.number().min(1).max(100).default(20),
        status: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.type) where.type = input.type;

      const [logs, total] = await Promise.all([
        ctx.prisma.smsLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: input.page * input.limit,
          take: input.limit,
        }),
        ctx.prisma.smsLog.count({ where }),
      ]);

      return {
        logs: logs.map((log: any) => ({
          ...log,
          phone: maskPhone(log.phone),
        })),
        total,
        pages: Math.ceil(total / input.limit),
      };
    }),

  /**
   * Admin: Send promo SMS blast to all opted-in users.
   */
  sendBlast: adminProcedure
    .input(
      z.object({
        message: z.string().min(1).max(160),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const optedInUsers = await ctx.prisma.smsOptIn.findMany({
        where: { optedIn: true },
        select: { phone: true, userId: true },
      });

      if (optedInUsers.length === 0) {
        return { sent: 0, failed: 0, total: 0 };
      }

      let sent = 0;
      let failed = 0;

      // Send in parallel batches of 10
      const batchSize = 10;
      for (let i = 0; i < optedInUsers.length; i += batchSize) {
        const batch = optedInUsers.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(async (user) => {
            const result = await sendPromoSMS(user.phone, input.message);
            // Log to DB
            await sendAndLogSMS({
              phone: user.phone,
              message: `${input.message}\n\nReply STOP to unsubscribe. Mohawk Medibles`,
              type: "PROMO",
              userId: user.userId,
            }).catch(() => {});
            return result;
          })
        );

        for (const r of results) {
          if (r.status === "fulfilled" && r.value.success) sent++;
          else failed++;
        }
      }

      return { sent, failed, total: optedInUsers.length };
    }),

  /**
   * Admin: Get SMS stats dashboard data.
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalSent, totalFailed, totalQueued, optInCount, recentLogs] =
      await Promise.all([
        ctx.prisma.smsLog.count({ where: { status: "SENT" } }),
        ctx.prisma.smsLog.count({ where: { status: "FAILED" } }),
        ctx.prisma.smsLog.count({ where: { status: "QUEUED" } }),
        ctx.prisma.smsOptIn.count({ where: { optedIn: true } }),
        ctx.prisma.smsLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            phone: true,
            type: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    const totalMessages = totalSent + totalFailed;
    const deliveryRate =
      totalMessages > 0 ? Math.round((totalSent / totalMessages) * 100) : 0;

    return {
      totalSent,
      totalFailed,
      totalQueued,
      optInCount,
      deliveryRate,
      twilioConfigured: !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      ),
      recentLogs: recentLogs.map((log: any) => ({
        ...log,
        phone: maskPhone(log.phone),
      })),
    };
  }),
});
