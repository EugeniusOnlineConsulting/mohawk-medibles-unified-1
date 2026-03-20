/**
 * Team Router — Role management, invites, team operations
 * Ported from command center: server/routers/team/
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const teamRouter = router({
  // ─── Team Members ───────────────────────────────────────
  listMembers: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { role: { not: "CUSTOMER" } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.enum(["CUSTOMER", "SUPPORT", "LOGISTICS", "ADMIN", "SUPER_ADMIN"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { role: true },
      });

      if (!user) throw new Error("User not found");

      // Log role change
      await ctx.prisma.roleChangeHistory.create({
        data: {
          userId: input.userId,
          oldRole: user.role,
          newRole: input.newRole,
          changedBy: ctx.userId!,
          reason: input.reason,
        },
      });

      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.newRole },
      });
    }),

  // ─── Custom Roles ───────────────────────────────────────
  listCustomRoles: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.customRole.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }),

  createCustomRole: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        permissions: z.array(z.string()),
        baseRole: z.string().optional(),
        color: z.string().default("gray"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.customRole.create({
        data: {
          ...input,
          permissions: JSON.stringify(input.permissions),
          createdBy: ctx.userId,
        },
      });
    }),

  // ─── Role Change History ────────────────────────────────
  getRoleHistory: adminProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.roleChangeHistory.findMany({
        where: input.userId ? { userId: input.userId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    }),

  // ─── POS Employees ─────────────────────────────────────
  listPosEmployees: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.posEmployee.findMany({
      orderBy: { name: "asc" },
    });
  }),

  createPosEmployee: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        pin: z.string().min(4),
        role: z.enum(["cashier", "manager", "admin"]).default("cashier"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.posEmployee.create({ data: input });
    }),
});
