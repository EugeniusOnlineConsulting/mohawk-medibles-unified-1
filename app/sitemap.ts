/**
 * Mohawk Medibles — Dynamic Sitemap
 * ══════════════════════════════════
 * Next.js built-in sitemap generation for all products, blog posts, and pages.
 * Generates sitemap.xml at build time / on request.
 */
import { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products";
import { SERVICE_AREAS } from "@/lib/seo/local-seo";
import { getAllBlogPosts } from "@/data/blog/posts";
import { getAllCities, getAllProvinces } from "@/lib/seo/city-delivery-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mohawkmedibles.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date().toISOString();
    const PRODUCTS = await getAllProducts();

    // ─── Static Pages ───────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/shop`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/faq`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/shipping-policy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/returns-policy`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/reviews`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/support`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/accessibility`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${BASE_URL}/deals`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/how-to-order`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    // ─── Product Pages (363 products) with images ───────────
    const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
        url: `${BASE_URL}${product.path}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: product.image ? [product.image] : undefined,
    }));

    // ─── Category Pages ─────────────────────────────────────
    const categories = [...new Set(PRODUCTS.map((p) => p.category))];
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${BASE_URL}/shop/${category.toLowerCase().replace(/\s+/g, "-")}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
    }));

    // ─── Delivery Landing Pages (Local SEO) ────────────────
    const cityDeliveryPages: MetadataRoute.Sitemap = SERVICE_AREAS
        .filter((area) => ["hamilton", "brantford", "toronto"].includes(area.slug))
        .map((area) => ({
            url: `${BASE_URL}/delivery/${area.slug}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.85,
        }));

    // ─── Delivery Hub Page ─────────────────────────────────────
    const deliveryHub: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/delivery`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.85,
        },
    ];

    // ─── Provincial Delivery Pages (match WordPress /province-delivery/) ──
    const provincialSlugs = [
        "ontario-delivery", "alberta-delivery", "british-columbia-delivery",
        "quebec-delivery", "manitoba-delivery", "saskatchewan-delivery",
        "nova-scotia-delivery", "new-brunswick-delivery", "new-foundland-labrador-delivery",
        "prince-edward-island-delivery", "northwest-territories-delivery",
        "nunavut-delivery", "yukon-delivery",
    ];
    const provincialPages: MetadataRoute.Sitemap = provincialSlugs.map((slug) => ({
        url: `${BASE_URL}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
    }));

    // ─── New Province Delivery Pages (under /delivery/[province]) ───────────
    const provinceDeliveryPages: MetadataRoute.Sitemap = getAllProvinces().map((province) => ({
        url: `${BASE_URL}/delivery/${province.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    // ─── New City Delivery Pages (under /delivery/[province]/[city]) ────────
    const cityDeliveryPages2: MetadataRoute.Sitemap = getAllCities().map(({ province, city }) => ({
        url: `${BASE_URL}/delivery/${province.slug}/${city.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
    }));

    // ─── Blog Posts ─────────────────────────────────────────
    const blogPosts = getAllBlogPosts();
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.dateModified || post.datePublished,
        changeFrequency: "weekly" as const,
        priority: 0.75,
    }));

    // ─── LLM Discovery File ────────────────────────────────
    const llmsEntry: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/llms.txt`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    return [...staticPages, ...deliveryHub, ...categoryPages, ...cityDeliveryPages, ...provincialPages, ...provinceDeliveryPages, ...cityDeliveryPages2, ...blogPages, ...productPages, ...llmsEntry];
}
