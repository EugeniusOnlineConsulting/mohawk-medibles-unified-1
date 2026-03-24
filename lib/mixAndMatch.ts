/**
 * Mix & Match Custom Ounces — Bundle Logic
 * ==========================================
 * Lets customers build custom ounces by mixing multiple strains
 * at a bundle discount (inspired by WestCoastCannabis, Green Society, BulkWeedInbox).
 */

export interface BundleConfig {
  id: string;
  name: string;
  label: string;
  totalWeight: number; // grams
  slots: number;
  weightPerSlot: number; // grams
  discountPercent: number;
  description: string;
  icon: string; // emoji
}

export const BUNDLE_CONFIGS: BundleConfig[] = [
  {
    id: "half-oz",
    name: "Half Ounce",
    label: "Half Oz (14g)",
    totalWeight: 14,
    slots: 2,
    weightPerSlot: 7,
    discountPercent: 10,
    description: "Pick 2 strains (7g each)",
    icon: "🌿",
  },
  {
    id: "full-oz",
    name: "Full Ounce",
    label: "Full Oz (28g)",
    totalWeight: 28,
    slots: 4,
    weightPerSlot: 7,
    discountPercent: 15,
    description: "Pick 4 strains (7g each)",
    icon: "🔥",
  },
  {
    id: "double-oz",
    name: "Double Ounce",
    label: "Double Oz (56g)",
    totalWeight: 56,
    slots: 4,
    weightPerSlot: 14,
    discountPercent: 20,
    description: "Pick 4 strains (14g each)",
    icon: "💎",
  },
];

export interface BundleSelection {
  slotIndex: number;
  productId: number;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
  strainType: string; // Indica / Sativa / Hybrid
}

export interface BundlePriceResult {
  originalTotal: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  pricePerGram: number;
  savings: number;
}

/**
 * Calculate bundle price based on selected products and bundle config.
 * Price is based on the average price of selected products, scaled to bundle weight.
 */
export function calculateBundlePrice(
  selections: BundleSelection[],
  bundleConfig: BundleConfig
): BundlePriceResult {
  if (selections.length === 0) {
    return {
      originalTotal: 0,
      discountPercent: bundleConfig.discountPercent,
      discountAmount: 0,
      finalPrice: 0,
      pricePerGram: 0,
      savings: 0,
    };
  }

  // Sum up the product prices (each product's listed price represents its base unit)
  const originalTotal = selections.reduce((sum, s) => sum + s.productPrice, 0);
  const discountAmount = originalTotal * (bundleConfig.discountPercent / 100);
  const finalPrice = originalTotal - discountAmount;
  const pricePerGram = finalPrice / bundleConfig.totalWeight;

  return {
    originalTotal,
    discountPercent: bundleConfig.discountPercent,
    discountAmount,
    finalPrice,
    pricePerGram,
    savings: discountAmount,
  };
}

/**
 * Validate that a bundle is complete and all selections are valid.
 */
export function validateBundle(
  selections: BundleSelection[],
  bundleConfig: BundleConfig
): { valid: boolean; error?: string } {
  if (selections.length !== bundleConfig.slots) {
    return {
      valid: false,
      error: `Please select ${bundleConfig.slots} strains. You have ${selections.length} selected.`,
    };
  }

  // Check for duplicate slot indices
  const slotIndices = new Set(selections.map((s) => s.slotIndex));
  if (slotIndices.size !== selections.length) {
    return { valid: false, error: "Duplicate slot assignments detected." };
  }

  // All slots must be within range
  for (const s of selections) {
    if (s.slotIndex < 0 || s.slotIndex >= bundleConfig.slots) {
      return { valid: false, error: "Invalid slot index." };
    }
  }

  return { valid: true };
}

/**
 * Generate a cart-friendly bundle item ID from the config and selections.
 */
export function generateBundleCartId(
  bundleConfig: BundleConfig,
  selections: BundleSelection[]
): string {
  const slugs = selections
    .sort((a, b) => a.slotIndex - b.slotIndex)
    .map((s) => s.productSlug)
    .join("+");
  return `bundle-${bundleConfig.id}-${slugs}`;
}

/**
 * Generate a display name for the bundle cart item.
 */
export function generateBundleName(
  bundleConfig: BundleConfig,
  selections: BundleSelection[]
): string {
  const strainNames = selections
    .sort((a, b) => a.slotIndex - b.slotIndex)
    .map((s) => {
      const name = s.productName;
      return name.length > 20 ? name.substring(0, 20) + "..." : name;
    })
    .join(" + ");
  return `${bundleConfig.label} Bundle: ${strainNames}`;
}

/** Flower-eligible categories for mix-and-match */
export const ELIGIBLE_CATEGORIES = new Set(["Flower"]);

/** Check if a product is eligible for mix-and-match */
export function isEligibleProduct(category: string): boolean {
  return ELIGIBLE_CATEGORIES.has(category);
}
