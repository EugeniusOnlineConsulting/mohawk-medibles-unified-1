import requests
from bs4 import BeautifulSoup
import json
import time
import os
import re

BASE_URL = "https://mohawkmedibles.ca"
SHOP_URL = "https://mohawkmedibles.ca/shop/"

# Headers to mimic a real browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_product_links_from_page(page_url):
    print(f"Scanning {page_url}...")
    try:
        response = requests.get(page_url, headers=HEADERS)
        if response.status_code != 200:
            print(f"Failed to load page: {response.status_code}")
            return []
        
        soup = BeautifulSoup(response.content, "html.parser")
        # Updated selector based on browser inspection
        products = soup.find_all("div", class_="item-product")
        links = []
        for p in products:
            a_tag = p.find("a", class_="color-title")
            if a_tag and "href" in a_tag.attrs:
                links.append(a_tag["href"])
        
        return links
    except Exception as e:
        print(f"Error scanning page: {e}")
        return []

def scrape_product_details(url, index):
    print(f"[{index}] Scraping {url}...")
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Basic Info
        # Based on browser inspection: h2.product-title-single
        title_tag = soup.find("h2", class_="product-title-single")
        if not title_tag:
            # Fallback to h1 or h2 just in case
            title_tag = soup.find("h1", class_="product_title") or soup.find("h1") or soup.find("h2")
        
        if not title_tag: return None
        name = title_tag.get_text(strip=True)
        
        # Price
        price_tag = soup.find("p", class_="price")
        price = 0.0
        if price_tag:
            # Handle ranges or sale prices
            ins_tag = price_tag.find("ins")
            amount_text = (ins_tag or price_tag).get_text(strip=True)
            # Extract first number
            match = re.search(r'[\d,]+\.\d{2}', amount_text)
            if match:
                price = float(match.group().replace(",", ""))

        # SKU/ID
        id = index # Default if no SKU
        
        # Description (HTML)
        # Try multiple selectors for description
        desc_div = soup.find("div", id="tab-description") or \
                   soup.find("div", class_="woocommerce-Tabs-panel--description") or \
                   soup.find("div", class_="product-details__short-description")
        
        full_html = ""
        if desc_div:
            full_html = str(desc_div)
            # Clean "Description" header
            full_html = full_html.replace("<h2>Description</h2>", "")

        short_desc = re.sub('<[^<]+?>', '', full_html)[:200] + "..."

        # Images
        image = "/assets/placeholder.jpg" # Default
        # Try finding the main product image
        main_img = soup.find("img", class_="wp-post-image")
        if main_img and "src" in main_img.attrs:
            image = main_img["src"]
        
        # Categories
        posted_in = soup.find("span", class_="posted_in")
        category = "Cannabis"
        if posted_in:
            cat_links = posted_in.find_all("a")
            if cat_links:
                category = cat_links[0].get_text(strip=True)

        slug = url.strip("/").split("/")[-1]

        # Construct Product Object
        return {
            "id": id,
            "slug": slug,
            "name": name,
            "category": category,
            "subcategory": None,
            "canonicalUrl": url,
            "path": f"/shop/{slug}",
            "price": price,
            "image": image,
            "altText": f"{name} - Mohawk Medibles",
            "metaDescription": short_desc[:160],
            "shortDescription": short_desc,
            "descriptionHTML": full_html,
            "featured": False,
            "specs": {
                "thc": "TBD",
                "cbd": "TBD",
                "type": category,
                "weight": "TBD",
                "terpenes": [],
                "lineage": "TBD"
            },
            "eeatNarrative": f"{name} is a premium {category} product available at Mohawk Medibles."
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def main():
    print("Starting crawl...")
    all_links = []
    
    # Iterate through pages 1 to 20 (or until empty)
    for page in range(1, 21):
        page_url = f"{SHOP_URL}page/{page}/" if page > 1 else SHOP_URL
        links = get_product_links_from_page(page_url)
        
        if not links:
            print(f"No products found on page {page}. Stopping.")
            break
            
        print(f"Found {len(links)} products on page {page}")
        all_links.extend(links)
        time.sleep(1) # Be nice

    # Remove duplicates
    all_links = list(set(all_links))
    print(f"Total unique products found: {len(all_links)}")
    
    products_data = []
    for i, link in enumerate(all_links):
        print(f"Processing {i+1}/{len(all_links)}: {link}")
        p = scrape_product_details(link, i+1)
        if p:
            products_data.append(p)
        time.sleep(0.5) 

    # Output to JSON first
    with open("full_products.json", "w") as f:
        json.dump(products_data, f, indent=4)
    
    print("Saved to full_products.json")
    
    # Now generate TS file
    ts_content = f"""// =============================================================
// Mohawk Medibles — Complete Product Registry (Scraped)
// Total Products: {len(products_data)}
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
    altText: string;
    metaDescription: string;
    shortDescription: string;
    descriptionHTML?: string; // Optional HTML description
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

export const PRODUCTS: Product[] = {json.dumps(products_data, indent=4)};

export function getFeaturedProducts() {{
    return PRODUCTS.filter(p => p.featured);
}}

export function getShortName(product: Product) {{
    return product.name.length > 25 ? product.name.substring(0, 25) + "..." : product.name;
}}
"""
    
    # Write directly to lib/productData.ts? Or a temp file first?
    # Let's write to a temp file first for safety.
    with open("lib/productData.scraped.ts", "w") as f:
        f.write(ts_content)
    print("Generated lib/productData.scraped.ts. Review content then rename.")

if __name__ == "__main__":
    main()
