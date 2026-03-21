/**
 * Review Incentives Router — Reward customers for reviews
 * Ported from mohawk-medibles2 (Express/Drizzle) to Next.js/Prisma
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

const DEFAULT_SETTINGS = {
  enabled: false,
  incentiveType: "points", // points, discount, both
  pointsAmount: 50,
  discountType: "percentage",
  discountValue: 10,
  discountMinOrder: 0,
  discountExpiryDays: 30,
  photoBonusEnabled: false,
  photoBonusMultiplier: 1.5,
  photoBonusExtraDiscount: 5,
  photoMinCount: 1,
  maxIncentivesPerUser: 5,
  requireMinLength: 0,
  mentionInReviewRequest: true,
};

export const reviewIncentivesRouter = router({
  // ─── Settings ──────────────────────────────────────────
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const setting = await ctx.prisma.storeSetting.findUnique({
      where: { settingKey: "reviewIncentiveSettings" },
    });
    return setting?.settingValue
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(setting.settingValue) }
      : DEFAULT_SETTINGS;
  }),

  updateSettings: adminProcedure
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.storeSetting.findUnique({
        where: { settingKey: "reviewIncentiveSettings" },
      });
      const current = existing?.settingValue
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(existing.settingValue) }
        : DEFAULT_SETTINGS;

      const updated = { ...current, ...input };

      await ctx.prisma.storeSetting.upsert({
        where: { settingKey: "reviewIncentiveSettings" },
        update: { settingValue: JSON.stringify(updated) },
        create: {
          settingKey: "reviewIncentiveSettings",
          settingValue: JSON.stringify(updated),
          settingGroup: "reviews",
        },
      });

      return updated;
    }),

  // ─── Stats ─────────────────────────────────────────────
  stats: adminProcedure.query(async ({ ctx }) => {
    const setting = await ctx.prisma.storeSetting.findUnique({
      where: { settingKey: "reviewIncentiveStats" },
    });
    return setting?.settingValue
      ? JSON.parse(setting.settingValue)
      : {
          totalAwarded: 0,
          totalPointsAwarded: 0,
          totalCouponsGenerated: 0,
          couponsRedeemed: 0,
          averageRating: "N/A",
          incentivizedReviewCount: 0,
        };
  }),

  // ─── History ───────────────────────────────────────────
  history: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx }) => {
      // Incentive history is stored in StoreSetting JSON for simplicity
      const setting = await ctx.prisma.storeSetting.findUnique({
        where: { settingKey: "reviewIncentiveHistory" },
      });
      return setting?.settingValue ? JSON.parse(setting.settingValue) : [];
    }),

  // ─── Incentive Text Preview ────────────────────────────
  getIncentiveText: adminProcedure
    .input(z.object({ lang: z.enum(["en", "fr"]) }))
    .query(async ({ ctx, input }) => {
      const setting = await ctx.prisma.storeSetting.findUnique({
        where: { settingKey: "reviewIncentiveSettings" },
      });
      const settings = setting?.settingValue
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(setting.settingValue) }
        : DEFAULT_SETTINGS;

      if (!settings.enabled) return null;

      if (input.lang === "fr") {
        if (settings.incentiveType === "points") {
          return `Gagnez ${settings.pointsAmount} points de fidelite en laissant un avis!`;
        } else if (settings.incentiveType === "discount") {
          return `Recevez ${settings.discountValue}${settings.discountType === "percentage" ? "%" : "$"} de rabais en laissant un avis!`;
        }
        return `Gagnez ${settings.pointsAmount} points ET ${settings.discountValue}${settings.discountType === "percentage" ? "%" : "$"} de rabais!`;
      }

      if (settings.incentiveType === "points") {
        return `Earn ${settings.pointsAmount} loyalty points by leaving a review!`;
      } else if (settings.incentiveType === "discount") {
        return `Get ${settings.discountValue}${settings.discountType === "percentage" ? "%" : "$"} off your next order by leaving a review!`;
      }
      return `Earn ${settings.pointsAmount} points AND ${settings.discountValue}${settings.discountType === "percentage" ? "%" : "$"} off by leaving a review!`;
    }),
});
