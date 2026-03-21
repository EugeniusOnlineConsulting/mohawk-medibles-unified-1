/**
 * Customer Segments Router — Purchase behavior segmentation
 * Ported from mohawk-medibles2 (Express/Drizzle) to Next.js/Prisma
 * Uses StoreSetting for segment definitions since there's no CustomerSegment model
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

const ruleSchema = z.object({
  type: z.string(),
  operator: z.string(),
  value: z.union([z.number(), z.string(), z.array(z.number()), z.array(z.string())]),
});

interface Segment {
  id: number;
  name: string;
  description: string;
  rules: any[];
  isPreset: boolean;
  customerCount: number;
  createdAt: string;
}

async function getSegments(prisma: any): Promise<Segment[]> {
  const setting = await prisma.storeSetting.findUnique({
    where: { settingKey: "customerSegments" },
  });
  return setting?.settingValue ? JSON.parse(setting.settingValue) : [];
}

async function saveSegments(prisma: any, segments: Segment[]) {
  await prisma.storeSetting.upsert({
    where: { settingKey: "customerSegments" },
    update: { settingValue: JSON.stringify(segments) },
    create: {
      settingKey: "customerSegments",
      settingValue: JSON.stringify(segments),
      settingGroup: "marketing",
    },
  });
}

async function countMatchingCustomers(prisma: any, rules: any[]): Promise<number> {
  // Build a query based on rules against User + Order aggregates
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      totalSpent: true,
      ordersCount: true,
      orders: {
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "desc" as const },
        take: 1,
      },
    },
  });

  return users.filter((u: any) => {
    const totalSpend = u.totalSpent || 0;
    const orderCount = u.ordersCount || 0;
    const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;
    const lastOrderDate = u.orders?.[0]?.createdAt;
    const daysSinceLastOrder = lastOrderDate
      ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
      : 9999;

    return rules.every((rule: any) => {
      let val: number;
      switch (rule.type) {
        case "totalSpend":
          val = totalSpend;
          break;
        case "orderCount":
          val = orderCount;
          break;
        case "avgOrderValue":
          val = avgOrderValue;
          break;
        case "recency":
          val = daysSinceLastOrder;
          break;
        default:
          return true;
      }
      const target = Number(rule.value);
      switch (rule.operator) {
        case "gte":
          return val >= target;
        case "lte":
          return val <= target;
        case "eq":
          return val === target;
        default:
          return true;
      }
    });
  }).length;
}

export const customerSegmentsRouter = router({
  // ─── List Segments ─────────────────────────────────────
  list: adminProcedure.query(async ({ ctx }) => {
    const segments = await getSegments(ctx.prisma);
    // Refresh customer counts
    for (const seg of segments) {
      seg.customerCount = await countMatchingCustomers(ctx.prisma, seg.rules);
    }
    return segments;
  }),

  // ─── Get Single Segment ────────────────────────────────
  get: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const segments = await getSegments(ctx.prisma);
      const segment = segments.find((s) => s.id === input.id);
      if (!segment) return null;
      segment.customerCount = await countMatchingCustomers(ctx.prisma, segment.rules);
      return segment;
    }),

  // ─── Customers in Segment ─────────────────────────────
  customers: adminProcedure
    .input(z.object({ id: z.number(), limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const segments = await getSegments(ctx.prisma);
      const segment = segments.find((s) => s.id === input.id);
      if (!segment) return [];

      const users = await ctx.prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          name: true,
          email: true,
          totalSpent: true,
          ordersCount: true,
          orders: {
            select: { total: true, createdAt: true },
            orderBy: { createdAt: "desc" as const },
            take: 1,
          },
        },
      });

      const matching = users
        .map((u: any) => {
          const totalSpend = u.totalSpent || 0;
          const orderCount = u.ordersCount || 0;
          const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;
          const lastOrderDate = u.orders?.[0]?.createdAt;
          const daysSinceLastOrder = lastOrderDate
            ? Math.floor(
                (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
              )
            : 9999;

          return { ...u, totalSpend, orderCount, avgOrderValue, daysSinceLastOrder };
        })
        .filter((u: any) => {
          return segment.rules.every((rule: any) => {
            let val: number;
            switch (rule.type) {
              case "totalSpend":
                val = u.totalSpend;
                break;
              case "orderCount":
                val = u.orderCount;
                break;
              case "avgOrderValue":
                val = u.avgOrderValue;
                break;
              case "recency":
                val = u.daysSinceLastOrder;
                break;
              default:
                return true;
            }
            const target = Number(rule.value);
            switch (rule.operator) {
              case "gte":
                return val >= target;
              case "lte":
                return val <= target;
              case "eq":
                return val === target;
              default:
                return true;
            }
          });
        });

      return matching.slice(0, input.limit);
    }),

  // ─── Create Segment ────────────────────────────────────
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().default(""),
        rules: z.array(ruleSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const segments = await getSegments(ctx.prisma);
      const newId = segments.length > 0 ? Math.max(...segments.map((s) => s.id)) + 1 : 1;
      const count = await countMatchingCustomers(ctx.prisma, input.rules);

      segments.push({
        id: newId,
        name: input.name,
        description: input.description,
        rules: input.rules,
        isPreset: false,
        customerCount: count,
        createdAt: new Date().toISOString(),
      });

      await saveSegments(ctx.prisma, segments);
      return { id: newId };
    }),

  // ─── Delete Segment ────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      let segments = await getSegments(ctx.prisma);
      segments = segments.filter((s) => s.id !== input.id);
      await saveSegments(ctx.prisma, segments);
      return { success: true };
    }),

  // ─── Preview (for create dialog) ──────────────────────
  preview: adminProcedure
    .input(z.object({ rules: z.array(ruleSchema) }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: { role: "CUSTOMER" },
        select: {
          id: true,
          name: true,
          email: true,
          totalSpent: true,
          ordersCount: true,
          orders: {
            select: { total: true, createdAt: true },
            orderBy: { createdAt: "desc" as const },
            take: 1,
          },
        },
      });

      const matching = users.filter((u: any) => {
        const totalSpend = u.totalSpent || 0;
        const orderCount = u.ordersCount || 0;
        const avgOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;
        const lastOrderDate = u.orders?.[0]?.createdAt;
        const daysSinceLastOrder = lastOrderDate
          ? Math.floor(
              (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 9999;

        return input.rules.every((rule) => {
          let val: number;
          switch (rule.type) {
            case "totalSpend":
              val = totalSpend;
              break;
            case "orderCount":
              val = orderCount;
              break;
            case "avgOrderValue":
              val = avgOrderValue;
              break;
            case "recency":
              val = daysSinceLastOrder;
              break;
            default:
              return true;
          }
          const target = Number(rule.value);
          switch (rule.operator) {
            case "gte":
              return val >= target;
            case "lte":
              return val <= target;
            case "eq":
              return val === target;
            default:
              return true;
          }
        });
      });

      return {
        count: matching.length,
        sample: matching.slice(0, 5).map((u: any) => ({ name: u.name, email: u.email })),
      };
    }),

  // ─── Seed Presets ──────────────────────────────────────
  seedPresets: adminProcedure.mutation(async ({ ctx }) => {
    const segments = await getSegments(ctx.prisma);
    const presets: Omit<Segment, "id" | "customerCount">[] = [
      {
        name: "VIP Customers",
        description: "High-value customers who have spent $500+",
        rules: [{ type: "totalSpend", operator: "gte", value: 500 }],
        isPreset: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Repeat Buyers",
        description: "Customers with 3+ orders",
        rules: [{ type: "orderCount", operator: "gte", value: 3 }],
        isPreset: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "At Risk",
        description: "Customers inactive for 60+ days",
        rules: [{ type: "recency", operator: "gte", value: 60 }],
        isPreset: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "New Customers",
        description: "Customers with exactly 1 order",
        rules: [{ type: "orderCount", operator: "eq", value: 1 }],
        isPreset: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "High AOV",
        description: "Customers with average order value $100+",
        rules: [{ type: "avgOrderValue", operator: "gte", value: 100 }],
        isPreset: true,
        createdAt: new Date().toISOString(),
      },
    ];

    let created = 0;
    const maxId = segments.length > 0 ? Math.max(...segments.map((s) => s.id)) : 0;

    for (const preset of presets) {
      const exists = segments.find((s) => s.name === preset.name);
      if (!exists) {
        const count = await countMatchingCustomers(ctx.prisma, preset.rules);
        segments.push({
          ...preset,
          id: maxId + created + 1,
          customerCount: count,
        });
        created++;
      }
    }

    await saveSegments(ctx.prisma, segments);
    return { created };
  }),
});
