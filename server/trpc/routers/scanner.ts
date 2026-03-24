/**
 * Scanner Router — tRPC endpoints for QR/barcode scanning POS operations
 * Handles product lookup, order verification, and stock adjustments
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const scannerRouter = router({
  // ─── Look up product by SKU or barcode ────────────────
  lookupProduct: adminProcedure
    .input(z.object({ sku: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findFirst({
        where: {
          OR: [
            { sku: input.sku },
            { slug: input.sku },
          ],
        },
        include: {
          inventory: true,
          specs: true,
        },
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      return product;
    }),

  // ─── Verify order by order number ─────────────────────
  verifyOrder: adminProcedure
    .input(z.object({ orderNumber: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: {
          items: { include: { product: true } },
          user: { select: { name: true, email: true, phone: true } },
        },
      });
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // Mark as picked up (COMPLETED) if currently in a shippable state
      const pickupStatuses = ["PENDING", "PROCESSING", "PAYMENT_CONFIRMED", "LABEL_PRINTED"];
      if (pickupStatuses.includes(order.status)) {
        await ctx.prisma.$transaction([
          ctx.prisma.order.update({
            where: { id: order.id },
            data: { status: "COMPLETED" },
          }),
          ctx.prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: "COMPLETED",
              note: "Marked as picked up via QR scan",
              changedBy: ctx.userId,
            },
          }),
        ]);
        return { ...order, status: "COMPLETED", markedPickedUp: true };
      }

      return { ...order, markedPickedUp: false };
    }),

  // ─── Quick stock adjustment ───────────────────────────
  adjustStock: adminProcedure
    .input(
      z.object({
        sku: z.string(),
        adjustment: z.number(), // positive = add, negative = remove
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findFirst({
        where: {
          OR: [
            { sku: input.sku },
            { slug: input.sku },
          ],
        },
        include: { inventory: true },
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      if (!product.inventory) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product has no inventory record",
        });
      }

      const newQty = Math.max(0, product.inventory.quantity + input.adjustment);

      const [updatedInventory] = await ctx.prisma.$transaction([
        ctx.prisma.inventory.update({
          where: { productId: product.id },
          data: { quantity: newQty },
        }),
        ctx.prisma.inventoryLog.create({
          data: {
            productId: product.id,
            previousQuantity: product.inventory.quantity,
            newQuantity: newQty,
            changeAmount: input.adjustment,
            reason: input.reason || (input.adjustment > 0 ? "restock" : "adjustment"),
            userId: ctx.userId,
            notes: `Stock ${input.adjustment > 0 ? "added" : "removed"} via barcode scanner`,
          },
        }),
      ]);

      return {
        product: { id: product.id, name: product.name, sku: product.sku },
        previousQty: product.inventory.quantity,
        newQty: updatedInventory.quantity,
        adjustment: input.adjustment,
      };
    }),
});
