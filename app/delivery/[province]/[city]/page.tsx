/**
 * /delivery/[province]/[city] — Dynamic City-Level Delivery Page
 * ═════════════════════════════════════════════════════════════
 * Generates landing pages for 70+ Canadian cities with:
 * - Dynamic metadata & OG tags
 * - Store, BreadcrumbList, and FAQPage schemas
 * - City-specific delivery info
 * - Featured products
 * - Category showcase
 * - Local trust signals
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCity, getAllCities, getCityFaqs } from "@/lib/seo/city-delivery-data";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schemas";
import { getAllProducts } from "@/lib/products";

// ─── Static Params for SSG ──────────────────────────────────
export function generateStaticParams() {
    return getAllCities().map(({ province, city }) => ({
        province: province.slug,
        city: city.slug,
    }));
}

// ─── Dynamic Metadata ───────────────────────────────────────
type PageProps = { params: Promise<{ province: string; city: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { province: provinceSlug, city: citySlug } = await params;
    const data = getCity(provinceSlug, citySlug);

    if (!data) {
        return { title: "City Not Found" };
    }

    const { province, city } = data;
    const title = `Cannabis Delivery ${city.name} | Mohawk Medibles - Fast Shipping Across ${province.abbreviation}`;
    const description = `Order cannabis online in ${city.name}. Mohawk Medibles delivers premium flower, edibles, concentrates & more to ${city.name} & ${province.name}. Discreet packaging, free shipping over $150.`;
    const url = `https://mohawkmedibles.ca/delivery/${province.slug}/${city.slug}`;

    return {
        title,
        description,
        keywords: [
            `cannabis delivery ${city.name}`,
            `buy cannabis ${city.name}`,
            `marijuana delivery ${province.name}`,
            `${city.name} dispensary`,
            `cannabis online ${city.name}`,
            "mohawk medibles",
            "canada cannabis delivery",
        ],
        openGraph: {
            title,
            description,
            url,
            type: "website",
            images: [{ url: "https://mohawkmedibles.ca/og-image.png", width: 1200, height: 630 }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        alternates: { canonical: url },
    };
}

// ─── Server Component ───────────────────────────────────────
export default async function CityDeliveryPage({ params }: PageProps) {
    const { province: provinceSlug, city: citySlug } = await params;
    const data = getCity(provinceSlug, citySlug);

    if (!data) {
        notFound();
    }

    const { province, city } = data;

    // Get featured products
    const allProducts = await getAllProducts();
    const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
    const fallbackProducts = allProducts.slice(0, 4);
    const products = featuredProducts.length > 0 ? featuredProducts : fallbackProducts;

    // City FAQs
    const faqs = getCityFaqs(city.name, province.name, province.legalAge, city.deliveryTime);

    // Nearby cities (same province, exclude current)
    const nearbyCities = province.cities.filter((c) => c.slug !== city.slug);

    // Category data
    const categories = [
        { name: "Flower", slug: "flower" },
        { name: "Edibles", slug: "edibles" },
        { name: "Concentrates", slug: "concentrates" },
        { name: "Hash", slug: "hash" },
        { name: "Vapes", slug: "vapes" },
        { name: "CBD", slug: "cbd" },
    ];

    // Breadcrumb schema
    const breadcrumbs = [
        { name: "Home", url: "https://mohawkmedibles.ca" },
        { name: "Delivery", url: "https://mohawkmedibles.ca/delivery" },
        { name: province.name, url: `https://mohawkmedibles.ca/delivery/${province.slug}` },
        { name: city.name, url: `https://mohawkmedibles.ca/delivery/${province.slug}/${city.slug}` },
    ];

    // Store schema - built from trusted internal data
    const storeSchemaData = {
        "@context": "https://schema.org",
        "@type": "Store",
        name: "Mohawk Medibles",
        url: "https://mohawkmedibles.ca",
        image: "https://mohawkmedibles.ca/logo.png",
        description: `Indigenous-owned premium cannabis dispensary delivering to ${city.name}, ${province.name}. Lab-tested, terpene-profiled products meeting the Empire Standard™.`,
        address: {
            "@type": "PostalAddress",
            streetAddress: "Six Nations of the Grand River",
            addressLocality: "Ohsweken",
            addressRegion: "ON",
            addressCountry: "CA",
        },
        areaServed: {
            "@type": "City",
            name: city.name,
            geo: {
                "@type": "GeoCoordinates",
                latitude: city.lat,
                longitude: city.lng,
            },
        },
        priceRange: "$$",
    };

    return (
        <>
            {/* JSON-LD Schemas - using internal trusted data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchemaData) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
            />

            {/* Page Content */}
            <main className="min-h-screen pt-32 pb-20 bg-forest text-cream">
                <div className="container mx-auto px-6">
                    {/* Breadcrumb Navigation */}
                    <nav className="mb-12 flex items-center gap-2 text-sm text-cream/60">
                        <Link href="/" className="hover:text-secondary transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link
                            href="/delivery"
                            className="hover:text-secondary transition-colors"
                        >
                            Delivery
                        </Link>
                        <span>/</span>
                        <Link
                            href={`/delivery/${province.slug}`}
                            className="hover:text-secondary transition-colors"
                        >
                            {province.name}
                        </Link>
                        <span>/</span>
                        <span className="text-secondary">{city.name}</span>
                    </nav>

                    {/* Hero Section */}
                    <section className="mb-20">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase mb-6">
                            Cannabis Delivery in {city.name}
                        </h1>
                        <p className="text-lg text-cream/80 max-w-3xl leading-relaxed">
                            {city.description}
                        </p>
                    </section>

                    {/* Stats Row */}
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-5xl font-bold text-white mb-2">{city.population}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">
                                Population
                            </div>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-5xl font-bold text-white mb-2">{province.legalAge}+</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">
                                Legal Age
                            </div>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-5xl font-bold text-white mb-2">{city.deliveryTime}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">
                                Delivery Time
                            </div>
                        </div>
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <div className="text-5xl font-bold text-white mb-2">{city.landmark}</div>
                            <div className="text-[10px] uppercase tracking-[0.3em] text-cream/50">
                                Landmark
                            </div>
                        </div>
                    </section>

                    {/* Categories Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                            Popular Categories in {city.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category.slug}
                                    href={`/shop?category=${category.slug}`}
                                    className="glass p-6 rounded-2xl border border-white/10 hover:border-secondary/40 transition-all hover:scale-105 group"
                                >
                                    <h3 className="text-xl font-bold text-secondary group-hover:text-white transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-cream/60 mt-2">
                                        Premium {category.name.toLowerCase()} products shipped to {city.name}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Trust Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                            Why Order From Mohawk Medibles in {city.name}?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: "Fast Delivery",
                                    description: `Orders to ${city.name} arrive within ${city.deliveryTime} with full Canada Post tracking.`,
                                },
                                {
                                    title: "Discreet Packaging",
                                    description:
                                        "Plain, unmarked boxes with vacuum-sealed products. No cannabis branding or indication of contents.",
                                },
                                {
                                    title: "Premium Quality",
                                    description:
                                        "Lab-tested flower, edibles, concentrates, and more meeting the Empire Standard™.",
                                },
                                {
                                    title: "Free Shipping",
                                    description: "Orders over $150 CAD ship free. Track your package every step of the way.",
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className="glass p-6 rounded-2xl border border-white/10"
                                >
                                    <h3 className="text-xl font-bold text-secondary mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-cream/70 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Delivery Details Table */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                            Delivery Details
                        </h2>
                        <div className="glass p-8 rounded-2xl border border-white/10 space-y-6">
                            {[
                                {
                                    label: "Delivery Method",
                                    value: "Canada Post Xpresspost",
                                },
                                {
                                    label: "Estimated Delivery",
                                    value: city.deliveryTime,
                                },
                                {
                                    label: "Free Shipping Threshold",
                                    value: "$150 CAD or more",
                                },
                                {
                                    label: "Shipping Cost",
                                    value: "Flat rate under $150; Free over $150",
                                },
                                {
                                    label: "Tracking",
                                    value: "Full Canada Post tracking included",
                                },
                                {
                                    label: "Packaging",
                                    value: "Plain, unmarked box with vacuum-sealed products",
                                },
                                {
                                    label: "Minimum Age",
                                    value: `${province.legalAge} years or older (ID required)`,
                                },
                                {
                                    label: "Payment Methods",
                                    value: "Interac e-Transfer, Visa, Mastercard, Crypto",
                                },
                            ].map((row) => (
                                <div key={row.label} className="flex justify-between items-start border-b border-white/5 pb-4 last:border-b-0">
                                    <span className="text-cream/60 font-medium">{row.label}</span>
                                    <span className="text-white text-right font-semibold">
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <details
                                    key={idx}
                                    className="glass p-8 rounded-2xl border border-white/5 group cursor-pointer"
                                >
                                    <summary className="flex items-center justify-between select-none">
                                        <h3 className="text-xl font-bold text-secondary group-open:text-white transition-colors">
                                            {faq.question}
                                        </h3>
                                        <span className="text-secondary text-2xl group-open:rotate-180 transition-transform">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-4 text-cream/70 leading-relaxed text-sm">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>

                    {/* Other Cities Section */}
                    {nearbyCities.length > 0 && (
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                                Other Cities in {province.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {nearbyCities.map((nearbyCity) => (
                                    <Link
                                        key={nearbyCity.slug}
                                        href={`/delivery/${province.slug}/${nearbyCity.slug}`}
                                        className="glass p-6 rounded-2xl border border-white/10 hover:border-secondary/40 transition-all hover:scale-105"
                                    >
                                        <h3 className="text-lg font-bold text-white group-hover:text-secondary">
                                            {nearbyCity.name}
                                        </h3>
                                        <p className="text-xs text-cream/50 mt-1">
                                            {nearbyCity.deliveryTime} delivery
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Featured Products Section */}
                    {products.length > 0 && (
                        <section className="mb-20">
                            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                                Featured Products Available in {city.name}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.slug}
                                        href={`/shop/${product.slug}`}
                                        className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-secondary/40 transition-all hover:scale-105 group flex flex-col"
                                    >
                                        {product.image && (
                                            <div className="relative w-full h-48 bg-forest">
                                                <Image
                                                    src={product.image}
                                                    alt={product.altText}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-sm font-bold text-white truncate">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-secondary mt-1">
                                                {product.category}
                                            </p>
                                            <p className="text-xl font-bold text-white mt-auto pt-2">
                                                ${product.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cannabis Guides Section */}
                    <section className="mb-20">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
                            Cannabis Guides for {city.name} Customers
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { title: "The Complete Terpene Guide", slug: "terpene-guide-cannabis-effects", desc: "Learn how terpenes shape cannabis effects — myrcene, limonene, pinene & more." },
                                { title: "Edible Dosing Guide", slug: "edible-dosing-guide-beginners-canada", desc: "Safe THC dosing from 2.5mg to 50mg+. Start low, go slow." },
                                { title: "Indica vs Sativa vs Hybrid", slug: "indica-vs-sativa-vs-hybrid-guide", desc: "What the science actually says about strain types in 2026." },
                                { title: "The Ultimate Hash Guide", slug: "hash-guide-types-potency-canada", desc: "Afghan, Moroccan, La Mousse, Temple Ball — types, potency & how to choose." },
                                { title: "CBD Oil Benefits & Dosing", slug: "cbd-oil-guide-benefits-dosing-canada", desc: "Full spectrum vs isolate, dosing charts, and top product picks." },
                                { title: "How to Buy Cannabis Online", slug: "buying-cannabis-online-canada-guide", desc: "Complete 2026 guide to ordering cannabis online in Canada safely." },
                            ].map((guide) => (
                                <Link
                                    key={guide.slug}
                                    href={`/blog/${guide.slug}`}
                                    className="glass p-5 rounded-2xl border border-white/10 hover:border-secondary/40 transition-all group"
                                >
                                    <h3 className="text-sm font-bold text-secondary group-hover:text-white transition-colors mb-2">
                                        {guide.title}
                                    </h3>
                                    <p className="text-xs text-cream/60 leading-relaxed">{guide.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="text-center">
                        <h2 className="text-4xl font-bold text-white tracking-tight mb-6">
                            Order Cannabis in {city.name}
                        </h2>
                        <p className="text-lg text-cream/70 max-w-2xl mx-auto mb-8">
                            Fast, discreet delivery of premium cannabis products to {city.name}. Free shipping on orders over $150 CAD.
                        </p>
                        <Link href="/shop">
                            <Button className="bg-secondary hover:bg-secondary/80 text-forest font-bold text-lg px-8 py-6 rounded-lg">
                                Shop Now
                            </Button>
                        </Link>
                    </section>
                </div>
            </main>
        </>
    );
}
