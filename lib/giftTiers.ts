/**
 * Gift Tier Logic — Spending Threshold Rewards
 * Inspired by Green Society and BulkWeedInbox
 */

export interface GiftTier {
  id: number;
  threshold: number;
  giftName: string;
  giftDescription: string;
  giftImage: string | null;
  active: boolean;
  sortOrder: number;
}

/** Default tiers — used for seeding and fallback */
export const DEFAULT_GIFT_TIERS: Omit<GiftTier, "id">[] = [
  {
    threshold: 150,
    giftName: "Free Rolling Papers Pack",
    giftDescription: "RAW Classic rolling papers — on us!",
    giftImage: null,
    active: true,
    sortOrder: 1,
  },
  {
    threshold: 250,
    giftName: "Free Pre-Roll (1g)",
    giftDescription: "A hand-rolled 1g pre-roll of our house blend.",
    giftImage: null,
    active: true,
    sortOrder: 2,
  },
  {
    threshold: 400,
    giftName: "Free Edible (Your Choice)",
    giftDescription: "Pick any edible from our collection — gummies, chocolate, or cookies.",
    giftImage: null,
    active: true,
    sortOrder: 3,
  },
  {
    threshold: 600,
    giftName: "Free 1/8th (3.5g)",
    giftDescription: "A complimentary eighth of premium flower.",
    giftImage: null,
    active: true,
    sortOrder: 4,
  },
  {
    threshold: 1000,
    giftName: "Free Premium Quarter (7g)",
    giftDescription: "A full quarter ounce of top-shelf AAAA flower — our best gift tier.",
    giftImage: null,
    active: true,
    sortOrder: 5,
  },
];

/**
 * Get all gifts the customer qualifies for based on cart total.
 */
export function getEligibleGifts(cartTotal: number, tiers: GiftTier[]): GiftTier[] {
  return tiers
    .filter((t) => t.active && cartTotal >= t.threshold)
    .sort((a, b) => a.threshold - b.threshold);
}

/**
 * Get the next tier the customer hasn't reached yet,
 * plus how much more they need to spend.
 */
export function getNextGiftTier(
  cartTotal: number,
  tiers: GiftTier[]
): { tier: GiftTier; remaining: number } | null {
  const activeTiers = tiers
    .filter((t) => t.active)
    .sort((a, b) => a.threshold - b.threshold);

  const next = activeTiers.find((t) => cartTotal < t.threshold);
  if (!next) return null;

  return {
    tier: next,
    remaining: Math.ceil((next.threshold - cartTotal) * 100) / 100,
  };
}
