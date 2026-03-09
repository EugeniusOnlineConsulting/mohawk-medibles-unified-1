#!/usr/bin/env python3
"""
Full Product Catalog Extractor for Mohawk Medibles
Scrapes the WP Engine staging site to extract all product URLs,
names, categories, and builds the complete product registry.
"""

import re
import json
import urllib.request
import urllib.error
import time
import os

BASE_URL = "https://mohawkmedibstg.wpengine.com/shop/"
CANONICAL_DOMAIN = "mohawkmedibles.ca"
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "lib", "products_raw.json")

def fetch_page(page_num: int) -> str:
    """Fetch a single shop page."""
    url = f"{BASE_URL}page/{page_num}/" if page_num > 1 else BASE_URL
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MohawkMediblesSEO/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return ""
        raise

def extract_products_from_html(html: str) -> list[dict]:
    """Extract product links and categories from raw HTML."""
    products = []
    # Match product links: /shop/{category}/{subcategory?}/{slug}/
    pattern = re.compile(
        r'href=["\']https://mohawkmedibles\.ca(/shop/[^"\']+?)["\']',
        re.IGNORECASE
    )
    seen_urls = set()
    for match in pattern.finditer(html):
        path = match.group(1).rstrip("/")
        if path in seen_urls:
            continue
        # Skip sort/filter URLs
        if "?" in path or "page/" in path:
            continue
        # Minimum 3 path segments: /shop/category/slug
        segments = [s for s in path.split("/") if s]
        if len(segments) < 3:
            continue
        seen_urls.add(path)

        # Parse category from URL
        category = segments[1] if len(segments) > 1 else "uncategorized"
        subcategory = segments[2] if len(segments) > 3 else None
        slug = segments[-1]

        products.append({
            "path": path,
            "slug": slug,
            "category": category,
            "subcategory": subcategory,
            "canonical_url": f"https://{CANONICAL_DOMAIN}{path}/",
        })

    return products

def extract_product_name_from_html(html: str, path: str) -> str:
    """Try to extract product name from link text."""
    slug = path.rstrip("/").split("/")[-1]
    # Clean slug to product name
    name = slug.replace("-canada", "").replace("-", " ").title()
    # Try to find the actual name in <h3> or link text
    pattern = re.compile(
        rf'href=["\']https://mohawkmedibles\.ca{re.escape(path)}/?["\'][^>]*>\s*([^<]+)',
        re.IGNORECASE
    )
    match = pattern.search(html)
    if match:
        name = match.group(1).strip().split("|")[0].strip()
    return name

def main():
    all_products = {}  # keyed by path to dedupe
    page = 1
    max_pages = 35  # 339 products / 12 per page ≈ 29 pages

    print(f"🔍 Extracting products from {BASE_URL}")
    print(f"   Target: ~339 products across ~29 pages\n")

    while page <= max_pages:
        print(f"  📄 Page {page}...", end=" ", flush=True)
        html = fetch_page(page)
        if not html:
            print("(empty/404 — done)")
            break

        products = extract_products_from_html(html)
        if not products:
            print("(no products found — done)")
            break

        new_count = 0
        for p in products:
            if p["path"] not in all_products:
                p["name"] = extract_product_name_from_html(html, p["path"])
                all_products[p["path"]] = p
                new_count += 1

        print(f"found {len(products)} links, {new_count} new (total: {len(all_products)})")
        page += 1
        time.sleep(0.3)  # Be polite

    # Sort by category
    result = sorted(all_products.values(), key=lambda x: (x["category"], x["slug"]))

    # Summary by category
    categories = {}
    for p in result:
        cat = p["category"]
        categories[cat] = categories.get(cat, 0) + 1

    print(f"\n✅ Extracted {len(result)} unique products")
    print(f"\n📂 Categories:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"   {cat}: {count}")

    # Save
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)
    print(f"\n💾 Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
