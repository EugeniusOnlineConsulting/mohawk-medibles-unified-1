/**
 * Gift Cards API — Purchase and redeem gift cards
 * Ported from Ian's .cc gift card system
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/trpc/trpc";
import { randomBytes } from "crypto";

// GET — List gift cards for authenticated user
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const cards = await prisma.giftCard.findMany({
    where: { purchasedByUserId: userId },
    orderBy: { createdAt: "desc" },
    include: { transactions: true },
  });

  return NextResponse.json({ cards });
}

// POST — Purchase a new gift card
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      recipientEmail,
      recipientName,
      senderName,
      personalMessage,
      design,
    } = body;

    if (!amount || amount < 10 || amount > 500) {
      return NextResponse.json(
        { error: "Amount must be between $10 and $500" },
        { status: 400 }
      );
    }

    const userId = req.headers.get("x-user-id") || undefined;

    // Generate unique gift card code
    const code = `MM-${randomBytes(3).toString("hex").toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        initialBalance: amount,
        currentBalance: amount,
        purchasedByUserId: userId,
        recipientEmail,
        recipientName,
        senderName,
        personalMessage,
        design: design || "classic",
        status: "active",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Record purchase transaction
    await prisma.giftCardTransaction.create({
      data: {
        giftCardId: giftCard.id,
        amount,
        balanceAfter: amount,
        type: "purchase",
        description: `Gift card purchased${senderName ? ` by ${senderName}` : ""}`,
      },
    });

    // TODO: Send gift card email to recipient via lib/email.ts

    return NextResponse.json({ giftCard }, { status: 201 });
  } catch (error) {
    console.error("[Gift Cards] Error:", error);
    return NextResponse.json({ error: "Failed to create gift card" }, { status: 500 });
  }
}
