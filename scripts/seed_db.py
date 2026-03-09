#!/usr/bin/env python3
"""
Mohawk Medibles — Database Seeder
Converts extracted WooCommerce TSV data into JSON files ready to
seed the Prisma database. Also generates summary statistics.
"""

import os
import json
import re
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "wc_export")
SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed")

os.makedirs(SEED_DIR, exist_ok=True)


def parse_tsv(filename: str) -> list[dict]:
    """Parse a TSV file (WP-CLI output format) into a list of dicts."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"  ⚠️  File not found: {filename}")
        return []
    
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    if not lines:
        return []
    
    # WP db query outputs tab-separated with header row
    headers = lines[0].strip().split('\t')
    records = []
    for line in lines[1:]:
        values = line.strip().split('\t')
        if len(values) >= len(headers):
            record = {}
            for i, h in enumerate(headers):
                record[h.strip()] = values[i].strip() if i < len(values) else ""
            records.append(record)
    
    return records


def process_customers():
    """Process customers and addresses into seed JSON."""
    print("👤 Processing customers...")
    customers = parse_tsv("customers.tsv")
    addresses = parse_tsv("customer_addresses.tsv")
    
    # Build address lookup
    addr_map = {}
    for a in addresses:
        uid = a.get("ID", "")
        if uid:
            addr_map[uid] = a
    
    # Merge
    seed = []
    for c in customers:
        uid = c.get("ID", "")
        addr = addr_map.get(uid, {})
        seed.append({
            "wcId": int(uid) if uid.isdigit() else 0,
            "email": c.get("user_email", ""),
            "name": c.get("display_name", ""),
            "login": c.get("user_login", ""),
            "registered": c.get("user_registered", ""),
            "address": {
                "firstName": addr.get("first_name", ""),
                "lastName": addr.get("last_name", ""),
                "street": addr.get("street", ""),
                "city": addr.get("city", ""),
                "province": addr.get("province", ""),
                "postalCode": addr.get("postal", ""),
                "phone": addr.get("phone", ""),
            } if addr else None,
        })
    
    save_json("customers.json", seed)
    print(f"  ✅ {len(seed)} customers processed")
    return len(seed)


def process_orders():
    """Process orders and line items into seed JSON."""
    print("📦 Processing orders...")
    orders = parse_tsv("orders.tsv")
    items = parse_tsv("order_items.tsv")
    
    # Build items lookup by order_id
    items_map: dict[str, list] = {}
    for item in items:
        oid = item.get("order_id", "")
        if oid:
            items_map.setdefault(oid, []).append({
                "name": item.get("order_item_name", ""),
                "quantity": int(item.get("qty", "0") or "0"),
                "total": float(item.get("total", "0") or "0"),
                "productId": int(item.get("product_id", "0") or "0"),
            })
    
    seed = []
    for o in orders:
        oid = o.get("ID", "")
        status_map = {
            "wc-completed": "COMPLETED",
            "wc-processing": "PROCESSING",
            "wc-on-hold": "ON_HOLD",
            "wc-pending": "PENDING",
            "wc-cancelled": "CANCELLED",
            "wc-refunded": "REFUNDED",
            "wc-failed": "FAILED",
        }
        raw_status = o.get("post_status", "")
        seed.append({
            "wcOrderId": int(oid) if oid.isdigit() else 0,
            "orderNumber": f"MM-{oid}",
            "status": status_map.get(raw_status, "PENDING"),
            "date": o.get("post_date", ""),
            "email": o.get("email", ""),
            "firstName": o.get("first_name", ""),
            "lastName": o.get("last_name", ""),
            "total": float(o.get("total", "0") or "0"),
            "payment": o.get("payment", ""),
            "city": o.get("city", ""),
            "province": o.get("province", ""),
            "items": items_map.get(oid, []),
        })
    
    save_json("orders.json", seed)
    print(f"  ✅ {len(seed)} orders processed")
    return len(seed)


def safe_int(val, default=0):
    """Convert to int, handling NULL/empty strings."""
    if not val or val == "NULL" or val == "null":
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default

def safe_float(val, default=0.0):
    """Convert to float, handling NULL/empty strings."""
    if not val or val == "NULL" or val == "null":
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def process_inventory():
    """Process inventory data."""
    print("📊 Processing inventory...")
    records = parse_tsv("inventory.tsv")
    
    seed = []
    for r in records:
        seed.append({
            "wcId": safe_int(r.get("ID")),
            "name": r.get("post_title", ""),
            "slug": r.get("post_name", ""),
            "stock": safe_int(r.get("stock")),
            "stockStatus": r.get("stock_status", "instock") if r.get("stock_status") != "NULL" else "instock",
            "price": safe_float(r.get("price")),
            "salePrice": safe_float(r.get("sale_price")) if r.get("sale_price") and r.get("sale_price") != "NULL" else None,
            "sku": r.get("sku", "") if r.get("sku") != "NULL" else "",
        })
    
    save_json("inventory.json", seed)
    print(f"  ✅ {len(seed)} inventory records processed")
    return len(seed)


def process_blog():
    """Process blog posts."""
    print("📝 Processing blog posts...")
    posts = parse_tsv("blog_posts.tsv")
    
    seed = []
    for p in posts:
        seed.append({
            "wcPostId": int(p.get("ID", "0") or "0"),
            "title": p.get("post_title", ""),
            "slug": p.get("post_name", ""),
            "date": p.get("post_date", ""),
            "excerpt": p.get("post_excerpt", ""),
            "focusKeyword": p.get("focus_kw", ""),
            "metaDescription": p.get("meta_desc", ""),
        })
    
    save_json("blog_posts.json", seed)
    print(f"  ✅ {len(seed)} blog posts processed")
    return len(seed)


def process_pages():
    """Process static pages."""
    print("📄 Processing pages...")
    pages = parse_tsv("pages.tsv")
    
    seed = []
    for p in pages:
        seed.append({
            "wcPageId": int(p.get("ID", "0") or "0"),
            "title": p.get("post_title", ""),
            "slug": p.get("post_name", ""),
            "status": p.get("post_status", "publish"),
            "date": p.get("post_date", ""),
        })
    
    save_json("pages.json", seed)
    print(f"  ✅ {len(seed)} pages processed")
    return len(seed)


def process_product_seo():
    """Process product SEO keywords."""
    print("🔑 Processing product SEO data...")
    records = parse_tsv("product_seo.tsv")
    
    seed = []
    for r in records:
        seed.append({
            "wcId": int(r.get("ID", "0") or "0"),
            "name": r.get("post_title", ""),
            "slug": r.get("post_name", ""),
            "focusKeyword": r.get("focus_kw", ""),
            "metaDescription": r.get("meta_desc", ""),
        })
    
    save_json("product_seo.json", seed)
    print(f"  ✅ {len(seed)} product SEO entries processed")
    return len(seed)


def save_json(filename: str, data):
    path = os.path.join(SEED_DIR, filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    size = os.path.getsize(path) // 1024
    print(f"  💾 Saved {filename} ({size}KB)")


def main():
    print("=" * 60)
    print("🌱 Mohawk Medibles — Database Seeder")
    print("=" * 60)
    
    totals = {}
    totals["customers"] = process_customers()
    totals["orders"] = process_orders()
    totals["inventory"] = process_inventory()
    totals["blog"] = process_blog()
    totals["pages"] = process_pages()
    totals["seo"] = process_product_seo()
    
    print("\n" + "=" * 60)
    print("📊 Summary:")
    for k, v in totals.items():
        print(f"  {k}: {v:,}")
    print(f"\n📂 Seed files: {SEED_DIR}")
    print("=" * 60)
    
    # Write summary
    summary = {
        "generated": datetime.now().isoformat(),
        "source": "mohawkmedibstg.wpengine.com",
        "totals": totals,
    }
    save_json("_summary.json", summary)


if __name__ == "__main__":
    main()
