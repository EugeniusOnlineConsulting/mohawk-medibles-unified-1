/**
 * Quality Grade System — AA / AAA / AAA+ / AAAA / Craft
 * Auto-assigns grades based on price per gram when no manual grade is set.
 */

export type GradeKey = "AA" | "AAA" | "AAA+" | "AAAA" | "Craft";

export interface GradeInfo {
  label: string;
  shortLabel: string;
  color: string;        // Tailwind text color
  bgColor: string;      // Tailwind bg color
  borderColor: string;  // Tailwind border color
  description: string;
}

export const GRADE_INFO: Record<GradeKey, GradeInfo> = {
  AA: {
    label: "AA — Budget",
    shortLabel: "AA",
    color: "text-zinc-600 dark:text-zinc-300",
    bgColor: "bg-zinc-100 dark:bg-zinc-700/50",
    borderColor: "border-zinc-300 dark:border-zinc-600",
    description: "Budget-friendly. Great value for everyday use.",
  },
  AAA: {
    label: "AAA — Mid-Range",
    shortLabel: "AAA",
    color: "text-amber-800 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-900/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    description: "Quality everyday flower at a fair price.",
  },
  "AAA+": {
    label: "AAA+ — Premium",
    shortLabel: "AAA+",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
    borderColor: "border-blue-300 dark:border-blue-700",
    description: "Premium quality. Excellent potency and terpene profile.",
  },
  AAAA: {
    label: "AAAA — Top Shelf",
    shortLabel: "AAAA",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
    borderColor: "border-yellow-400 dark:border-yellow-600",
    description: "Top-shelf flower. Dense buds, exceptional quality.",
  },
  Craft: {
    label: "Craft — Artisan",
    shortLabel: "Craft",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
    borderColor: "border-purple-400 dark:border-purple-600",
    description: "Small-batch artisan cannabis. The finest available.",
  },
};

export const ALL_GRADES: GradeKey[] = ["AA", "AAA", "AAA+", "AAAA", "Craft"];

/** Flower-like categories that should receive auto grades */
const FLOWER_CATEGORIES = [
  "flower", "flowers", "indica", "sativa", "hybrid",
  "pre-rolls", "pre-roll", "prerolls",
];

/**
 * Determine if a product is a flower product eligible for grading.
 */
function isFlowerProduct(category: string): boolean {
  const lc = category.toLowerCase();
  return FLOWER_CATEGORIES.some((fc) => lc.includes(fc));
}

/**
 * Extract price per gram from product data.
 * If the product has a weight spec (e.g. "3.5g", "7g", "28g"), divide price by weight.
 * Otherwise use the raw price as an approximation.
 */
function getPricePerGram(price: number, weight?: string): number {
  if (!weight) return price; // Treat full price as single-unit

  const match = weight.match(/([\d.]+)\s*g/i);
  if (match) {
    const grams = parseFloat(match[1]);
    if (grams > 0) return price / grams;
  }

  // Check for ounce
  const ozMatch = weight.match(/([\d.]+)\s*oz/i);
  if (ozMatch) {
    const grams = parseFloat(ozMatch[1]) * 28;
    if (grams > 0) return price / grams;
  }

  return price;
}

/**
 * Auto-assign a grade based on price per gram.
 */
function autoGrade(pricePerGram: number): GradeKey {
  if (pricePerGram < 4) return "AA";
  if (pricePerGram < 7) return "AAA";
  if (pricePerGram < 10) return "AAA+";
  if (pricePerGram < 14) return "AAAA";
  return "Craft";
}

/**
 * Get the display grade for a product.
 * Returns the manual grade if set, otherwise auto-calculates from price.
 * Returns null for non-flower products that have no manual grade.
 */
export function getProductGrade(product: {
  grade?: string | null;
  price: number;
  category: string;
  specs?: { weight?: string };
}): GradeKey | null {
  // Manual grade takes priority
  if (product.grade && ALL_GRADES.includes(product.grade as GradeKey)) {
    return product.grade as GradeKey;
  }

  // Only auto-grade flower products
  if (!isFlowerProduct(product.category)) return null;

  const ppg = getPricePerGram(product.price, product.specs?.weight);
  return autoGrade(ppg);
}
