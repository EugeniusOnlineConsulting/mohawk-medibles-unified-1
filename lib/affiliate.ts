/**
 * Affiliate Program — Conversion tracking utility
 * Call createAffiliateConversion() when an order is completed
 * to credit the referring affiliate.
 */
import { prisma } from "@/lib/db";

/**
 * Create an affiliate conversion from a completed order.
 * @param orderId - The order ID
 * @param orderTotal - The order total amount
 * @param affiliateCode - The affiliate ref code from the cookie
 */
export async function createAffiliateConversion(
    orderId: string,
    orderTotal: number,
    affiliateCode: string
) {
    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { code: affiliateCode },
        });

        if (!affiliate || affiliate.status !== "ACTIVE") {
            return null;
        }

        // Check if conversion already exists for this order
        const existing = await prisma.affiliateConversion.findFirst({
            where: { orderId, affiliateId: affiliate.id },
        });
        if (existing) return existing;

        const commission = (orderTotal * affiliate.commissionRate) / 100;

        const conversion = await prisma.affiliateConversion.create({
            data: {
                affiliateId: affiliate.id,
                orderId,
                orderTotal,
                commission,
            },
        });

        // Update affiliate totals
        await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
                totalReferrals: { increment: 1 },
            },
        });

        return conversion;
    } catch (error) {
        console.error("[affiliate] Failed to create conversion:", error);
        return null;
    }
}

/**
 * Get affiliate code from cookie value.
 * Used in checkout/order completion flows.
 */
export function getAffiliateCodeFromCookies(
    cookies: { get: (name: string) => { value: string } | undefined }
): string | null {
    const cookie = cookies.get("mm-affiliate-ref");
    return cookie?.value || null;
}
