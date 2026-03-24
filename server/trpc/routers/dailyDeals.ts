/**
 * Daily Deals Router — Public deal fetching + Admin CRUD
 */
import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const dealInput = z.object({
  productSlug: z.string().min(1),
  originalPrice: z.number().positive(),
  dealPrice: z.number().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const dailyDealsRouter = router({
  /** Public: get all active deals with time remaining */
  getActive: publicProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date();
      const deals = await ctx.prisma.dailyDeal.findMany({
        where: {
          active: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { endDate: "asc" },
      });

      return deals.map((deal) => {
        const msRemaining = deal.endDate.getTime() - now.getTime();
        const hoursRemaining = msRemaining / (1000 * 60 * 60);
        const savingsPercent = Math.round(
          ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100
        );
        const isNew =
          now.getTime() - deal.createdAt.getTime() < 24 * 60 * 60 * 1000;

        return {
          ...deal,
          startDate: deal.startDate.toISOString(),
          endDate: deal.endDate.toISOString(),
          createdAt: deal.createdAt.toISOString(),
          updatedAt: deal.updatedAt.toISOString(),
          msRemaining,
          hoursRemaining,
          savingsPercent,
          isNew,
          isEndingSoon: hoursRemaining < 4,
        };
      });
    } catch (e) {
      console.warn("[dailyDeals] getActive failed:", (e as Error).message);
      return [];
    }
  }),

  /** Public: get the featured deal of the day */
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date();
      const deal = await ctx.prisma.dailyDeal.findFirst({
        where: {
          active: true,
          featured: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { endDate: "asc" },
      });

      if (!deal) return null;

      const msRemaining = deal.endDate.getTime() - now.getTime();
      const savingsPercent = Math.round(
        ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100
      );

      return {
        ...deal,
        startDate: deal.startDate.toISOString(),
        endDate: deal.endDate.toISOString(),
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
        msRemaining,
        savingsPercent,
      };
    } catch (e) {
      console.warn("[dailyDeals] getFeatured failed:", (e as Error).message);
      return null;
    }
  }),

  /** Admin: list all deals (including expired) */
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.dailyDeal.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Admin: create a new deal */
  create: adminProcedure.input(dealInput).mutation(async ({ ctx, input }) => {
    // If marking as featured, un-feature all others
    if (input.featured) {
      await ctx.prisma.dailyDeal.updateMany({
        where: { featured: true },
        data: { featured: false },
      });
    }

    return ctx.prisma.dailyDeal.create({
      data: {
        productSlug: input.productSlug,
        originalPrice: input.originalPrice,
        dealPrice: input.dealPrice,
        title: input.title,
        description: input.description ?? null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        featured: input.featured ?? false,
        active: input.active ?? true,
      },
    });
  }),

  /** Admin: update a deal */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: dealInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // If marking as featured, un-feature all others
      if (input.data.featured) {
        await ctx.prisma.dailyDeal.updateMany({
          where: { featured: true, id: { not: input.id } },
          data: { featured: false },
        });
      }

      return ctx.prisma.dailyDeal.update({
        where: { id: input.id },
        data: {
          ...(input.data.productSlug !== undefined
            ? { productSlug: input.data.productSlug }
            : {}),
          ...(input.data.originalPrice !== undefined
            ? { originalPrice: input.data.originalPrice }
            : {}),
          ...(input.data.dealPrice !== undefined
            ? { dealPrice: input.data.dealPrice }
            : {}),
          ...(input.data.title !== undefined ? { title: input.data.title } : {}),
          ...(input.data.description !== undefined
            ? { description: input.data.description }
            : {}),
          ...(input.data.startDate !== undefined
            ? { startDate: new Date(input.data.startDate) }
            : {}),
          ...(input.data.endDate !== undefined
            ? { endDate: new Date(input.data.endDate) }
            : {}),
          ...(input.data.featured !== undefined
            ? { featured: input.data.featured }
            : {}),
          ...(input.data.active !== undefined
            ? { active: input.data.active }
            : {}),
        },
      });
    }),

  /** Admin: delete a deal */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dailyDeal.delete({
        where: { id: input.id },
      });
    }),

  /** Admin: set a deal as featured (un-features all others) */
  setFeatured: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.dailyDeal.updateMany({
        where: { featured: true },
        data: { featured: false },
      });

      return ctx.prisma.dailyDeal.update({
        where: { id: input.id },
        data: { featured: true },
      });
    }),
});
