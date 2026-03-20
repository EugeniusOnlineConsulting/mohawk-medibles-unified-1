/**
 * tRPC Core Setup — Mohawk Medibles Command Center
 * Provides context, router factory, and procedure builders.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import superjson from "superjson";
import { prisma } from "@/lib/db";

// Re-export prisma so files importing from @/server/trpc/trpc still work
export { prisma };

// ─── Context ─────────────────────────────────────────────

export interface TRPCContext {
  prisma: PrismaClient;
  userId: string | null;
  userRole: string | null;
  userEmail: string | null;
}

export function createTRPCContext(opts: {
  userId?: string | null;
  userRole?: string | null;
  userEmail?: string | null;
}): TRPCContext {
  return {
    prisma,
    userId: opts.userId ?? null,
    userRole: opts.userRole ?? null,
    userEmail: opts.userEmail ?? null,
  };
}

// ─── tRPC Init ───────────────────────────────────────────

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// ─── Auth Middleware ─────────────────────────────────────

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: ctx.userRole,
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  const adminRoles = ["ADMIN", "SUPER_ADMIN"];
  if (!ctx.userRole || !adminRoles.includes(ctx.userRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: ctx.userRole,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
