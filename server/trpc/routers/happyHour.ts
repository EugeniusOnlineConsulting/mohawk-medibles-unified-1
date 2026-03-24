/**
 * Happy Hour Router — Public active check + Admin CRUD
 */
import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { getActiveHappyHours } from "@/lib/happyHour";

const happyHourInput = z.object({
  name: z.string().min(1).max(100),
  discountPercent: z.number().int().min(1).max(90),
  categorySlug: z.string().nullable().optional(),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(0).max(23),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
  active: z.boolean().optional(),
});

export const happyHourRouter = router({
  /** Public: get currently active happy hours */
  getActive: publicProcedure.query(async () => {
    try {
      return await getActiveHappyHours();
    } catch (e) {
      console.warn("[happyHour] getActive failed (table may not exist yet):", (e as Error).message);
      return [];
    }
  }),

  /** Admin: list all happy hours */
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.happyHour.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  /** Admin: create new happy hour */
  create: adminProcedure
    .input(happyHourInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.happyHour.create({
        data: {
          name: input.name,
          discountPercent: input.discountPercent,
          categorySlug: input.categorySlug ?? null,
          startHour: input.startHour,
          endHour: input.endHour,
          daysOfWeek: input.daysOfWeek,
          active: input.active ?? true,
        },
      });
    }),

  /** Admin: update happy hour */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: happyHourInput.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.happyHour.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  /** Admin: delete happy hour */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.happyHour.delete({
        where: { id: input.id },
      });
    }),
});
