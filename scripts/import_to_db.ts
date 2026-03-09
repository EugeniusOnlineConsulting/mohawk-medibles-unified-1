/**
 * Mohawk Medibles — Full WooCommerce Data Import to PostgreSQL
 *
 * Imports all extracted WooCommerce data into the Prisma/PostgreSQL database:
 * - Products (288) from full_products_v2.json
 * - Customers (~25k) from customers.tsv + customer_addresses.tsv
 * - Orders (~2k) from orders.tsv + order_items.tsv
 * - Inventory from inventory.tsv
 * - Blog posts from blog_posts.tsv
 * - Pages from pages.tsv
 * - SEO keywords from product_seo.tsv
 *
 * Run: npx tsx scripts/import_to_db.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "fs";
import * as path from "path";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://mohawk:password@localhost:5432/mohawkmedibles",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["warn", "error"] });

const DATA_DIR = path.join(__dirname, "..", "data", "wc_export");
const PRODUCTS_JSON = path.join(__dirname, "..", "full_products_v2.json");

// ─── Helpers ──────────────────────────────────────────────

function parseTSV(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const vals = line.split("\t");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (vals[i] || "").trim();
    });
    return row;
  });
}

function clean(val: string | undefined | null): string {
  if (!val || val === "NULL" || val === "null") return "";
  return val.trim();
}

function cleanFloat(val: string | undefined | null): number {
  const s = clean(val);
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function cleanInt(val: string | undefined | null): number {
  const s = clean(val);
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

/** Map WC order status to our OrderStatus enum */
function mapOrderStatus(wcStatus: string): string {
  const map: Record<string, string> = {
    "wc-pending": "PENDING",
    "wc-processing": "PROCESSING",
    "wc-on-hold": "ON_HOLD",
    "wc-completed": "COMPLETED",
    "wc-cancelled": "CANCELLED",
    "wc-refunded": "REFUNDED",
    "wc-failed": "FAILED",
    "wc-checkout-draft": "PENDING",
    "trash": "CANCELLED",
  };
  return map[wcStatus] || "PENDING";
}

// ─── Import Products ─────────────────────────────────────

async function importProducts() {
  console.log("\n📦 Importing products...");
  const raw = fs.readFileSync(PRODUCTS_JSON, "utf-8");
  const products: any[] = JSON.parse(raw);

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    try {
      const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
      if (existing) { skipped++; continue; }

      const product = await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          shortName: p.name.length > 40 ? p.name.substring(0, 40) : null,
          category: p.category || "Uncategorized",
          subcategory: p.subcategory || null,
          price: p.price || 0,
          salePrice: null,
          sku: p.sku || null,
          canonicalUrl: p.canonicalUrl || "",
          path: p.path || `/shop/${p.slug}`,
          image: p.image || "",
          altText: p.altText || `${p.name} - Mohawk Medibles`,
          metaDescription: (p.metaDescription || "").substring(0, 500),
          shortDescription: (p.shortDescription || "").substring(0, 1000),
          longDescription: p.descriptionHTML || null,
          featured: p.featured || false,
          status: "ACTIVE",
        },
      });

      // Create product specs if available
      if (p.specs) {
        await prisma.productSpec.create({
          data: {
            productId: product.id,
            thc: p.specs.thc || null,
            cbd: p.specs.cbd || null,
            type: p.specs.type || null,
            weight: p.specs.weight || null,
            terpenes: p.specs.terpenes ? JSON.stringify(p.specs.terpenes) : null,
            lineage: p.specs.lineage || null,
            eeatNarrative: p.eeatNarrative || null,
          },
        });
      }

      // Create product images
      if (p.images && Array.isArray(p.images)) {
        for (let i = 0; i < p.images.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: p.images[i],
              altText: `${p.name} - Image ${i + 1}`,
              position: i,
            },
          });
        }
      }

      created++;
    } catch (err: any) {
      console.error(`  ⚠ Product "${p.name}": ${err.message?.substring(0, 100)}`);
    }
  }

  console.log(`  ✅ Products: ${created} created, ${skipped} skipped (already exist)`);
  return created;
}

// ─── Import Inventory ────────────────────────────────────

async function importInventory() {
  console.log("\n📊 Importing inventory...");
  const rows = parseTSV(path.join(DATA_DIR, "inventory.tsv"));

  let updated = 0;
  for (const row of rows) {
    const slug = clean(row["post_name"]);
    if (!slug) continue;

    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) continue;

    // Update product price from inventory data if available
    const price = cleanFloat(row["price"]);
    const salePrice = cleanFloat(row["sale_price"]);
    if (price > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price,
          salePrice: salePrice > 0 ? salePrice : null,
          sku: clean(row["sku"]) || product.sku,
        },
      });
    }

    // Create or update inventory record
    const stock = cleanInt(row["stock"]);
    const stockStatus = clean(row["stock_status"]);

    await prisma.inventory.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        quantity: stock > 0 ? stock : (stockStatus === "instock" ? 100 : 0),
        lowStockAt: 5,
        backorder: stockStatus === "onbackorder",
      },
      update: {
        quantity: stock > 0 ? stock : (stockStatus === "instock" ? 100 : 0),
        backorder: stockStatus === "onbackorder",
      },
    });
    updated++;
  }

  console.log(`  ✅ Inventory: ${updated} records updated`);
}

// ─── Import Customers ────────────────────────────────────

async function importCustomers() {
  console.log("\n👤 Importing customers...");
  const customers = parseTSV(path.join(DATA_DIR, "customers.tsv"));
  const addresses = parseTSV(path.join(DATA_DIR, "customer_addresses.tsv"));

  // Build address lookup by WC user ID
  const addrMap = new Map<string, Record<string, string>>();
  for (const a of addresses) {
    if (a["ID"]) addrMap.set(a["ID"], a);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches to avoid overwhelming the DB
  const BATCH = 500;
  for (let i = 0; i < customers.length; i += BATCH) {
    const batch = customers.slice(i, i + BATCH);

    for (const c of batch) {
      const email = clean(c["user_email"]);
      if (!email || email.length < 3) { skipped++; continue; }

      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) { skipped++; continue; }

        const displayName = clean(c["display_name"]) || clean(c["user_login"]) || "Customer";
        const registered = clean(c["user_registered"]);

        const user = await prisma.user.create({
          data: {
            email,
            passwordHash: "wc_imported_needs_reset",
            name: displayName,
            role: "CUSTOMER",
            createdAt: registered ? new Date(registered) : new Date(),
          },
        });

        // Add address if available
        const addr = addrMap.get(c["ID"]);
        if (addr) {
          const firstName = clean(addr["first_name"]);
          const lastName = clean(addr["last_name"]);
          const street = clean(addr["street"]);
          const city = clean(addr["city"]);

          if (firstName && city) {
            await prisma.address.create({
              data: {
                userId: user.id,
                label: "Billing",
                firstName,
                lastName: lastName || "",
                street1: street || "",
                city,
                province: clean(addr["province"]) || "ON",
                postalCode: clean(addr["postal"]) || "",
                country: "CA",
                phone: clean(addr["phone"]) || null,
                isDefault: true,
              },
            });
          }
        }

        created++;
      } catch (err: any) {
        errors++;
        if (errors <= 5) {
          console.error(`  ⚠ Customer "${c["user_email"]}": ${err.message?.substring(0, 80)}`);
        }
      }
    }

    if (i % 2000 === 0 && i > 0) {
      console.log(`  ... processed ${i}/${customers.length} customers`);
    }
  }

  console.log(`  ✅ Customers: ${created} created, ${skipped} skipped, ${errors} errors`);
  return created;
}

// ─── Import Orders ───────────────────────────────────────

async function importOrders() {
  console.log("\n📋 Importing orders...");
  const orders = parseTSV(path.join(DATA_DIR, "orders.tsv"));
  const orderItems = parseTSV(path.join(DATA_DIR, "order_items.tsv"));

  // Build order items lookup by WC order ID
  const itemsMap = new Map<string, Record<string, string>[]>();
  for (const item of orderItems) {
    const orderId = item["order_id"];
    if (!orderId) continue;
    if (!itemsMap.has(orderId)) itemsMap.set(orderId, []);
    itemsMap.get(orderId)!.push(item);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const o of orders) {
    const wcOrderId = cleanInt(o["ID"]);
    if (!wcOrderId) { skipped++; continue; }

    try {
      // Check if order already exists
      const existing = await prisma.order.findUnique({ where: { wcOrderId } });
      if (existing) { skipped++; continue; }

      const email = clean(o["email"]);
      if (!email) { skipped++; continue; }

      // Find or create the user
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const firstName = clean(o["first_name"]) || "Guest";
        const lastName = clean(o["last_name"]) || "";
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: "wc_imported_needs_reset",
            name: `${firstName} ${lastName}`.trim(),
            role: "CUSTOMER",
          },
        });
      }

      const total = cleanFloat(o["total"]);
      const status = mapOrderStatus(clean(o["post_status"]));

      const order = await prisma.order.create({
        data: {
          wcOrderId,
          orderNumber: `WC-${wcOrderId}`,
          userId: user.id,
          status: status as any,
          subtotal: total,
          tax: 0,
          total,
          currency: "CAD",
          paymentMethod: clean(o["payment"]) || null,
          paymentStatus: ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(status)
            ? "PAID"
            : "PENDING",
          createdAt: clean(o["post_date"]) ? new Date(o["post_date"]) : new Date(),
        },
      });

      // Create status history entry
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: status as any,
          note: `Imported from WooCommerce (WC #${wcOrderId})`,
          changedBy: "system_import",
        },
      });

      // Import line items
      const items = itemsMap.get(String(wcOrderId)) || [];
      for (const item of items) {
        const productWcId = cleanInt(item["product_id"]);
        const qty = cleanInt(item["qty"]) || 1;
        const lineTotal = cleanFloat(item["total"]);
        const itemName = clean(item["order_item_name"]) || "Unknown Product";

        // Try to find product by slug or just use a fallback
        let productId: number | null = null;
        if (productWcId) {
          const product = await prisma.product.findFirst({
            where: { id: productWcId },
          });
          if (product) productId = product.id;
        }

        // If we can't match the product, find by name similarity
        if (!productId) {
          const product = await prisma.product.findFirst({
            where: { name: { contains: itemName.substring(0, 30), mode: "insensitive" } },
          });
          if (product) productId = product.id;
        }

        // Skip if we truly can't find a matching product
        if (!productId) {
          // Create a placeholder lookup — use product ID 1 if it exists
          const fallback = await prisma.product.findFirst();
          if (fallback) productId = fallback.id;
        }

        if (productId) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId,
              quantity: qty,
              price: qty > 0 ? lineTotal / qty : lineTotal,
              total: lineTotal,
              name: itemName,
            },
          });
        }
      }

      created++;
    } catch (err: any) {
      errors++;
      if (errors <= 5) {
        console.error(`  ⚠ Order WC#${wcOrderId}: ${err.message?.substring(0, 100)}`);
      }
    }
  }

  console.log(`  ✅ Orders: ${created} created, ${skipped} skipped, ${errors} errors`);
}

// ─── Import Blog Posts ───────────────────────────────────

async function importBlogPosts() {
  console.log("\n📝 Importing blog posts...");
  const rows = parseTSV(path.join(DATA_DIR, "blog_posts.tsv"));

  let created = 0;
  for (const row of rows) {
    const slug = clean(row["post_name"]);
    if (!slug) continue;

    try {
      const existing = await prisma.blogPost.findUnique({ where: { slug } });
      if (existing) continue;

      await prisma.blogPost.create({
        data: {
          wcPostId: cleanInt(row["ID"]) || null,
          slug,
          title: clean(row["post_title"]) || slug,
          excerpt: clean(row["post_excerpt"]) || null,
          content: clean(row["post_excerpt"]) || "",  // Full content needs separate extraction
          author: "Mohawk Medibles",
          status: "published",
          seoTitle: clean(row["post_title"]),
          seoDescription: clean(row["meta_desc"]) || null,
          seoKeywords: clean(row["focus_kw"]) ? JSON.stringify([clean(row["focus_kw"])]) : null,
          publishedAt: clean(row["post_date"]) ? new Date(row["post_date"]) : new Date(),
        },
      });
      created++;
    } catch (err: any) {
      console.error(`  ⚠ Blog "${slug}": ${err.message?.substring(0, 80)}`);
    }
  }

  console.log(`  ✅ Blog posts: ${created} created`);
}

// ─── Import Pages ────────────────────────────────────────

async function importPages() {
  console.log("\n📄 Importing pages...");
  const rows = parseTSV(path.join(DATA_DIR, "pages.tsv"));

  let created = 0;
  for (const row of rows) {
    const slug = clean(row["post_name"]);
    if (!slug) continue;

    try {
      const existing = await prisma.page.findUnique({ where: { slug } });
      if (existing) continue;

      await prisma.page.create({
        data: {
          wcPageId: cleanInt(row["ID"]) || null,
          slug,
          title: clean(row["post_title"]) || slug,
          content: "",  // Page content needs separate extraction
          createdAt: clean(row["post_date"]) ? new Date(row["post_date"]) : new Date(),
        },
      });
      created++;
    } catch (err: any) {
      console.error(`  ⚠ Page "${slug}": ${err.message?.substring(0, 80)}`);
    }
  }

  console.log(`  ✅ Pages: ${created} created`);
}

// ─── Import SEO Keywords ─────────────────────────────────

async function importSEOKeywords() {
  console.log("\n🔑 Importing SEO keywords...");
  const rows = parseTSV(path.join(DATA_DIR, "product_seo.tsv"));

  const seen = new Set<string>();
  let created = 0;

  for (const row of rows) {
    const focusKw = clean(row["focus_kw"]);
    if (!focusKw || seen.has(focusKw.toLowerCase())) continue;
    seen.add(focusKw.toLowerCase());

    try {
      const existing = await prisma.keyword.findUnique({ where: { term: focusKw } });
      if (existing) continue;

      const slug = clean(row["post_name"]);
      await prisma.keyword.create({
        data: {
          term: focusKw,
          targetUrl: slug ? `/shop/${slug}` : null,
          category: "product",
          intent: "transactional",
        },
      });
      created++;
    } catch (err: any) {
      // Likely duplicate, skip
    }
  }

  console.log(`  ✅ SEO Keywords: ${created} created`);
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(60));
  console.log("🏪 Mohawk Medibles — Full Data Import to PostgreSQL");
  console.log("═".repeat(60));

  const start = Date.now();

  // Import in dependency order
  await importProducts();
  await importInventory();
  await importCustomers();
  await importOrders();
  await importBlogPosts();
  await importPages();
  await importSEOKeywords();

  // Final counts
  console.log("\n" + "═".repeat(60));
  console.log("📊 Final Database Counts:");
  const [products, users, orders, items, inventory, blogs, pages, keywords] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.inventory.count(),
      prisma.blogPost.count(),
      prisma.page.count(),
      prisma.keyword.count(),
    ]);

  console.log(`  Products:   ${products}`);
  console.log(`  Customers:  ${users}`);
  console.log(`  Orders:     ${orders}`);
  console.log(`  Order Items:${items}`);
  console.log(`  Inventory:  ${inventory}`);
  console.log(`  Blog Posts: ${blogs}`);
  console.log(`  Pages:      ${pages}`);
  console.log(`  Keywords:   ${keywords}`);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n⏱  Completed in ${elapsed}s`);
  console.log("═".repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  prisma.$disconnect();
  process.exit(1);
});
