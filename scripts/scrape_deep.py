#!/usr/bin/env python3
"""
Mohawk Medibles — Deep Product Scraper v2
Extracts: prices, THC/CBD, weight, terpenes, lineage, categories, gallery images, SKU
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://mohawkmedibles.ca"
SHOP_URL = f"{BASE_URL}/shop/"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# ── Known terpenes for matching ──────────────────────────────
KNOWN_TERPENES = [
    "Myrcene", "Limonene", "Caryophyllene", "Pinene", "Linalool",
    "Terpinolene", "Humulene", "Ocimene", "Bisabolol", "Valencene",
    "Geraniol", "Nerolidol", "Camphene", "Borneol", "Eucalyptol",
    "Phellandrene", "Terpineol", "Farnesene", "Guaiol"
]

# ── URL → Category mapping ───────────────────────────────────
CATEGORY_MAP = {
    "flower": "Flower",
    "concentrates": "Concentrates",
    "edibles": "Edibles",
    "nicotine": "Nicotine",
    "mushrooms-2": "Mushrooms",
    "vapes-2": "Vapes",
    "thc-vapes": "Vapes",
    "accessories": "Accessories",
    "cbd-2": "CBD",
    "sexual-enhancement": "Sexual Enhancement",
    "pets": "Pets",
    "wellness": "Wellness",
    "bath-salts": "Bath & Body",
    "sale": "Sale",
    "brands": "Brands",
}


def get_product_links_from_page(page_url):
    """Scan a shop listing page for product links."""
    print(f"  Scanning {page_url}...")
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return []
        soup = BeautifulSoup(resp.content, "html.parser")
        products = soup.find_all("div", class_="item-product")
        links = []
        for p in products:
            a = p.find("a", class_="color-title")
            if a and "href" in a.attrs:
                links.append(a["href"])
        return links
    except Exception as e:
        print(f"  Error: {e}")
        return []


def extract_price(soup):
    """Extract price from product page. Returns float."""
    # Primary selector: .bzotech-price-single .woocommerce-Price-amount bdi
    price_container = soup.find("div", class_="bzotech-price-single")
    if not price_container:
        price_container = soup.find("div", class_="product-price")
    if not price_container:
        price_container = soup.find("p", class_="price")

    if not price_container:
        return 0.0

    # Check for sale price first (<ins> tag)
    ins_tag = price_container.find("ins")
    if ins_tag:
        amounts = ins_tag.find_all("span", class_="woocommerce-Price-amount")
    else:
        amounts = price_container.find_all("span", class_="woocommerce-Price-amount")

    prices = []
    for amt in amounts:
        bdi = amt.find("bdi")
        text = (bdi or amt).get_text(strip=True)
        match = re.search(r'[\d,]+\.?\d*', text)
        if match:
            prices.append(float(match.group().replace(",", "")))

    if prices:
        return min(prices)  # Return lowest price (starting from)
    return 0.0


def extract_category_from_url(url):
    """Derive category and subcategory from URL path."""
    path = url.replace(f"{BASE_URL}/shop/", "").strip("/")
    parts = path.split("/")

    category = "Cannabis"
    subcategory = None

    if parts:
        raw_cat = parts[0]
        category = CATEGORY_MAP.get(raw_cat, raw_cat.replace("-", " ").title())

        # Subcategory from second path segment (if exists and isn't the slug)
        if len(parts) >= 3:
            raw_sub = parts[1]
            subcategory = raw_sub.replace("-", " ").title()
            # Clean up common suffixes
            subcategory = subcategory.replace(" 2", "").strip()

    return category, subcategory


def extract_specs_from_table(soup):
    """Extract specs from the Additional Information tab table."""
    specs = {"thc": "TBD", "cbd": "TBD", "weight": "TBD"}

    table = soup.find("table", class_="woocommerce-product-attributes")
    if not table:
        # Try inside the additional info tab
        tab = soup.find("div", id="tab-additional_information")
        if tab:
            table = tab.find("table")

    if table:
        rows = table.find_all("tr")
        for row in rows:
            label_el = row.find("th")
            value_el = row.find("td")
            if label_el and value_el:
                label = label_el.get_text(strip=True).lower()
                value = value_el.get_text(strip=True)
                if "thc" in label:
                    specs["thc"] = value
                elif "cbd" in label:
                    specs["cbd"] = value
                elif "weight" in label or "size" in label or "amount" in label:
                    specs["weight"] = value

    return specs


def extract_specs_from_description(desc_text):
    """Regex-based extraction of THC, CBD, terpenes, lineage from description."""
    found = {"thc": None, "cbd": None, "terpenes": [], "lineage": None, "type": None}

    if not desc_text:
        return found

    # THC percentage
    thc_match = re.search(r'(?:THC\s*[:\-]?\s*)([\d.]+\s*%?\s*(?:[–\-]\s*[\d.]+\s*%?)?)', desc_text, re.I)
    if not thc_match:
        thc_match = re.search(r'([\d.]+\s*%\s*(?:[–\-]\s*[\d.]+\s*%)?)\s*THC', desc_text, re.I)
    if thc_match:
        found["thc"] = thc_match.group(1).strip()

    # CBD percentage
    cbd_match = re.search(r'(?:CBD\s*[:\-]?\s*)([\d.]+\s*%?\s*(?:[–\-]\s*[\d.]+\s*%?)?)', desc_text, re.I)
    if not cbd_match:
        cbd_match = re.search(r'([\d.]+\s*%\s*(?:[–\-]\s*[\d.]+\s*%)?)\s*CBD', desc_text, re.I)
    if cbd_match:
        found["cbd"] = cbd_match.group(1).strip()

    # Strain type
    type_match = re.search(r'\b(Sativa|Indica|Hybrid)\b', desc_text, re.I)
    if type_match:
        found["type"] = type_match.group(1).title()

    # Lineage
    lineage_match = re.search(r'(?:Lineage|Genetics|Cross(?:ed)?)\s*[:\-]?\s*(.+?)(?:\n|<|\.)', desc_text, re.I)
    if lineage_match:
        found["lineage"] = lineage_match.group(1).strip()[:100]

    # Terpenes
    for terp in KNOWN_TERPENES:
        if re.search(rf'\b{terp}\b', desc_text, re.I):
            found["terpenes"].append(terp)

    return found


def extract_gallery(soup):
    """Extract all product gallery images."""
    images = []

    # Primary: WooCommerce gallery
    gallery = soup.find("div", class_="woocommerce-product-gallery")
    if gallery:
        for img in gallery.find_all("img"):
            src = img.get("data-large_image") or img.get("data-src") or img.get("src")
            if src and src not in images and "placeholder" not in src:
                images.append(src)

    # Fallback: Any product image
    if not images:
        main_img = soup.find("img", class_="wp-post-image")
        if main_img:
            src = main_img.get("src")
            if src:
                images.append(src)

    return images


def extract_sku(soup):
    """Extract product SKU."""
    sku_el = soup.find("span", class_="sku")
    if sku_el:
        return sku_el.get_text(strip=True)
    return ""


def scrape_product(url, index):
    """Deep-scrape a single product page."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            print(f"  [{index}] HTTP {resp.status_code}")
            return None

        soup = BeautifulSoup(resp.content, "html.parser")

        # ─── Title ─────────────────────────────────
        title_tag = (
            soup.find("h2", class_="product-title-single") or
            soup.find("h1", class_="product_title") or
            soup.find("h1") or
            soup.find("h2")
        )
        if not title_tag:
            print(f"  [{index}] No title found")
            return None
        name = title_tag.get_text(strip=True)

        # ─── Price ─────────────────────────────────
        price = extract_price(soup)

        # ─── Category from URL ─────────────────────
        category, subcategory = extract_category_from_url(url)

        # ─── Description HTML ──────────────────────
        desc_div = (
            soup.find("div", id="tab-description") or
            soup.find("div", class_="woocommerce-Tabs-panel--description") or
            soup.find("div", class_="product-details__short-description")
        )
        desc_html = ""
        desc_text = ""
        if desc_div:
            desc_html = str(desc_div)
            desc_html = desc_html.replace("<h2>Description</h2>", "")
            desc_text = desc_div.get_text(separator=" ", strip=True)

        short_desc = re.sub(r'<[^<]+?>', '', desc_html)[:200].strip()
        if short_desc:
            short_desc += "..."

        # ─── Specs: Table + Description Regex ──────
        table_specs = extract_specs_from_table(soup)
        desc_specs = extract_specs_from_description(desc_text)

        # Merge: table takes priority, then regex, then TBD
        thc = table_specs["thc"] if table_specs["thc"] != "TBD" else (desc_specs["thc"] or "TBD")
        cbd = table_specs["cbd"] if table_specs["cbd"] != "TBD" else (desc_specs["cbd"] or "TBD")
        weight = table_specs["weight"] if table_specs["weight"] != "TBD" else "TBD"
        strain_type = desc_specs["type"] or category
        terpenes = desc_specs["terpenes"]
        lineage = desc_specs["lineage"] or "TBD"

        # ─── Gallery ───────────────────────────────
        images = extract_gallery(soup)
        primary_image = images[0] if images else "/assets/placeholder.jpg"

        # ─── SKU ───────────────────────────────────
        sku = extract_sku(soup)

        # ─── Slug ──────────────────────────────────
        slug = url.strip("/").split("/")[-1]

        # ─── Meta Description ──────────────────────
        meta_desc = short_desc[:160] if short_desc else f"{name} — premium {category} product from Mohawk Medibles."

        product = {
            "id": index,
            "slug": slug,
            "name": name,
            "category": category,
            "subcategory": subcategory,
            "canonicalUrl": url,
            "path": f"/shop/{slug}",
            "price": price,
            "image": primary_image,
            "images": images,
            "altText": f"{name} - Mohawk Medibles",
            "sku": sku,
            "metaDescription": meta_desc,
            "shortDescription": short_desc,
            "descriptionHTML": desc_html,
            "featured": False,
            "specs": {
                "thc": thc,
                "cbd": cbd,
                "type": strain_type,
                "weight": weight,
                "terpenes": terpenes,
                "lineage": lineage,
            },
            "eeatNarrative": f"{name} is a premium {category} product available at Mohawk Medibles, Tyendinaga's trusted cannabis dispensary."
        }

        # Quality indicator
        filled = sum(1 for v in [price > 0, thc != "TBD", cbd != "TBD", weight != "TBD", len(terpenes) > 0, lineage != "TBD"] if v)
        print(f"  [{index}] ✓ {name} | ${price:.2f} | {thc} THC | {len(images)} imgs | {filled}/6 specs")
        return product

    except Exception as e:
        print(f"  [{index}] Error: {e}")
        return None


def generate_typescript(products, output_path):
    """Generate TypeScript file with Product interface and data."""
    lines = [
        "// =============================================================",
        f"// Mohawk Medibles — Complete Product Registry (Deep Scraped v2)",
        f"// Total Products: {len(products)}",
        "// =============================================================",
        "",
        "export interface Product {",
        "    id: number;",
        "    slug: string;",
        "    name: string;",
        "    category: string;",
        "    subcategory: string | null;",
        "    canonicalUrl: string;",
        "    path: string;",
        "    price: number;",
        "    image: string;",
        "    images: string[];",
        "    altText: string;",
        "    sku: string;",
        "    metaDescription: string;",
        "    shortDescription: string;",
        '    descriptionHTML?: string;',
        "    featured: boolean;",
        "    specs: {",
        "        thc: string;",
        "        cbd: string;",
        "        type: string;",
        "        weight: string;",
        "        terpenes: string[];",
        "        lineage: string;",
        "    };",
        "    eeatNarrative: string;",
        "}",
        "",
        f"export const PRODUCTS: Product[] = {json.dumps(products, indent=4, ensure_ascii=False)};",
        "",
        "export function getFeaturedProducts() {",
        "    return PRODUCTS.filter(p => p.featured);",
        "}",
        "",
        "export function getShortName(product: Product) {",
        '    return product.name.length > 25 ? product.name.substring(0, 25) + "..." : product.name;',
        "}",
        "",
        "export function getProductBySlug(slug: string): Product | undefined {",
        "    return PRODUCTS.find((p) => p.slug === slug);",
        "}",
        "",
        "export function getRelatedProducts(product: Product, count: number = 4): Product[] {",
        "    return PRODUCTS",
        "        .filter((p) => p.category === product.category && p.id !== product.id)",
        "        .slice(0, count);",
        "}",
        "",
        "export function getAllCategories(): string[] {",
        "    const categories = new Set(PRODUCTS.map((p) => p.category));",
        "    return Array.from(categories).sort();",
        "}",
        "",
    ]

    with open(output_path, "w") as f:
        f.write("\n".join(lines))
    print(f"\nGenerated {output_path}")


def main():
    print("═══════════════════════════════════════════════════")
    print("  Mohawk Medibles — Deep Product Scraper v2")
    print("═══════════════════════════════════════════════════")

    # ─── Phase 1: Collect all product links ────────────────
    print("\n▶ Phase 1: Collecting product links...")
    all_links = []
    for page in range(1, 25):
        page_url = f"{SHOP_URL}page/{page}/" if page > 1 else SHOP_URL
        links = get_product_links_from_page(page_url)
        if not links:
            print(f"  Page {page}: empty. Stopping.")
            break
        print(f"  Page {page}: {len(links)} products")
        all_links.extend(links)
        time.sleep(0.5)

    all_links = list(set(all_links))
    print(f"\n  Total unique links: {len(all_links)}")

    # ─── Phase 2: Deep scrape each product ─────────────────
    print("\n▶ Phase 2: Deep scraping product details...")
    products = []
    for i, link in enumerate(all_links):
        p = scrape_product(link, i + 1)
        if p:
            products.append(p)
        time.sleep(0.3)

    # ─── Phase 3: Statistics ───────────────────────────────
    print("\n▶ Phase 3: Data Quality Report")
    print(f"  Total products: {len(products)}")
    priced = sum(1 for p in products if p["price"] > 0)
    has_thc = sum(1 for p in products if p["specs"]["thc"] != "TBD")
    has_cbd = sum(1 for p in products if p["specs"]["cbd"] != "TBD")
    has_weight = sum(1 for p in products if p["specs"]["weight"] != "TBD")
    has_terpenes = sum(1 for p in products if len(p["specs"]["terpenes"]) > 0)
    has_lineage = sum(1 for p in products if p["specs"]["lineage"] != "TBD")
    has_gallery = sum(1 for p in products if len(p["images"]) > 1)
    categories = {}
    for p in products:
        categories[p["category"]] = categories.get(p["category"], 0) + 1

    print(f"  With price:    {priced}/{len(products)} ({priced*100//max(len(products),1)}%)")
    print(f"  With THC:      {has_thc}/{len(products)} ({has_thc*100//max(len(products),1)}%)")
    print(f"  With CBD:      {has_cbd}/{len(products)} ({has_cbd*100//max(len(products),1)}%)")
    print(f"  With weight:   {has_weight}/{len(products)} ({has_weight*100//max(len(products),1)}%)")
    print(f"  With terpenes: {has_terpenes}/{len(products)} ({has_terpenes*100//max(len(products),1)}%)")
    print(f"  With lineage:  {has_lineage}/{len(products)} ({has_lineage*100//max(len(products),1)}%)")
    print(f"  With gallery:  {has_gallery}/{len(products)} ({has_gallery*100//max(len(products),1)}%)")
    print(f"\n  Categories:")
    for k, v in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"    {k}: {v}")

    # ─── Phase 4: Output ──────────────────────────────────
    print("\n▶ Phase 4: Generating output files...")

    with open("full_products_v2.json", "w") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print("  Saved full_products_v2.json")

    generate_typescript(products, "lib/productData.ts")
    print("\n═══════════════════════════════════════════════════")
    print("  Done. Review lib/productData.ts")
    print("═══════════════════════════════════════════════════")


if __name__ == "__main__":
    main()
