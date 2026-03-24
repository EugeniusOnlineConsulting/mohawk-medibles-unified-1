/**
 * Compare Router — Fetch multiple products by slug for comparison
 */
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const compareRouter = router({
  getProductsBySlugs: publicProcedure
    .input(
      z.object({
        slugs: z.array(z.string()).min(1).max(4),
      })
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          slug: { in: input.slugs },
          status: "ACTIVE",
        },
        include: {
          specs: true,
          inventory: {
            select: { quantity: true },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
          variants: {
            where: { isActive: true },
            select: { name: true, price: true, stockQuantity: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return products.map((p) => {
        const reviewCount = p.reviews.length;
        const avgRating =
          reviewCount > 0
            ? Math.round(
                (p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
              ) / 10
            : 0;

        let terpenes: string[] = [];
        if (p.specs?.terpenes) {
          try {
            terpenes = JSON.parse(p.specs.terpenes);
          } catch {
            terpenes = p.specs.terpenes
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean);
          }
        }

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          subcategory: p.subcategory,
          price: p.price,
          salePrice: p.salePrice,
          image: p.image,
          altText: p.altText,
          shortDescription: p.shortDescription,
          featured: p.featured,
          specs: {
            thc: p.specs?.thc ?? null,
            cbd: p.specs?.cbd ?? null,
            type: p.specs?.type ?? null,
            weight: p.specs?.weight ?? null,
            terpenes,
          },
          stockQuantity: p.inventory?.quantity ?? null,
          avgRating,
          reviewCount,
          variants: p.variants.map((v) => ({
            name: v.name,
            price: v.price,
            inStock: v.stockQuantity > 0,
          })),
        };
      });
    }),
});
