/**
 * Happy Hour — Time-based flash promotion detection
 * All times are in Eastern timezone (America/Toronto)
 */
import { prisma } from "@/lib/db";

interface HappyHourRecord {
  id: string;
  name: string;
  discountPercent: number;
  categorySlug: string | null;
  startHour: number;
  endHour: number;
  daysOfWeek: unknown; // Json field — array of ints
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActiveHappyHour {
  id: string;
  name: string;
  discountPercent: number;
  categorySlug: string | null;
  startHour: number;
  endHour: number;
  daysOfWeek: number[];
}

/**
 * Get current Eastern time components
 */
function getEasternTime(): { hour: number; dayOfWeek: number } {
  const now = new Date();
  const eastern = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Toronto" })
  );
  return {
    hour: eastern.getHours(),
    dayOfWeek: eastern.getDay(), // 0=Sun..6=Sat
  };
}

/**
 * Check if a happy hour is currently active based on time/day
 */
function isHappyHourActiveNow(
  hh: HappyHourRecord,
  hour: number,
  dayOfWeek: number
): boolean {
  const days = (Array.isArray(hh.daysOfWeek) ? hh.daysOfWeek : []) as number[];
  if (!days.includes(dayOfWeek)) return false;

  // Handle overnight spans (e.g., startHour=22, endHour=2)
  if (hh.startHour <= hh.endHour) {
    return hour >= hh.startHour && hour < hh.endHour;
  } else {
    return hour >= hh.startHour || hour < hh.endHour;
  }
}

/**
 * Get all currently active happy hours
 */
export async function getActiveHappyHours(): Promise<ActiveHappyHour[]> {
  try {
    const { hour, dayOfWeek } = getEasternTime();

    const allActive = await prisma.happyHour.findMany({
      where: { active: true },
    });

    return allActive
      .filter((hh) => isHappyHourActiveNow(hh, hour, dayOfWeek))
      .map((hh) => ({
        id: hh.id,
        name: hh.name,
        discountPercent: hh.discountPercent,
        categorySlug: hh.categorySlug,
        startHour: hh.startHour,
        endHour: hh.endHour,
        daysOfWeek: (Array.isArray(hh.daysOfWeek) ? hh.daysOfWeek : []) as number[],
      }));
  } catch (e) {
    console.warn("[happyHour] Failed to fetch active happy hours (table may not exist yet):", (e as Error).message);
    return [];
  }
}

/**
 * Get discount % for a specific category (or global).
 * Returns the highest applicable discount.
 */
export async function getHappyHourDiscount(
  categorySlug?: string | null
): Promise<number> {
  try {
    const active = await getActiveHappyHours();
    if (active.length === 0) return 0;

    let maxDiscount = 0;
    for (const hh of active) {
      // null categorySlug = applies to all products
      if (hh.categorySlug === null || hh.categorySlug === categorySlug) {
        maxDiscount = Math.max(maxDiscount, hh.discountPercent);
      }
    }
    return maxDiscount;
  } catch {
    return 0;
  }
}

/**
 * Boolean: is any happy hour running right now?
 */
export async function isHappyHourActive(): Promise<boolean> {
  const active = await getActiveHappyHours();
  return active.length > 0;
}
