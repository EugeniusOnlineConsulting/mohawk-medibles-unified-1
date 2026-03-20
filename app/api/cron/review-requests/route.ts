/**
 * Review Request Cron — Sends post-purchase review solicitation emails
 * Ported from Ian's .cc: /api/cron/review-requests/
 *
 * Schedule: Daily (configured in vercel.json)
 * Flow: Find delivered orders (3-7 days old) → send review request emails
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/trpc/trpc";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find orders delivered 3-7 days ago that haven't been sent review requests
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deliveredOrders = await prisma.order.findMany({
      where: {
        status: { in: ["DELIVERED", "COMPLETED"] },
        deliveredAt: { gte: sevenDaysAgo, lte: threeDaysAgo },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { select: { productId: true, name: true } },
      },
      take: 50,
    });

    let requestsSent = 0;

    for (const order of deliveredOrders) {
      if (!order.user?.email) continue;

      for (const item of order.items) {
        // Check if review request already sent
        const existing = await prisma.reviewRequest.findFirst({
          where: {
            userId: order.userId,
            orderId: order.id,
            productId: item.productId,
          },
        });

        if (existing) continue;

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
          where: {
            userId: order.userId,
            productId: item.productId,
          },
        });

        if (existingReview) continue;

        // Create review request
        await prisma.reviewRequest.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            productId: item.productId,
            status: "sent",
            sentAt: new Date(),
          },
        });

        // TODO: Send email via lib/email.ts sendReviewRequestEmail()
        console.log(
          `[Review Request] Would send to ${order.user.email} for product ${item.name}`
        );
        requestsSent++;
      }
    }

    return NextResponse.json({
      ordersProcessed: deliveredOrders.length,
      requestsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Review Request Cron] Error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
