/**
 * Restock Alerts Router — Low stock management, scanning, digest emails
 * Ported from mohawk-medibles2 (Express/Drizzle) to Next.js/Prisma
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const restockAlertsRouter = router({
  // ─── Stats ─────────────────────────────────────────────
  stats: adminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [active, outOfStock, critical, warning, acknowledged, snoozed, resolvedToday] =
      await Promise.all([
        ctx.prisma.restockAlert.count({ where: { status: "active" } }),
        ctx.prisma.restockAlert.count({ where: { status: "active", currentStock: 0 } }),
        ctx.prisma.restockAlert.count({ where: { status: "active", severity: "critical" } }),
        ctx.prisma.restockAlert.count({ where: { status: "active", severity: "warning" } }),
        ctx.prisma.restockAlert.count({ where: { status: "acknowledged" } }),
        ctx.prisma.restockAlert.count({ where: { status: "snoozed" } }),
        ctx.prisma.restockAlert.count({
          where: { status: "resolved", resolvedAt: { gte: today } },
        }),
      ]);

    return { active, outOfStock, critical, warning, acknowledged, snoozed, resolvedToday };
  }),

  // ─── List Alerts ───────────────────────────────────────
  list: adminProcedure
    .input(
      z.object({
        status: z.string().default("active"),
        severity: z.string().default("all"),
        page: z.number().default(1),
        limit: z.number().default(25),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.status !== "all") where.status = input.status;
      if (input.severity !== "all") where.severity = input.severity;
      if (input.search) {
        where.productName = { contains: input.search, mode: "insensitive" };
      }

      const [alerts, total] = await Promise.all([
        ctx.prisma.restockAlert.findMany({
          where,
          orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.restockAlert.count({ where }),
      ]);

      return { alerts, total };
    }),

  // ─── History (recently resolved) ───────────────────────
  history: adminProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.restockAlert.findMany({
        where: { status: "resolved" },
        orderBy: { resolvedAt: "desc" },
        take: input.limit,
      });
    }),

  // ─── Scan Inventory ────────────────────────────────────
  scan: adminProcedure.mutation(async ({ ctx }) => {
    // Get all products with inventory
    const products = await ctx.prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { inventory: true },
    });

    let created = 0;
    let resolved = 0;

    for (const product of products) {
      const stock = product.inventory?.quantity ?? 0;
      const threshold = product.inventory?.lowStockAt ?? 5;

      if (stock <= threshold) {
        // Determine severity
        const severity =
          stock === 0
            ? "out_of_stock"
            : stock <= Math.floor(threshold / 2)
            ? "critical"
            : "warning";

        // Check for existing active alert
        const existing = await ctx.prisma.restockAlert.findFirst({
          where: {
            productId: product.id,
            status: { in: ["active", "acknowledged", "snoozed"] },
          },
        });

        if (!existing) {
          await ctx.prisma.restockAlert.create({
            data: {
              productId: product.id,
              productName: product.name,
              currentStock: stock,
              threshold,
              severity,
              status: "active",
            },
          });
          created++;
        } else {
          // Update current stock and severity
          await ctx.prisma.restockAlert.update({
            where: { id: existing.id },
            data: { currentStock: stock, severity },
          });
        }
      } else {
        // Resolve any active alerts for products now above threshold
        const activeAlerts = await ctx.prisma.restockAlert.findMany({
          where: {
            productId: product.id,
            status: { in: ["active", "acknowledged"] },
          },
        });
        for (const alert of activeAlerts) {
          await ctx.prisma.restockAlert.update({
            where: { id: alert.id },
            data: {
              status: "resolved",
              resolvedAt: new Date(),
              notes: "Auto-resolved: stock above threshold",
            },
          });
          resolved++;
        }
      }
    }

    return { created, resolved };
  }),

  // ─── Acknowledge ───────────────────────────────────────
  acknowledge: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.restockAlert.update({
        where: { id: input.alertId },
        data: { status: "acknowledged", acknowledgedAt: new Date() },
      });
    }),

  // ─── Resolve ───────────────────────────────────────────
  resolve: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.restockAlert.update({
        where: { id: input.alertId },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: ctx.userId,
        },
      });
    }),

  // ─── Snooze ────────────────────────────────────────────
  snooze: adminProcedure
    .input(z.object({ alertId: z.number(), hours: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const snoozedUntil = new Date(Date.now() + input.hours * 60 * 60 * 1000);
      return ctx.prisma.restockAlert.update({
        where: { id: input.alertId },
        data: { status: "snoozed", snoozedUntil },
      });
    }),

  // ─── Restock (add inventory) ───────────────────────────
  restock: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        variantId: z.number().nullable().optional(),
        addQuantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current inventory
      const inv = await ctx.prisma.inventory.findUnique({
        where: { productId: input.productId },
      });

      const prevQty = inv?.quantity ?? 0;
      const newQty = prevQty + input.addQuantity;

      // Update inventory
      await ctx.prisma.inventory.upsert({
        where: { productId: input.productId },
        update: { quantity: newQty },
        create: { productId: input.productId, quantity: newQty },
      });

      // Log the change
      await ctx.prisma.inventoryLog.create({
        data: {
          productId: input.productId,
          variantId: input.variantId ?? null,
          previousQuantity: prevQty,
          newQuantity: newQty,
          changeAmount: input.addQuantity,
          reason: "restock",
          userId: ctx.userId,
          notes: `Restocked via admin alert panel`,
        },
      });

      // Resolve active alerts for this product
      await ctx.prisma.restockAlert.updateMany({
        where: {
          productId: input.productId,
          status: { in: ["active", "acknowledged"] },
        },
        data: {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: ctx.userId,
          notes: `Restocked: +${input.addQuantity} units (new total: ${newQty})`,
        },
      });

      return { success: true, newQuantity: newQty };
    }),

  // ─── Bulk Update Thresholds ────────────────────────────
  bulkUpdateThresholds: adminProcedure
    .input(
      z.object({
        productIds: z.array(z.number()),
        threshold: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      for (const productId of input.productIds) {
        await ctx.prisma.inventory.upsert({
          where: { productId },
          update: { lowStockAt: input.threshold },
          create: { productId, quantity: 0, lowStockAt: input.threshold },
        });
      }
      return { updated: input.productIds.length };
    }),

  // ─── Digest Settings ──────────────────────────────────
  digestSettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.storeSetting.findUnique({
      where: { settingKey: "restockDigestSettings" },
    });
    const parsed = settings?.settingValue
      ? JSON.parse(settings.settingValue)
      : {
          enabled: false,
          frequency: "daily",
          hour: 9,
          minute: 0,
          minSeverity: "warning",
        };
    return {
      settings: parsed,
      status: { isRunning: parsed.enabled, lastRunAt: null, nextRunAt: null, totalRuns: 0 },
    };
  }),

  // ─── Update Digest Settings ────────────────────────────
  updateDigestSettings: adminProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        frequency: z.enum(["daily", "weekly"]).optional(),
        hour: z.number().min(0).max(23).optional(),
        minute: z.number().min(0).max(59).optional(),
        minSeverity: z.enum(["warning", "critical", "out_of_stock"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.storeSetting.findUnique({
        where: { settingKey: "restockDigestSettings" },
      });
      const current = existing?.settingValue
        ? JSON.parse(existing.settingValue)
        : { enabled: false, frequency: "daily", hour: 9, minute: 0, minSeverity: "warning" };

      const updated = { ...current, ...input };

      await ctx.prisma.storeSetting.upsert({
        where: { settingKey: "restockDigestSettings" },
        update: { settingValue: JSON.stringify(updated) },
        create: {
          settingKey: "restockDigestSettings",
          settingValue: JSON.stringify(updated),
          settingGroup: "inventory",
        },
      });

      return updated;
    }),

  // ─── Send Digest (manual trigger) ─────────────────────
  sendDigest: adminProcedure.mutation(async ({ ctx }) => {
    const activeAlerts = await ctx.prisma.restockAlert.findMany({
      where: { status: { in: ["active", "acknowledged"] } },
      orderBy: { severity: "asc" },
    });

    if (activeAlerts.length === 0) {
      return { sent: false, alertCount: 0 };
    }

    // TODO: Send email via Resend with alert summary
    console.log(`[Restock Digest] Would send digest with ${activeAlerts.length} alerts`);

    return { sent: true, alertCount: activeAlerts.length };
  }),

  // ─── Digest History ────────────────────────────────────
  digestHistory: adminProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async () => {
      // Digest history is stored in StoreSetting as JSON for simplicity
      return [];
    }),
});
