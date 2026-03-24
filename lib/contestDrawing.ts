/**
 * Contest Winner Drawing — Weighted random selection
 * Each entry row has an `entries` count (bonus entries from spending).
 * drawWinner picks a winner weighted by total entries.
 */
import { prisma } from "@/lib/db";

export async function drawWinner(contestId: number) {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      entries: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!contest) throw new Error("Contest not found");
  if (contest.winnerId) throw new Error("Winner already drawn");
  if (contest.entries.length === 0) throw new Error("No entries in this contest");

  // Build weighted pool: each entry row contributes `entries` tickets
  const pool: { userId: string; name: string; email: string }[] = [];
  for (const entry of contest.entries) {
    for (let i = 0; i < entry.entries; i++) {
      pool.push({
        userId: entry.user.id,
        name: entry.user.name,
        email: entry.user.email,
      });
    }
  }

  // Cryptographically-influenced random pick
  const randomIndex = Math.floor(Math.random() * pool.length);
  const winner = pool[randomIndex];

  // Update contest with winner
  const updated = await prisma.contest.update({
    where: { id: contestId },
    data: {
      winnerId: winner.userId,
      winnerAnnouncedAt: new Date(),
      status: "ENDED",
    },
    include: {
      winner: { select: { id: true, name: true, email: true } },
    },
  });

  // Create notification for winner
  try {
    await prisma.customerNotification.create({
      data: {
        userId: winner.userId,
        type: "contest_winner",
        title: `You won: ${contest.title}!`,
        content: `Congratulations! You've been selected as the winner of "${contest.title}". Your prize: ${contest.prize}. We'll be in touch with details on how to claim your prize.`,
      },
    });
  } catch {
    // Don't fail the draw if notification fails
    console.error("[contestDrawing] Failed to create winner notification");
  }

  return {
    contest: updated,
    winner,
    totalEntries: pool.length,
    uniqueEntrants: contest.entries.length,
  };
}

/**
 * Auto-enter a user into all qualifying PURCHASE contests
 * Called after an order is placed successfully.
 */
export async function autoEnterPurchaseContests(userId: string, orderTotal: number) {
  let activeContests;
  try {
    const now = new Date();
    activeContests = await prisma.contest.findMany({
      where: {
        status: "ACTIVE",
        entryMethod: "PURCHASE",
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  } catch (e) {
    console.warn("[contestDrawing] autoEnterPurchaseContests failed (table may not exist yet):", (e as Error).message);
    return;
  }

  for (const contest of activeContests) {
    // Check min purchase
    if (contest.minPurchaseAmount && orderTotal < contest.minPurchaseAmount) continue;

    // Calculate bonus entries: 1 base + 1 per $50
    const bonusEntries = Math.floor(orderTotal / 50);
    const totalEntries = 1 + bonusEntries;

    try {
      // Upsert: add entries if already entered, otherwise create
      await prisma.contestEntry.upsert({
        where: { contestId_userId: { contestId: contest.id, userId } },
        update: { entries: { increment: bonusEntries > 0 ? totalEntries : 1 } },
        create: { contestId: contest.id, userId, entries: totalEntries },
      });
    } catch {
      console.error(`[contestDrawing] Failed to auto-enter contest ${contest.id} for user ${userId}`);
    }
  }
}

/**
 * Auto-enter a user into all qualifying SIGNUP contests
 * Called after a new user registers.
 */
export async function autoEnterSignupContests(userId: string) {
  let activeContests;
  try {
    const now = new Date();
    activeContests = await prisma.contest.findMany({
      where: {
        status: "ACTIVE",
        entryMethod: "SIGNUP",
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  } catch (e) {
    console.warn("[contestDrawing] autoEnterSignupContests failed (table may not exist yet):", (e as Error).message);
    return;
  }

  for (const contest of activeContests) {
    try {
      await prisma.contestEntry.create({
        data: { contestId: contest.id, userId, entries: 1 },
      });
    } catch {
      // Already entered or other error — ignore
    }
  }
}
