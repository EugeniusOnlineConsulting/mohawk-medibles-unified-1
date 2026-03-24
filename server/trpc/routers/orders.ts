/**
 * Orders Router — Public order tracking via tRPC
 */
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

// Carrier tracking URL builders
const CARRIER_TRACKING_URLS: Record<string, (tn: string) => string> = {
  canada_post: (tn) =>
    `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${tn}`,
  purolator: (tn) => `https://www.purolator.com/en/shipping/tracker?pin=${tn}`,
  ups: (tn) => `https://www.ups.com/track?tracknum=${tn}`,
  fedex: (tn) => `https://www.fedex.com/fedextrack/?trknbr=${tn}`,
};

export const ordersRouter = router({
  track: publicProcedure
    .input(z.object({ orderNumber: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { orderNumber: input.orderNumber },
        select: {
          orderNumber: true,
          status: true,
          total: true,
          trackingNumber: true,
          carrier: true,
          shippedAt: true,
          deliveredAt: true,
          createdAt: true,
          shippingData: true,
          items: {
            select: { name: true, quantity: true, price: true },
          },
          statusHistory: {
            orderBy: { createdAt: "desc" },
            select: { id: true, status: true, note: true, createdAt: true },
          },
          address: {
            select: {
              firstName: true,
              lastName: true,
              street1: true,
              city: true,
              province: true,
              postalCode: true,
            },
          },
        },
      });

      if (!order) {
        return null;
      }

      // Estimated delivery
      let estimatedDelivery: string | null = null;
      if (
        order.status !== "DELIVERED" &&
        order.status !== "COMPLETED" &&
        order.status !== "CANCELLED"
      ) {
        const baseDate = order.shippedAt || order.createdAt;
        const est = new Date(baseDate);
        const daysToAdd = order.shippedAt ? 5 : 7;
        let added = 0;
        while (added < daysToAdd) {
          est.setDate(est.getDate() + 1);
          const day = est.getDay();
          if (day !== 0 && day !== 6) added++;
        }
        estimatedDelivery = est.toISOString();
      }

      // Carrier URL
      let carrierTrackingUrl: string | null = null;
      if (order.trackingNumber && order.carrier) {
        const builder = CARRIER_TRACKING_URLS[order.carrier];
        if (builder) carrierTrackingUrl = builder(order.trackingNumber);
      }

      // Shipping address
      let shippingAddress: {
        name: string;
        street: string;
        city: string;
        province: string;
        postalCode: string;
      } | null = null;
      if (order.address) {
        shippingAddress = {
          name: `${order.address.firstName} ${order.address.lastName}`.trim(),
          street: order.address.street1,
          city: order.address.city,
          province: order.address.province,
          postalCode: order.address.postalCode,
        };
      } else if (order.shippingData) {
        try {
          const sd = JSON.parse(order.shippingData);
          shippingAddress = {
            name: `${sd.first_name || sd.firstName || ""} ${sd.last_name || sd.lastName || ""}`.trim(),
            street: sd.address_1 || sd.street1 || "",
            city: sd.city || "",
            province: sd.state || sd.province || "",
            postalCode: sd.postcode || sd.postalCode || "",
          };
        } catch {
          // ignore
        }
      }

      return {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        carrierTrackingUrl,
        shippedAt: order.shippedAt?.toISOString() ?? null,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        estimatedDelivery,
        items: order.items,
        statusHistory: order.statusHistory.map((h) => ({
          id: h.id,
          status: h.status,
          note: h.note,
          createdAt: h.createdAt.toISOString(),
        })),
        shippingAddress,
      };
    }),
});
