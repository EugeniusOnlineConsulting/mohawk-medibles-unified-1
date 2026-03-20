/**
 * Inventory Router — Warehouse & stock management
 * Ported from command center: server/routers/inventory/
 */
import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const inventoryRouter = router({
  // ─── Warehouses ─────────────────────────────────────────
  listWarehouses: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }),

  createWarehouse: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        country: z.string().default("CA"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.warehouse.create({ data: input });
    }),

  // ─── Warehouse Inventory ────────────────────────────────
  getWarehouseStock: adminProcedure
    .input(z.object({ warehouseId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.warehouseInventory.findMany({
        where: { warehouseId: input.warehouseId },
        orderBy: { updatedAt: "desc" },
      });
    }),

  updateStock: adminProcedure
    .input(
      z.object({
        warehouseId: z.number(),
        productId: z.number(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.warehouseInventory.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: input.warehouseId,
            productId: input.productId,
          },
        },
        update: { quantity: input.quantity },
        create: input,
      });
    }),

  // ─── Stock Adjustments ──────────────────────────────────
  createAdjustment: adminProcedure
    .input(
      z.object({
        productId: z.number(),
        warehouseId: z.number(),
        adjustmentType: z.enum(["add", "remove", "transfer"]),
        quantity: z.number(),
        toWarehouseId: z.number().optional(),
        reason: z.string().optional(),
        referenceNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const adjustment = await ctx.prisma.stockAdjustment.create({
        data: {
          ...input,
          createdBy: ctx.userId,
        },
      });

      // Update warehouse inventory
      const currentStock = await ctx.prisma.warehouseInventory.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: input.warehouseId,
            productId: input.productId,
          },
        },
      });

      const currentQty = currentStock?.quantity ?? 0;
      const newQty =
        input.adjustmentType === "add"
          ? currentQty + input.quantity
          : currentQty - input.quantity;

      await ctx.prisma.warehouseInventory.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: input.warehouseId,
            productId: input.productId,
          },
        },
        update: { quantity: Math.max(0, newQty) },
        create: {
          warehouseId: input.warehouseId,
          productId: input.productId,
          quantity: Math.max(0, newQty),
        },
      });

      // Handle transfer to destination warehouse
      if (input.adjustmentType === "transfer" && input.toWarehouseId) {
        const destStock = await ctx.prisma.warehouseInventory.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: input.toWarehouseId,
              productId: input.productId,
            },
          },
        });
        await ctx.prisma.warehouseInventory.upsert({
          where: {
            warehouseId_productId: {
              warehouseId: input.toWarehouseId,
              productId: input.productId,
            },
          },
          update: { quantity: (destStock?.quantity ?? 0) + input.quantity },
          create: {
            warehouseId: input.toWarehouseId,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
      }

      return adjustment;
    }),

  // ─── Purchase Orders ────────────────────────────────────
  listPurchaseOrders: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.purchaseOrder.findMany({
        where: input.status ? { status: input.status } : undefined,
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: { vendor: true, warehouse: true, items: true },
      });
    }),

  createPurchaseOrder: adminProcedure
    .input(
      z.object({
        vendorId: z.number(),
        warehouseId: z.number(),
        expectedDate: z.string().optional(),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
            unitPrice: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orderNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
      const totalAmount = input.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      return ctx.prisma.purchaseOrder.create({
        data: {
          orderNumber,
          vendorId: input.vendorId,
          warehouseId: input.warehouseId,
          expectedDate: input.expectedDate ? new Date(input.expectedDate) : undefined,
          notes: input.notes,
          totalAmount,
          createdBy: ctx.userId,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });
    }),

  // ─── Vendors ────────────────────────────────────────────
  listVendors: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }),

  createVendor: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vendor.create({ data: input });
    }),

  // ─── Warehouse Transfers ────────────────────────────────
  createTransfer: adminProcedure
    .input(
      z.object({
        fromWarehouseId: z.number(),
        toWarehouseId: z.number(),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            requestedQuantity: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transferNumber = `WT-${Date.now().toString(36).toUpperCase()}`;
      return ctx.prisma.warehouseTransfer.create({
        data: {
          transferNumber,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          priority: input.priority,
          notes: input.notes,
          requestedBy: ctx.userId,
          requestedAt: new Date(),
          items: {
            create: input.items,
          },
        },
        include: { items: true },
      });
    }),

  // ─── Low Stock Alerts ──────────────────────────────────
  getLowStockAlerts: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.restockAlert.findMany({
      where: { status: { in: ["active", "acknowledged"] } },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      include: { product: true },
      take: 50,
    });
  }),
});
