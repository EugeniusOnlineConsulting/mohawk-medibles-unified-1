#!/usr/bin/env python3
"""
Generate productData.ts from raw extracted product data.
Enriches each product with:
- Proper human-readable names
- SEO-optimized alt text
- Meta descriptions
- Category mappings
- Canonical URL preservation
"""

import json
import re
import os
import textwrap

INPUT_FILE = "/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0/lib/products_raw.json"
OUTPUT_FILE = "/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0/lib/productData.ts"

# Category display name mapping
CATEGORY_MAP = {
    "accessories": "Accessories",
    "bath-salts": "Bath & Body",
    "brands": "Brands",
    "capsules": "Capsules",
    "cbd-2": "CBD",
    "concentrates": "Concentrates",
    "edibles": "Edibles",
    "euphoria-extractions-2": "Concentrates",
    "flower": "Flower",
    "mushrooms-2": "Mushrooms",
    "nicotine": "Nicotine",
    "pets": "Pets",
    "sale": "Sale",
    "sexual-enhancement": "Wellness",
    "thc-vapes": "THC Vapes",
    "vapes-2": "Vapes",
    "wellness": "Wellness",
}

SUBCATEGORY_MAP = {
    "hash": "Hash",
    "live-resin": "Live Resin",
    "sauce": "Sauce",
    "papers-cones": "Papers & Cones",
    "cigars": "Cigars",
    "pipes": "Pipes",
    "pre-rolls": "Pre-Rolls",
    "gummies": "Gummies",
    "gummies-cbd-2": "CBD Gummies",
    "beverages": "Beverages",
    "capsules-mushrooms-2": "Capsules",
    "raw": "Raw",
    "batteries": "Batteries",
    "vapes": "Vapes",
    "pods-vapes": "Pods",
}


def slug_to_name(slug: str) -> str:
    """Convert a URL slug to a human-readable product name."""
    name = slug
    # Remove -canada suffix
    name = re.sub(r'-canada$', '', name)
    # Remove common noise
    name = re.sub(r'-mohawk-medibles$', '', name)
    # Replace hyphens with spaces
    name = name.replace('-', ' ')
    # Title case with smart handling
    words = name.split()
    result = []
    # Words that should stay uppercase
    UPPER_WORDS = {'thc', 'cbd', 'og', 'dc', 'vip', 'raw', 'mac', 'fubar', '1:1', 'cbg', 'cbn'}
    # Words that should stay lowercase
    LOWER_WORDS = {'with', 'for', 'and', 'or', 'the', 'in', 'of', 'to', 'a'}
    for i, w in enumerate(words):
        if w.lower() in UPPER_WORDS:
            result.append(w.upper())
        elif i > 0 and w.lower() in LOWER_WORDS:
            result.append(w.lower())
        else:
            result.append(w.capitalize())
    return ' '.join(result)


def generate_alt_text(name: str, category: str) -> str:
    """Generate SEO-optimized alt text."""
    return f"{name} – Premium {category} from Mohawk Medibles, Indigenous-owned cannabis dispensary in Ontario, Canada"


def generate_meta_description(name: str, category: str, slug: str) -> str:
    """Generate SEO meta description (150-160 chars)."""
    base = f"Buy {name} online at Mohawk Medibles. Premium {category.lower()}"
    suffix = ", fast & discreet Canadian shipping. Indigenous-owned."
    if len(base + suffix) > 160:
        return (base[:157 - len(suffix)] + "..." + suffix)[:160]
    return base + suffix


def main():
    with open(INPUT_FILE) as f:
        raw_products = json.load(f)

    print(f"📦 Processing {len(raw_products)} products...")

    # Build TypeScript
    ts_lines = []
    ts_lines.append('// =============================================================')
    ts_lines.append('// Mohawk Medibles — Complete Product Registry (Auto-Generated)')
    ts_lines.append(f'// Total Products: {len(raw_products)}')
    ts_lines.append('// Source: WP Engine Staging (mohawkmedibstg.wpengine.com)')
    ts_lines.append('// =============================================================')
    ts_lines.append('')
    ts_lines.append('export interface Product {')
    ts_lines.append('    id: number;')
    ts_lines.append('    slug: string;')
    ts_lines.append('    name: string;')
    ts_lines.append('    category: string;')
    ts_lines.append('    subcategory: string | null;')
    ts_lines.append('    canonicalUrl: string;')
    ts_lines.append('    path: string;')
    ts_lines.append('    price: number;')
    ts_lines.append('    image: string;')
    ts_lines.append('    altText: string;')
    ts_lines.append('    metaDescription: string;')
    ts_lines.append('    shortDescription: string;')
    ts_lines.append('    featured: boolean;')
    ts_lines.append('    specs: {')
    ts_lines.append('        thc: string;')
    ts_lines.append('        cbd: string;')
    ts_lines.append('        type: string;')
    ts_lines.append('        weight: string;')
    ts_lines.append('        terpenes: string[];')
    ts_lines.append('        lineage: string;')
    ts_lines.append('    };')
    ts_lines.append('    eeatNarrative: string;')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export const PRODUCTS: Product[] = [')

    # Featured products (from backup data)
    featured_slugs = {
        'biscotti-la-mousse-hash-canada',
        'banana-sherbert-la-mousse-hash-canada',
        'burn-triple-threat-9g-disposable-thc-vape-canada',
        'stellar-thc-strawberries-cream-bar-canada',
    }

    for i, p in enumerate(raw_products):
        slug = p['slug']
        cat_key = p['category']
        category = CATEGORY_MAP.get(cat_key, cat_key.replace('-', ' ').title())
        subcategory = SUBCATEGORY_MAP.get(p.get('subcategory') or '', None)
        name = p.get('name') or slug_to_name(slug)
        if not name.strip():
            name = slug_to_name(slug)
        alt_text = generate_alt_text(name, category)
        meta_desc = generate_meta_description(name, category, slug)
        is_featured = slug in featured_slugs
        
        # Derive type from category/subcategory
        prod_type = subcategory or category
        
        # Price placeholder (will be updated from live data)
        price = 0.00

        # Short description
        short_desc = f"Premium {category.lower()} available at Mohawk Medibles – Canada's trusted Indigenous-owned dispensary."

        # EEAT narrative
        eeat = f"Available exclusively at Mohawk Medibles, {name} represents our commitment to quality and tradition. Sourced and curated by our team."

        ts_lines.append(f'    {{')
        ts_lines.append(f'        id: {i + 1},')
        ts_lines.append(f'        slug: {json.dumps(slug)},')
        ts_lines.append(f'        name: {json.dumps(name)},')
        ts_lines.append(f'        category: {json.dumps(category)},')
        ts_lines.append(f'        subcategory: {json.dumps(subcategory)},')
        ts_lines.append(f'        canonicalUrl: {json.dumps(p["canonical_url"])},')
        ts_lines.append(f'        path: {json.dumps(p["path"])},')
        ts_lines.append(f'        price: {price},')
        ts_lines.append(f'        image: "/assets/products/{slug}.jpg",')
        ts_lines.append(f'        altText: {json.dumps(alt_text)},')
        ts_lines.append(f'        metaDescription: {json.dumps(meta_desc)},')
        ts_lines.append(f'        shortDescription: {json.dumps(short_desc)},')
        ts_lines.append(f'        featured: {"true" if is_featured else "false"},')
        ts_lines.append(f'        specs: {{')
        ts_lines.append(f'            thc: "TBD",')
        ts_lines.append(f'            cbd: "TBD",')
        ts_lines.append(f'            type: {json.dumps(prod_type)},')
        ts_lines.append(f'            weight: "TBD",')
        ts_lines.append(f'            terpenes: [],')
        ts_lines.append(f'            lineage: "TBD",')
        ts_lines.append(f'        }},')
        ts_lines.append(f'        eeatNarrative: {json.dumps(eeat)},')
        ts_lines.append(f'    }},')

    ts_lines.append('];')
    ts_lines.append('')

    # Helper functions
    ts_lines.append('// ─── Helper Functions ────────────────────────────────────────')
    ts_lines.append('')
    ts_lines.append('export function getProductBySlug(slug: string): Product | undefined {')
    ts_lines.append('    return PRODUCTS.find(p => p.slug === slug);')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export function getProductsByCategory(category: string): Product[] {')
    ts_lines.append('    return PRODUCTS.filter(p => p.category === category);')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export function getFeaturedProducts(): Product[] {')
    ts_lines.append('    return PRODUCTS.filter(p => p.featured);')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export function getAllCategories(): string[] {')
    ts_lines.append('    return [...new Set(PRODUCTS.map(p => p.category))].sort();')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export function getAllSubcategories(category?: string): string[] {')
    ts_lines.append('    const filtered = category ? PRODUCTS.filter(p => p.category === category) : PRODUCTS;')
    ts_lines.append('    return [...new Set(filtered.map(p => p.subcategory).filter(Boolean) as string[])].sort();')
    ts_lines.append('}')
    ts_lines.append('')
    ts_lines.append('export function searchProducts(query: string): Product[] {')
    ts_lines.append('    const q = query.toLowerCase();')
    ts_lines.append('    return PRODUCTS.filter(p =>')
    ts_lines.append('        p.name.toLowerCase().includes(q) ||')
    ts_lines.append('        p.category.toLowerCase().includes(q) ||')
    ts_lines.append('        (p.subcategory && p.subcategory.toLowerCase().includes(q))')
    ts_lines.append('    );')
    ts_lines.append('}')
    ts_lines.append('')

    # Category index for Next.js routing
    ts_lines.append('// ─── Category Routing Map (preserves WooCommerce URL structure) ─')
    ts_lines.append('')
    ts_lines.append('export const CATEGORY_ROUTES: Record<string, { label: string; description: string }> = {')
    for key, label in sorted(CATEGORY_MAP.items()):
        ts_lines.append(f'    {json.dumps(key)}: {{ label: {json.dumps(label)}, description: "Shop {label} at Mohawk Medibles" }},')
    ts_lines.append('};')
    ts_lines.append('')

    output = '\n'.join(ts_lines)
    with open(OUTPUT_FILE, 'w') as f:
        f.write(output)

    print(f"✅ Generated {OUTPUT_FILE}")
    print(f"   {len(raw_products)} products")
    print(f"   {len(CATEGORY_MAP)} categories")
    print(f"   {len(ts_lines)} lines of TypeScript")

if __name__ == "__main__":
    main()
