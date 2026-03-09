#!/usr/bin/env python3
"""
Mohawk Medibles — WooCommerce Data Extraction v2
Uses stdin SQL piping to bypass WP Engine shell quoting issues.
"""

import json
import os
import subprocess
import sys
import csv
import io

SSH_KEY = os.path.expanduser("~/.ssh/wpengine_ed25519")
SSH_HOST = "mohawkmedibstg@mohawkmedibstg.ssh.wpengine.net"
SITE_DIR = "/sites/mohawkmedibstg"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "wc_export")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def run_sql(query: str, timeout: int = 120) -> str:
    """Execute SQL query on remote WP database via stdin piping."""
    cmd = f'echo \'{query}\' | ssh -i {SSH_KEY} -o ConnectTimeout=10 {SSH_HOST} "cd {SITE_DIR} && wp db query < /dev/stdin" 2>/dev/null'
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return ""
    except Exception as e:
        print(f"  ⚠️  Error: {e}")
        return ""


def save(filename: str, data: str):
    """Save data to file."""
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, 'w') as f:
        f.write(data)
    lines = len(data.strip().split('\n'))
    size = len(data) // 1024
    print(f"  💾 Saved {filename} ({lines} rows, {size}KB)")
    return path


def main():
    # ── Safety guard: require explicit confirmation ──
    if "--confirm-staging" not in sys.argv:
        print("⛔ Safety guard: This script connects to WP Engine via SSH.")
        print("   It currently targets STAGING: mohawkmedibstg")
        print("   Run with --confirm-staging to proceed.")
        print("   Example: python scripts/extract_wc_data.py --confirm-staging")
        sys.exit(1)

    # Verify we're targeting staging, not production
    if "stg" not in SSH_HOST and "staging" not in SSH_HOST:
        print("⛔ BLOCKED: SSH_HOST does not appear to be a staging server.")
        print(f"   Current SSH_HOST: {SSH_HOST}")
        print("   This script should only run against staging environments.")
        sys.exit(1)

    print("=" * 60)
    print("🏪 Mohawk Medibles — WooCommerce Data Extraction v2")
    print("=" * 60)

    # 1. Database overview
    print("\n📊 Database Overview:")
    tables = {
        "Total Users": 'SELECT COUNT(ID) FROM wp_users',
        "Customers": 'SELECT COUNT(DISTINCT user_id) FROM wp_usermeta WHERE meta_key="wp_capabilities" AND meta_value LIKE "%customer%"',
        "Orders": 'SELECT COUNT(ID) FROM wp_posts WHERE post_type="shop_order"',
        "Products": 'SELECT COUNT(ID) FROM wp_posts WHERE post_type="product" AND post_status="publish"',
        "Blog Posts": 'SELECT COUNT(ID) FROM wp_posts WHERE post_type="post" AND post_status="publish"',
        "Pages": 'SELECT COUNT(ID) FROM wp_posts WHERE post_type="page" AND post_status="publish"',
    }
    for label, query in tables.items():
        result = run_sql(query, timeout=15)
        lines = result.strip().split('\n')
        count = lines[-1] if lines else "?"
        print(f"  {label}: {count}")

    # 2. Extract Customers
    print("\n👤 Extracting customers...")
    data = run_sql(
        'SELECT u.ID, u.user_login, u.user_email, u.display_name, u.user_registered '
        'FROM wp_users u '
        'JOIN wp_usermeta m ON u.ID = m.user_id '
        'WHERE m.meta_key = "wp_capabilities" AND m.meta_value LIKE "%customer%" '
        'ORDER BY u.user_registered DESC',
        timeout=60
    )
    if data:
        save("customers.tsv", data)
    else:
        print("  ⚠️  Customers extraction timed out")

    # 3. Extract Customer Addresses (billing)
    print("\n📍 Extracting customer addresses...")
    data = run_sql(
        'SELECT u.ID, '
        'MAX(CASE WHEN m.meta_key="billing_first_name" THEN m.meta_value END) as first_name, '
        'MAX(CASE WHEN m.meta_key="billing_last_name" THEN m.meta_value END) as last_name, '
        'MAX(CASE WHEN m.meta_key="billing_address_1" THEN m.meta_value END) as street, '
        'MAX(CASE WHEN m.meta_key="billing_city" THEN m.meta_value END) as city, '
        'MAX(CASE WHEN m.meta_key="billing_state" THEN m.meta_value END) as province, '
        'MAX(CASE WHEN m.meta_key="billing_postcode" THEN m.meta_value END) as postal, '
        'MAX(CASE WHEN m.meta_key="billing_phone" THEN m.meta_value END) as phone '
        'FROM wp_users u JOIN wp_usermeta m ON u.ID = m.user_id '
        'WHERE m.meta_key LIKE "billing_%" '
        'GROUP BY u.ID',
        timeout=60
    )
    if data:
        save("customer_addresses.tsv", data)
    else:
        print("  ⚠️  Addresses extraction timed out")

    # 4. Extract Orders (recent 2000)
    print("\n📦 Extracting orders (recent 2000)...")
    data = run_sql(
        'SELECT p.ID, p.post_status, p.post_date, '
        'MAX(CASE WHEN pm.meta_key="_billing_email" THEN pm.meta_value END) as email, '
        'MAX(CASE WHEN pm.meta_key="_billing_first_name" THEN pm.meta_value END) as first_name, '
        'MAX(CASE WHEN pm.meta_key="_billing_last_name" THEN pm.meta_value END) as last_name, '
        'MAX(CASE WHEN pm.meta_key="_order_total" THEN pm.meta_value END) as total, '
        'MAX(CASE WHEN pm.meta_key="_payment_method_title" THEN pm.meta_value END) as payment, '
        'MAX(CASE WHEN pm.meta_key="_billing_city" THEN pm.meta_value END) as city, '
        'MAX(CASE WHEN pm.meta_key="_billing_state" THEN pm.meta_value END) as province '
        'FROM wp_posts p '
        'LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id '
        'WHERE p.post_type = "shop_order" '
        'GROUP BY p.ID ORDER BY p.post_date DESC LIMIT 2000',
        timeout=120
    )
    if data:
        save("orders.tsv", data)
    else:
        print("  ⚠️  Orders extraction timed out — trying basic query")
        data = run_sql(
            'SELECT ID, post_status, post_date FROM wp_posts '
            'WHERE post_type = "shop_order" ORDER BY post_date DESC LIMIT 2000',
            timeout=30
        )
        if data:
            save("orders_basic.tsv", data)

    # 5. Extract Order Items  
    print("\n🛒 Extracting order items...")
    data = run_sql(
        'SELECT oi.order_id, oi.order_item_name, '
        'MAX(CASE WHEN oim.meta_key="_qty" THEN oim.meta_value END) as qty, '
        'MAX(CASE WHEN oim.meta_key="_line_total" THEN oim.meta_value END) as total, '
        'MAX(CASE WHEN oim.meta_key="_product_id" THEN oim.meta_value END) as product_id '
        'FROM wp_woocommerce_order_items oi '
        'LEFT JOIN wp_woocommerce_order_itemmeta oim ON oi.order_item_id = oim.order_item_id '
        'WHERE oi.order_item_type = "line_item" '
        'GROUP BY oi.order_item_id ORDER BY oi.order_id DESC LIMIT 5000',
        timeout=120
    )
    if data:
        save("order_items.tsv", data)
    else:
        print("  ⚠️  Order items extraction timed out")

    # 6. Extract Inventory / Product Pricing
    print("\n📊 Extracting inventory & pricing...")
    data = run_sql(
        'SELECT p.ID, p.post_title, p.post_name, '
        'MAX(CASE WHEN pm.meta_key="_stock" THEN pm.meta_value END) as stock, '
        'MAX(CASE WHEN pm.meta_key="_stock_status" THEN pm.meta_value END) as stock_status, '
        'MAX(CASE WHEN pm.meta_key="_regular_price" THEN pm.meta_value END) as price, '
        'MAX(CASE WHEN pm.meta_key="_sale_price" THEN pm.meta_value END) as sale_price, '
        'MAX(CASE WHEN pm.meta_key="_sku" THEN pm.meta_value END) as sku '
        'FROM wp_posts p '
        'LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id '
        'WHERE p.post_type = "product" AND p.post_status = "publish" '
        'GROUP BY p.ID ORDER BY p.ID',
        timeout=60
    )
    if data:
        save("inventory.tsv", data)
    else:
        print("  ⚠️  Inventory extraction timed out")

    # 7. Extract Blog Posts + Yoast SEO
    print("\n📝 Extracting blog posts + SEO data...")
    data = run_sql(
        'SELECT p.ID, p.post_title, p.post_name, p.post_date, p.post_excerpt, '
        'MAX(CASE WHEN pm.meta_key="_yoast_wpseo_focuskw" THEN pm.meta_value END) as focus_kw, '
        'MAX(CASE WHEN pm.meta_key="_yoast_wpseo_metadesc" THEN pm.meta_value END) as meta_desc '
        'FROM wp_posts p '
        'LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id '
        'WHERE p.post_type = "post" AND p.post_status = "publish" '
        'GROUP BY p.ID ORDER BY p.post_date DESC',
        timeout=60
    )
    if data:
        save("blog_posts.tsv", data)
    else:
        print("  ⚠️  Blog posts extraction timed out")

    # 8. Extract Pages
    print("\n📄 Extracting pages...")
    data = run_sql(
        'SELECT ID, post_title, post_name, post_status, post_date '
        'FROM wp_posts WHERE post_type = "page" AND post_status = "publish" '
        'ORDER BY menu_order, post_title',
        timeout=30
    )
    if data:
        save("pages.tsv", data)
    else:
        print("  ⚠️  Pages extraction timed out")

    # 9. Extract Categories & Tags
    print("\n🏷️  Extracting categories & tags...")
    data = run_sql(
        'SELECT t.term_id, t.name, t.slug, tt.taxonomy, tt.count, tt.parent '
        'FROM wp_terms t '
        'JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id '
        'WHERE tt.taxonomy IN ("product_cat","product_tag","category","post_tag") '
        'ORDER BY tt.taxonomy, tt.count DESC',
        timeout=30
    )
    if data:
        save("categories_tags.tsv", data)
    else:
        print("  ⚠️  Categories extraction timed out")

    # 10. Extract Yoast SEO Keywords for Products
    print("\n🔑 Extracting product SEO keywords...")
    data = run_sql(
        'SELECT p.ID, p.post_title, p.post_name, '
        'MAX(CASE WHEN pm.meta_key="_yoast_wpseo_focuskw" THEN pm.meta_value END) as focus_kw, '
        'MAX(CASE WHEN pm.meta_key="_yoast_wpseo_metadesc" THEN pm.meta_value END) as meta_desc '
        'FROM wp_posts p '
        'LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id '
        'WHERE p.post_type = "product" AND p.post_status = "publish" '
        'AND pm.meta_key LIKE "_yoast_%" '
        'GROUP BY p.ID ORDER BY p.post_title',
        timeout=60
    )
    if data:
        save("product_seo.tsv", data)
    else:
        print("  ⚠️  Product SEO extraction timed out")

    # Summary
    print("\n" + "=" * 60)
    print("✅ Extraction complete!")
    files = [f for f in os.listdir(OUTPUT_DIR) if os.path.isfile(os.path.join(OUTPUT_DIR, f))]
    total_size = sum(os.path.getsize(os.path.join(OUTPUT_DIR, f)) for f in files)
    print(f"📂 Output: {OUTPUT_DIR}")
    print(f"   Files: {len(files)}")
    print(f"   Total: {total_size // 1024}KB")
    for f in sorted(files):
        sz = os.path.getsize(os.path.join(OUTPUT_DIR, f)) // 1024
        print(f"   • {f} ({sz}KB)")
    print("=" * 60)


if __name__ == "__main__":
    main()
