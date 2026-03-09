import { permanentRedirect } from "next/navigation";

/**
 * WordPress Category URL Redirect Handler
 * ════════════════════════════════════════
 * Handles all WordPress /product-category/ URLs and 301 redirects
 * them to the Next.js shop page with the appropriate category filter.
 *
 * Examples:
 *   /product-category/flower/          → /shop?category=Flower
 *   /product-category/edibles/         → /shop?category=Edibles
 *   /product-category/concentrates/hash/ → /shop?category=Hash
 *   /product-category/brands/brand-name/ → /shop?category=brand-name
 */

// Map WordPress category slugs to display names used in the shop filter
const CATEGORY_MAP: Record<string, string> = {
    flower: "Flower",
    edibles: "Edibles",
    concentrates: "Concentrates",
    vapes: "Vapes",
    mushrooms: "Mushrooms",
    cbd: "CBD",
    brands: "Brands",
    nicotine: "Nicotine",
    accessories: "Accessories",
    "sexual-enhancement": "Sexual Enhancement",
    hash: "Hash",
    wellness: "Wellness",
    pets: "Pets",
    "bath-body": "Bath & Body",
    hookah: "Hookah",
    sale: "Sale",
    "pre-rolls": "Pre-Rolls",
    capsules: "Capsules",
};

type PageProps = { params: Promise<{ slug: string[] }> };

export default async function ProductCategoryRedirect({ params }: PageProps) {
    const { slug } = await params;

    // For nested paths like /product-category/concentrates/hash/
    // use the deepest (last) segment as the category filter
    const lastSegment = slug[slug.length - 1];
    const category = CATEGORY_MAP[lastSegment] || lastSegment;

    permanentRedirect(`/shop?category=${encodeURIComponent(category)}`);
}
