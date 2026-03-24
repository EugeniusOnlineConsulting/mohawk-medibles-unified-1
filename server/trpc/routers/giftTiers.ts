/**
 * Gift Tiers Router — Public + Admin CRUD for spending threshold rewards
 */
import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { getEligibleGifts, getNextGiftTier, type GiftTier } from "@/lib/giftTiers";

const giftTierInput = z.object({
  threshold: z.number().positive(),
  giftName: z.string().min(1).max(200),
  giftDescription: z.string().min(1).max(1000),
  giftImage: z.string().nullable().optional(),
  active: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const giftTiersRouter = router({
  // ─── Public: get all active tiers sorted by threshold ───
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.giftTier.findMany({
        where: { active: true },
        orderBy: { threshold: "asc" },
      });
    } catch (e) {
      console.warn("[giftTiers] getAll failed (table may not exist yet):", (e as Error).message);
      return [];
    }
  }),

  // ─── Public: given a cart total, return eligible gifts + next tier ───
  getEligible: publicProcedure
    .input(z.object({ cartTotal: z.number().nonnegative() }))
    .query(async ({ ctx, input }) => {
      try {
        const allTiers = await ctx.prisma.giftTier.findMany({
          where: { active: true },
          orderBy: { threshold: "asc" },
        });

        const eligible = getEligibleGifts(input.cartTotal, allTiers as GiftTier[]);
        const next = getNextGiftTier(input.cartTotal, allTiers as GiftTier[]);

        return { eligible, next };
      } catch (e) {
        console.warn("[giftTiers] getEligible failed:", (e as Error).message);
        return { eligible: [], next: null };
      }
    }),

  // ─── Admin: list all tiers (active + inactive) ──────────
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.giftTier.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }),

  // ─── Admin: create ──────────────────────────────────────
  create: adminProcedure
    .input(giftTierInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.giftTier.create({ data: input });
    }),

  // ─── Admin: update ──────────────────────────────────────
  update: adminProcedure
    .input(z.object({ id: z.number().int(), ...giftTierInput.shape }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.giftTier.update({ where: { id }, data });
    }),

  // ─── Admin: delete ──────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.giftTier.delete({ where: { id: input.id } });
    }),
});
