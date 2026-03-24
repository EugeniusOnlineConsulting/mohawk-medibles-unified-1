/**
 * Wishlist Sharing Router — Create/manage shared wishlists
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

function generateShareCode(): string {
  return crypto.randomBytes(6).toString("hex"); // 12 char hex string
}

export const wishlistShareRouter = router({
  /** Protected: create or get existing share link */
  createShare: protectedProcedure
    .input(
      z.object({
        title: z.string().max(100).optional(),
      }).optional()
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has a share
      const existing = await ctx.prisma.wishlistShare.findUnique({
        where: { userId: ctx.userId },
      });

      if (existing) {
        // Update title if provided, set public
        const updated = await ctx.prisma.wishlistShare.update({
          where: { id: existing.id },
          data: {
            isPublic: true,
            ...(input?.title !== undefined ? { title: input.title } : {}),
          },
        });
        return {
          shareCode: updated.shareCode,
          url: `https://mohawkmedibles.co/wishlist/shared/${updated.shareCode}`,
          isPublic: updated.isPublic,
          title: updated.title,
        };
      }

      // Create new share
      const shareCode = generateShareCode();
      const share = await ctx.prisma.wishlistShare.create({
        data: {
          userId: ctx.userId,
          shareCode,
          isPublic: true,
          title: input?.title ?? null,
        },
      });

      return {
        shareCode: share.shareCode,
        url: `https://mohawkmedibles.co/wishlist/shared/${share.shareCode}`,
        isPublic: share.isPublic,
        title: share.title,
      };
    }),

  /** Protected: update share settings */
  updateShare: protectedProcedure
    .input(
      z.object({
        title: z.string().max(100).optional().nullable(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.wishlistShare.findUnique({
        where: { userId: ctx.userId },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No shared wishlist found. Create one first.",
        });
      }

      const updated = await ctx.prisma.wishlistShare.update({
        where: { id: existing.id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
        },
      });

      return {
        shareCode: updated.shareCode,
        url: `https://mohawkmedibles.co/wishlist/shared/${updated.shareCode}`,
        isPublic: updated.isPublic,
        title: updated.title,
      };
    }),

  /** Protected: get current user's share info */
  getMyShare: protectedProcedure.query(async ({ ctx }) => {
    const share = await ctx.prisma.wishlistShare.findUnique({
      where: { userId: ctx.userId },
    });

    if (!share) return null;

    return {
      shareCode: share.shareCode,
      url: `https://mohawkmedibles.co/wishlist/shared/${share.shareCode}`,
      isPublic: share.isPublic,
      title: share.title,
    };
  }),

  /** Public: get shared wishlist by code */
  getShared: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.prisma.wishlistShare.findUnique({
        where: { shareCode: input.code },
        include: {
          user: {
            select: {
              name: true,
              wishlistItems: {
                include: {
                  product: {
                    include: { images: true },
                  },
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      if (!share || !share.isPublic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This wishlist is not available.",
        });
      }

      const firstName = share.user.name.split(" ")[0];

      return {
        title: share.title || `${firstName}'s Wishlist`,
        ownerName: firstName,
        items: share.user.wishlistItems.map((wi) => ({
          id: wi.product.id,
          slug: wi.product.slug,
          name: wi.product.name,
          price: wi.product.price,
          salePrice: wi.product.salePrice,
          image: wi.product.image,
          altText: wi.product.altText,
          category: wi.product.category,
        })),
      };
    }),

  /** Protected: revoke sharing (delete share record) */
  deleteShare: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await ctx.prisma.wishlistShare.findUnique({
      where: { userId: ctx.userId },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No shared wishlist found.",
      });
    }

    await ctx.prisma.wishlistShare.delete({
      where: { id: existing.id },
    });

    return { success: true };
  }),
});
