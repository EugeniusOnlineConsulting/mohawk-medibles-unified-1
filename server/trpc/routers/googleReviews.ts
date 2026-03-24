/**
 * Google Reviews Router — Public summary + Admin sync/list
 */
import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { syncGoogleReviews, getReviewSummary } from "@/lib/googleReviews";

export const googleReviewsRouter = router({
  /** Public: get rating, count, recent reviews */
  getSummary: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).optional() }).optional())
    .query(async ({ input }) => {
      try {
        return await getReviewSummary(input?.limit ?? 5);
      } catch (e) {
        console.warn("[googleReviews] getSummary failed (table may not exist yet):", (e as Error).message);
        return { averageRating: 0, totalReviews: 0, lastSyncedAt: null, placeId: null, reviews: [] };
      }
    }),

  /** Admin: trigger manual sync */
  syncNow: adminProcedure.mutation(async () => {
    const result = await syncGoogleReviews();
    return result;
  }),

  /** Admin: list all synced reviews */
  getAll: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).optional(),
        perPage: z.number().min(1).max(100).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const perPage = input?.perPage ?? 20;

      const [reviews, total] = await Promise.all([
        ctx.prisma.googleReview.findMany({
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        ctx.prisma.googleReview.count(),
      ]);

      const meta = await ctx.prisma.googleReviewMeta.findUnique({
        where: { id: "main" },
      });

      return {
        reviews,
        total,
        page,
        perPage,
        averageRating: meta?.averageRating ?? 0,
        totalReviews: meta?.totalReviews ?? 0,
        lastSyncedAt: meta?.lastSyncedAt ?? null,
      };
    }),
});
