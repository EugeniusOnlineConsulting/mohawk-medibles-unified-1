#!/usr/bin/env python3
"""
Download product images from the Mohawk Medibles staging site.
Visits each product page and downloads the main product image.
"""

import json
import re
import urllib.request
import urllib.error
import os
import time
import sys

INPUT_FILE = "/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0/lib/products_raw.json"
OUTPUT_DIR = "/Users/eugeneagyemang/MohawkMedibles_SEO_v1.0/public/assets/products"
STAGING_BASE = "https://mohawkmedibstg.wpengine.com"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def download_image(url: str, dest: str) -> bool:
    """Download an image from a URL."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MohawkMediblesSEO/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) < 100:  # Too small, probably an error
                return False
            with open(dest, "wb") as f:
                f.write(data)
            return True
    except Exception as e:
        return False

def get_product_image_url(product_path: str) -> str | None:
    """Visit a product page and extract the main product image URL."""
    # Convert canonical path to staging URL
    url = f"{STAGING_BASE}{product_path}/"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MohawkMediblesSEO/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception:
        return None

    # Look for og:image meta tag first (most reliable)
    og_match = re.search(r'property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html)
    if og_match:
        return og_match.group(1)
    
    # Look for woocommerce-product-gallery__image
    gallery_match = re.search(r'woocommerce-product-gallery__image[^>]*>.*?<img[^>]+src=["\']([^"\']+)["\']', html, re.DOTALL)
    if gallery_match:
        return gallery_match.group(1)

    # Fallback: first large image in product content
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+(?:uploads|products)[^"\']+)["\']', html)
    if img_match:
        return img_match.group(1)

    return None

def main():
    with open(INPUT_FILE) as f:
        products = json.load(f)

    # Limit to n products if arg given
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else len(products)
    products = products[:limit]

    print(f"🖼️  Downloading images for {len(products)} products...")
    print(f"   Output: {OUTPUT_DIR}\n")

    downloaded = 0
    skipped = 0
    failed = 0
    image_map = {}

    for i, p in enumerate(products):
        slug = p["slug"]
        dest_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")

        # Skip if already downloaded
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 100:
            skipped += 1
            image_map[slug] = dest_path
            continue

        print(f"  [{i+1}/{len(products)}] {slug[:50]}...", end=" ", flush=True)

        img_url = get_product_image_url(p["path"])
        if img_url:
            # Get the full-size image (remove WP size suffix like -300x300)
            full_url = re.sub(r'-\d+x\d+(?=\.\w+$)', '', img_url)
            
            if download_image(full_url, dest_path):
                sz = os.path.getsize(dest_path)
                print(f"✅ ({sz // 1024}KB)")
                downloaded += 1
                image_map[slug] = dest_path
            else:
                # Try original URL as fallback
                if download_image(img_url, dest_path):
                    sz = os.path.getsize(dest_path)
                    print(f"✅ fallback ({sz // 1024}KB)")
                    downloaded += 1
                    image_map[slug] = dest_path
                else:
                    print("❌ download failed")
                    failed += 1
        else:
            print("❌ no image found")
            failed += 1

        time.sleep(0.2)  # Be polite

    print(f"\n📊 Results:")
    print(f"   ✅ Downloaded: {downloaded}")
    print(f"   ⏭️  Skipped (already exists): {skipped}")
    print(f"   ❌ Failed: {failed}")
    print(f"   Total: {downloaded + skipped + failed}")

    # Save image map
    map_file = os.path.join(os.path.dirname(INPUT_FILE), "product_images.json")
    with open(map_file, "w") as f:
        json.dump(image_map, f, indent=2)
    print(f"\n💾 Image map saved to {map_file}")

if __name__ == "__main__":
    main()
