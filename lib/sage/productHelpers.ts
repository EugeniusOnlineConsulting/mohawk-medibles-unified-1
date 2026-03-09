/**
 * MedAgent Product Helpers
 * ══════════════════════════
 * Category browsing, on-sale filtering, and product enrichment.
 * Ported from the original sage-product-api.php WordPress plugin.
 *
 * Relocated from lib/sageProductHelpers.ts → lib/sage/productHelpers.ts
 * as part of the MedAgent middleware integration.
 */

import { PRODUCTS, type Product } from "@/lib/productData";

// ─── Category API ────────────────────────────────────────────

export interface CategoryInfo {
    name: string;
    slug: string;
    count: number;
}

/**
 * Get all product categories with their counts.
 * Mirrors sage/v1/categories from the original plugin.
 */
export function getCategories(): CategoryInfo[] {
    const counts = new Map<string, number>();

    for (const p of PRODUCTS) {
        const cat = p.category;
        counts.set(cat, (counts.get(cat) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([name, count]) => ({
            name,
            slug: name.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-"),
            count,
        }))
        .sort((a, b) => b.count - a.count);
}

// ─── On-Sale Detection ───────────────────────────────────────

/**
 * Detect products that are on sale.
 * Mirrors sage/v1/products?on_sale=true from the original plugin.
 */
export function getOnSaleProducts(limit = 6): Product[] {
    return PRODUCTS.filter(
        (p) =>
            p.name.toLowerCase().includes("sale") ||
            p.name.includes("*SALE*")
    ).slice(0, limit);
}

// ─── Category Browsing ──────────────────────────────────────

/**
 * Get products by category.
 * Mirrors sage/v1/products?category=slug from the original plugin.
 */
export function getProductsByCategory(
    category: string,
    limit = 6
): Product[] {
    const normalized = category.toLowerCase().replace(/-/g, " ");

    return PRODUCTS.filter(
        (p) =>
            p.category.toLowerCase() === normalized ||
            p.subcategory?.toLowerCase() === normalized ||
            p.category.toLowerCase().includes(normalized) ||
            p.subcategory?.toLowerCase().includes(normalized)
    ).slice(0, limit);
}

// ─── Effects-Based Search ──────────────────────────────────

/**
 * Get products by reported effect.
 * Searches the effects[] array added by terpene enrichment.
 */
export function getProductsByEffect(effect: string, limit = 6): Product[] {
    const normalized = effect.toLowerCase().trim();
    return PRODUCTS.filter(
        (p) => p.effects && p.effects.some((e) => e.toLowerCase().includes(normalized))
    ).slice(0, limit);
}

/**
 * Get all unique effects across the catalog.
 */
export function getAllEffects(): string[] {
    const effects = new Set<string>();
    for (const p of PRODUCTS) {
        if (p.effects) {
            for (const e of p.effects) effects.add(e);
        }
    }
    return Array.from(effects).sort();
}

// ─── Featured Products ──────────────────────────────────────

/**
 * Get featured products for recommendation carousels.
 */
export function getFeaturedProducts(limit = 6): Product[] {
    const featured = PRODUCTS.filter((p) => p.featured);
    if (featured.length >= limit) return featured.slice(0, limit);

    // If not enough featured, fill with popular categories
    const topCategories = ["Flower", "Edibles", "Concentrates", "Vapes"];
    const extras: Product[] = [];

    for (const cat of topCategories) {
        if (extras.length >= limit - featured.length) break;
        const catProducts = PRODUCTS.filter(
            (p) =>
                p.category.toLowerCase() === cat.toLowerCase() &&
                !featured.includes(p) &&
                !extras.includes(p)
        );
        if (catProducts.length) extras.push(catProducts[0]);
    }

    return [...featured, ...extras].slice(0, limit);
}
