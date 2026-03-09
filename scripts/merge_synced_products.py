#!/usr/bin/env python3
"""
Mohawk Medibles — Merge WC Store API synced products into productData.ts & full_products_v2.json

Strategy:
1. Parse existing productData.ts to extract PRODUCTS array (JSON portion)
2. Load synced data from data/wp_products_synced.json
3. For existing products (matched by slug): update price, image, images, sku, on_sale
4. For new products: create entries in the Product interface format
5. Write updated productData.ts and full_products_v2.json
"""
import json
import os
import re
import sys

BASE = os.path.expanduser("~/MohawkMedibles_SEO_v1.0")
SYNCED_PATH = os.path.join(BASE, "data", "wp_products_synced.json")
PRODUCT_TS_PATH = os.path.join(BASE, "lib", "productData.ts")
PRODUCTS_JSON_PATH = os.path.join(BASE, "full_products_v2.json")


def load_synced():
    with open(SYNCED_PATH) as f:
        return json.load(f)


def load_existing_json():
    with open(PRODUCTS_JSON_PATH) as f:
        return json.load(f)


def normalize_slug(slug):
    """Normalize slug for matching — strip trailing '-canada' suffix."""
    return slug.lower().strip()


def build_synced_lookup(synced):
    """Build a lookup dict by slug from synced data."""
    lookup = {}
    for p in synced:
        slug = p.get("slug", "")
        if slug:
            lookup[slug] = p
    return lookup


def pick_primary_category(categories):
    """Pick the best primary category from WC categories list."""
    # Priority order — skip generic ones
    skip = {"Sale", "Medibles", "Uncategorized"}
    cats = [c for c in categories if c not in skip]
    if not cats:
        return categories[0] if categories else "Uncategorized"
    return cats[0]


def pick_subcategory(categories, primary):
    """Pick a subcategory from the remaining categories."""
    skip = {"Sale", "Medibles", "Uncategorized", primary}
    subs = [c for c in categories if c not in skip]
    return subs[0] if subs else None


def synced_to_product(synced_item, new_id):
    """Transform a synced WC Store API product into the Product interface format."""
    cats = synced_item.get("categories", [])
    primary_cat = pick_primary_category(cats)
    sub_cat = pick_subcategory(cats, primary_cat)

    slug = synced_item.get("slug", "")
    name = synced_item.get("name", "")
    permalink = synced_item.get("permalink", "")
    price = synced_item.get("price", 0)
    image = synced_item.get("image", "")
    images_raw = synced_item.get("images", [])
    images = [img["src"] for img in images_raw if img.get("src")] if isinstance(images_raw, list) else []
    if not images and image:
        images = [image]

    sku = synced_item.get("sku", "")
    on_sale = synced_item.get("on_sale", False)
    sale_price = synced_item.get("sale_price")
    regular_price = synced_item.get("regular_price", price)
    short_desc = synced_item.get("short_description") or ""
    description = synced_item.get("description") or ""

    # Build attributes for specs
    attrs = synced_item.get("attributes") or {}
    thc = attrs.get("THC", attrs.get("thc", "TBD"))
    cbd = attrs.get("CBD", attrs.get("cbd", "TBD"))
    product_type = attrs.get("Type", attrs.get("type", primary_cat))
    weight = attrs.get("Weight", attrs.get("weight", "TBD"))
    brand = attrs.get("Brand", attrs.get("brand", ""))

    if isinstance(thc, list):
        thc = ", ".join(thc)
    if isinstance(cbd, list):
        cbd = ", ".join(cbd)
    if isinstance(product_type, list):
        product_type = ", ".join(product_type)
    if isinstance(weight, list):
        weight = ", ".join(weight)

    # Build canonical URL path
    path = f"/shop/{slug}"

    # Alt text
    alt_text = f"{name} - Mohawk Medibles"

    # Meta description
    meta_desc = f"Buy {name} online in Canada at Mohawk Medibles, your trusted Indigenous-owned cannabis dispensary."
    if short_desc:
        meta_desc = short_desc[:160]

    # Short description
    short_description = short_desc if short_desc else meta_desc

    # EEAT narrative
    eeat = f"{name} is a premium {primary_cat} product available at Mohawk Medibles, Tyendinaga's trusted cannabis dispensary."

    return {
        "id": new_id,
        "slug": slug,
        "name": name,
        "category": primary_cat,
        "subcategory": sub_cat,
        "canonicalUrl": permalink,
        "path": path,
        "price": price,
        "image": image or (images[0] if images else ""),
        "images": images,
        "altText": alt_text,
        "sku": sku,
        "metaDescription": meta_desc,
        "shortDescription": short_description,
        "descriptionHTML": description if description else "",
        "featured": on_sale,  # Feature sale items
        "specs": {
            "thc": str(thc) if thc else "TBD",
            "cbd": str(cbd) if cbd else "TBD",
            "type": str(product_type) if product_type else primary_cat,
            "weight": str(weight) if weight else "TBD",
            "terpenes": [],
            "lineage": ""
        },
        "eeatNarrative": eeat
    }


def merge_products(existing, synced):
    """Merge synced products into existing product list."""
    synced_lookup = build_synced_lookup(synced)
    synced_slugs_used = set()

    updated_count = 0

    # Update existing products
    for product in existing:
        slug = product.get("slug", "")

        # Try exact match
        match = synced_lookup.get(slug)

        # Try with -canada suffix stripped
        if not match and slug.endswith("-canada"):
            match = synced_lookup.get(slug[:-7])

        # Try adding -canada suffix
        if not match:
            match = synced_lookup.get(slug + "-canada")

        if match:
            synced_slugs_used.add(match["slug"])

            # Update price
            new_price = match.get("price", 0)
            if new_price > 0:
                product["price"] = new_price

            # Update image if synced has a better one
            new_image = match.get("image", "")
            if new_image and new_image.startswith("http"):
                product["image"] = new_image

            # Update images gallery
            new_images = match.get("images", [])
            if new_images:
                img_urls = [img["src"] for img in new_images if isinstance(img, dict) and img.get("src")]
                if img_urls:
                    product["images"] = img_urls

            # Update SKU
            new_sku = match.get("sku", "")
            if new_sku:
                product["sku"] = new_sku

            updated_count += 1

    # Find new products (not matched to any existing)
    new_products = []
    max_id = max(p.get("id", 0) for p in existing)

    for synced_item in synced:
        slug = synced_item.get("slug", "")
        if slug not in synced_slugs_used:
            max_id += 1
            new_product = synced_to_product(synced_item, max_id)
            new_products.append(new_product)

    print(f"  Updated: {updated_count} existing products (prices, images, SKUs)")
    print(f"  New:     {len(new_products)} products added")

    return existing + new_products


def write_product_ts(products, ts_path):
    """Write updated productData.ts file."""
    # Read original to get the interface and helper functions
    with open(ts_path, "r") as f:
        original = f.read()

    # Extract everything before PRODUCTS array
    header = """// =============================================================
// Mohawk Medibles — Complete Product Registry (WC Synced + SEO)
// Total Products: {count}
// Last synced: 2026-02-26 via WC Store API
// =============================================================

export interface Product {{
    id: number;
    slug: string;
    name: string;
    category: string;
    subcategory: string | null;
    canonicalUrl: string;
    path: string;
    price: number;
    image: string;
    images: string[];
    altText: string;
    sku: string;
    metaDescription: string;
    shortDescription: string;
    descriptionHTML?: string;
    featured: boolean;
    specs: {{
        thc: string;
        cbd: string;
        type: string;
        weight: string;
        terpenes: string[];
        lineage: string;
    }};
    eeatNarrative: string;
}}

""".format(count=len(products))

    # Serialize products
    products_json = json.dumps(products, indent=4, ensure_ascii=False)

    # Helper functions
    helpers = """

export function getFeaturedProducts() {
    return PRODUCTS.filter(p => p.featured);
}

export function getShortName(product: Product) {
    return product.name.length > 25 ? product.name.substring(0, 25) + "..." : product.name;
}

export function getProductBySlug(slug: string): Product | undefined {
    return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, count: number = 4): Product[] {
    return PRODUCTS
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, count);
}

export function getAllCategories(): string[] {
    const categories = new Set(PRODUCTS.map((p) => p.category));
    return Array.from(categories).sort();
}

/** Returns category name → product count map */
export function getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const p of PRODUCTS) {
        counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
}

/** Returns a representative (highest-priced) product per category for showcase */
export function getCategoryRepresentativeProducts(
    categories: string[]
): { category: string; product: Product; count: number }[] {
    const counts = getCategoryCounts();
    return categories
        .map((cat) => {
            const catProducts = PRODUCTS.filter((p) => p.category === cat);
            // Pick the highest-priced product with a valid image
            const sorted = [...catProducts].sort((a, b) => b.price - a.price);
            const product = sorted.find((p) => p.image && p.image.startsWith("http")) || sorted[0];
            return product ? { category: cat, product, count: counts[cat] || 0 } : null;
        })
        .filter(Boolean) as { category: string; product: Product; count: number }[];
}
"""

    content = header + "export const PRODUCTS: Product[] = " + products_json + ";\n" + helpers

    with open(ts_path, "w") as f:
        f.write(content)

    print(f"  Written: {ts_path} ({len(products)} products)")


def write_products_json(products, json_path):
    """Write updated full_products_v2.json."""
    with open(json_path, "w") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"  Written: {json_path} ({len(products)} products)")


def main():
    print("=" * 60)
    print("Mohawk Medibles — Product Data Merge")
    print("=" * 60)

    # Load data
    print("\nLoading data...")
    synced = load_synced()
    existing = load_existing_json()
    print(f"  Existing: {len(existing)} products")
    print(f"  Synced:   {len(synced)} products from WC Store API")

    # Merge
    print("\nMerging...")
    merged = merge_products(existing, synced)
    print(f"\n  TOTAL: {len(merged)} products")

    # Write outputs
    print("\nWriting files...")
    write_products_json(merged, PRODUCTS_JSON_PATH)
    write_product_ts(merged, PRODUCT_TS_PATH)

    # Stats
    print(f"\n{'=' * 60}")
    print(f"MERGE COMPLETE — {len(merged)} products")
    print(f"{'=' * 60}")

    cats = {}
    for p in merged:
        c = p.get("category", "Unknown")
        cats[c] = cats.get(c, 0) + 1

    with_price = sum(1 for p in merged if p.get("price", 0) > 0)
    with_image = sum(1 for p in merged if p.get("image", "").startswith("http"))
    featured = sum(1 for p in merged if p.get("featured"))

    print(f"  With price: {with_price}")
    print(f"  With image: {with_image}")
    print(f"  Featured:   {featured}")
    print(f"\n  Categories ({len(cats)}):")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1])[:15]:
        print(f"    {cat}: {count}")


if __name__ == "__main__":
    main()
