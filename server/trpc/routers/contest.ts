/**
 * Contest Router — Public listings + Protected entry + Admin CRUD + Winner drawing
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";
import { drawWinner } from "@/lib/contestDrawing";
import { TRPCError } from "@trpc/server";

const contestInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  prize: z.string().min(1).max(500),
  prizeImage: z.string().nullable().optional(),
  entryMethod: z.enum(["FREE", "PURCHASE", "SIGNUP", "POINTS"]),
  minPurchaseAmount: z.number().positive().nullable().optional(),
  pointsCost: z.number().int().positive().nullable().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.enum(["DRAFT", "ACTIVE", "ENDED"]).optional(),
  maxEntries: z.number().int().positive().nullable().optional(),
});

export const contestRouter = router({
  // ─── Public: list active contests ─────────────────────
  getActive: publicProcedure.query(async ({ ctx }) => {
    try {
      const now = new Date();
      const contests = await ctx.prisma.contest.findMany({
        where: {
          status: "ACTIVE",
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          _count: { select: { entries: true } },
        },
        orderBy: { endDate: "asc" },
      });

      // Also get total weighted entries
      const withCounts = await Promise.all(
        contests.map(async (c) => {
          const agg = await ctx.prisma.contestEntry.aggregate({
            where: { contestId: c.id },
            _sum: { entries: true },
          });
          return { ...c, totalEntries: agg._sum.entries ?? 0 };
        })
      );

      return withCounts;
    } catch (e) {
      console.warn("[contest] getActive failed (table may not exist yet):", (e as Error).message);
      return [];
    }
  }),

  // ─── Public: list past contests with winners ──────────
  getPast: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.contest.findMany({
        where: { status: "ENDED" },
        include: {
          winner: { select: { id: true, name: true } },
          _count: { select: { entries: true } },
        },
        orderBy: { endDate: "desc" },
        take: 20,
      });
    } catch (e) {
      console.warn("[contest] getPast failed (table may not exist yet):", (e as Error).message);
      return [];
    }
  }),

  // ─── Protected: enter a contest ───────────────────────
  enter: protectedProcedure
    .input(z.object({ contestId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const contest = await ctx.prisma.contest.findUnique({
        where: { id: input.contestId },
        include: { _count: { select: { entries: true } } },
      });

      if (!contest) throw new TRPCError({ code: "NOT_FOUND", message: "Contest not found" });

      const now = new Date();
      if (contest.status !== "ACTIVE" || now < contest.startDate || now > contest.endDate) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contest is not active" });
      }

      // Check max entries
      if (contest.maxEntries && contest._count.entries >= contest.maxEntries) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Contest is full" });
      }

      // Check already entered
      const existing = await ctx.prisma.contestEntry.findUnique({
        where: { contestId_userId: { contestId: input.contestId, userId: ctx.userId } },
      });
      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already entered this contest" });
      }

      // Entry method validation
      if (contest.entryMethod === "PURCHASE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `This contest requires a purchase of $${contest.minPurchaseAmount?.toFixed(2) || "any amount"} to enter`,
        });
      }

      if (contest.entryMethod === "SIGNUP") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This contest is for new signups only",
        });
      }

      if (contest.entryMethod === "POINTS") {
        const cost = contest.pointsCost || 100;
        // Check user's loyalty points
        const pointsAgg = await ctx.prisma.loyaltyPoint.aggregate({
          where: { userId: ctx.userId },
          _sum: { points: true },
        });
        const balance = pointsAgg._sum.points ?? 0;
        if (balance < cost) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Not enough points. Need ${cost}, you have ${balance}`,
          });
        }

        // Deduct points
        await ctx.prisma.loyaltyPoint.create({
          data: {
            userId: ctx.userId,
            points: -cost,
            type: "redeem",
            description: `Contest entry: ${contest.title}`,
          },
        });
      }

      // Create entry (FREE or POINTS)
      const entry = await ctx.prisma.contestEntry.create({
        data: { contestId: input.contestId, userId: ctx.userId, entries: 1 },
      });

      return { success: true, entry };
    }),

  // ─── Protected: get my entries ────────────────────────
  getMyEntries: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.contestEntry.findMany({
      where: { userId: ctx.userId },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            prize: true,
            prizeImage: true,
            endDate: true,
            status: true,
            winnerId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ─── Admin: list all contests ─────────────────────────
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.contest.findMany({
      include: {
        winner: { select: { id: true, name: true, email: true } },
        _count: { select: { entries: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ─── Admin: create contest ────────────────────────────
  create: adminProcedure
    .input(contestInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contest.create({
        data: {
          title: input.title,
          description: input.description,
          prize: input.prize,
          prizeImage: input.prizeImage ?? null,
          entryMethod: input.entryMethod,
          minPurchaseAmount: input.minPurchaseAmount ?? null,
          pointsCost: input.pointsCost ?? null,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          status: input.status ?? "DRAFT",
          maxEntries: input.maxEntries ?? null,
        },
      });
    }),

  // ─── Admin: update contest ────────────────────────────
  update: adminProcedure
    .input(z.object({ id: z.number().int() }).merge(contestInput.partial()))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.prize !== undefined) updateData.prize = data.prize;
      if (data.prizeImage !== undefined) updateData.prizeImage = data.prizeImage ?? null;
      if (data.entryMethod !== undefined) updateData.entryMethod = data.entryMethod;
      if (data.minPurchaseAmount !== undefined) updateData.minPurchaseAmount = data.minPurchaseAmount ?? null;
      if (data.pointsCost !== undefined) updateData.pointsCost = data.pointsCost ?? null;
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate as string);
      if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate as string);
      if (data.status !== undefined) updateData.status = data.status;
      if (data.maxEntries !== undefined) updateData.maxEntries = data.maxEntries ?? null;

      return ctx.prisma.contest.update({ where: { id }, data: updateData });
    }),

  // ─── Admin: delete contest ────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.contest.delete({ where: { id: input.id } });
    }),

  // ─── Admin: get entries for a contest ─────────────────
  getEntries: adminProcedure
    .input(z.object({ contestId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.contestEntry.findMany({
        where: { contestId: input.contestId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { entries: "desc" },
      });
    }),

  // ─── Admin: draw winner ───────────────────────────────
  drawWinner: adminProcedure
    .input(z.object({ contestId: z.number().int() }))
    .mutation(async ({ input }) => {
      return drawWinner(input.contestId);
    }),
});
