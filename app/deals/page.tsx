import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/products";

/**
 * Cannabis Deals & Promotions Page
 * Showcases active offers and featured/best-selling products
 * Server component (no "use client")
 */

export default async function DealsPage() {
    const products = await getAllProducts();

    // Filter featured products (up to 4)
    const featuredProducts = products
        .filter((p) => p.featured)
        .slice(0, 4);

    // Fallback to first 4 if no featured
    const staffPicks = featuredProducts.length > 0
        ? featuredProducts
        : products.slice(0, 4);

    // Best sellers: next 4 products after staff picks
    const bestSellers = products.slice(4, 8);

    return (
        <div className="min-h-screen pt-32 pb-20 bg-forest text-cream">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase mb-6">
                        Cannabis Deals & Promotions
                    </h1>
                    <p className="text-lg md:text-xl text-cream leading-relaxed mb-8">
                        Save on premium, lab-tested cannabis with our active offers. From free shipping to bulk discounts,
                        we&apos;re committed to making Empire Standard™ quality accessible to all Canadians.
                    </p>
                </div>
            </section>

            {/* Active Offers Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-10 uppercase">
                    Active Offers
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Free Shipping Card */}
                    <div className="glass p-8 rounded-2xl border border-secondary/20 backdrop-blur-md bg-white/5">
                        <h3 className="text-2xl font-bold text-secondary mb-3 uppercase tracking-wide">
                            Free Shipping
                        </h3>
                        <p className="text-cream leading-relaxed mb-6">
                            Free shipping on all orders over <span className="font-bold text-secondary">$150 CAD</span> — Canada-wide via Xpresspost.
                            Fast, discreet, secure delivery.
                        </p>
                        <Link href="/shop">
                            <Button variant="brand" size="lg">
                                Shop Now
                            </Button>
                        </Link>
                    </div>

                    {/* Mix & Match Card */}
                    <div className="glass p-8 rounded-2xl border border-secondary/20 backdrop-blur-md bg-white/5">
                        <h3 className="text-2xl font-bold text-secondary mb-3 uppercase tracking-wide">
                            Mix & Match
                        </h3>
                        <p className="text-cream leading-relaxed mb-6">
                            Buy any <span className="font-bold text-secondary">3 edibles</span>, get <span className="font-bold text-secondary">10% off</span> your
                            edible total. Mix flavors, strains, and potencies — your choice.
                        </p>
                        <Link href="/shop?category=Edibles">
                            <Button variant="brand" size="lg">
                                Shop Now
                            </Button>
                        </Link>
                    </div>

                    {/* Bulk Savings Card */}
                    <div className="glass p-8 rounded-2xl border border-secondary/20 backdrop-blur-md bg-white/5">
                        <h3 className="text-2xl font-bold text-secondary mb-3 uppercase tracking-wide">
                            Bulk Savings
                        </h3>
                        <p className="text-cream leading-relaxed mb-6">
                            Ounce deals starting at <span className="font-bold text-secondary">$40</span> — premium flower at unbeatable prices.
                            Perfect for serious enthusiasts.
                        </p>
                        <Link href="/shop?category=Flower">
                            <Button variant="brand" size="lg">
                                Shop Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Staff Picks Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-10 uppercase">
                    Staff Picks
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {staffPicks.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden glass border border-white/10 hover:border-secondary/50 transition-all duration-500"
                        >
                            {/* Product Image */}
                            {product.image && (
                                <Image
                                    src={product.image}
                                    alt={product.altText || product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />

                            {/* Category Badge (Top Left) */}
                            <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {product.category}
                            </div>

                            {/* Price Badge (Top Right) */}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-sm font-bold text-secondary">
                                ${product.price.toFixed(2)}
                            </div>

                            {/* Product Name (Bottom) */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Best Sellers Section */}
            <section className="container mx-auto px-6 mb-20">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-10 uppercase">
                    Best Sellers
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <Link
                            key={product.id}
                            href={`/shop/${product.slug}`}
                            className="group relative h-[300px] rounded-2xl overflow-hidden glass border border-white/10 hover:border-secondary/50 transition-all duration-500"
                        >
                            {/* Product Image */}
                            {product.image && (
                                <Image
                                    src={product.image}
                                    alt={product.altText || product.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent" />

                            {/* Category Badge (Top Left) */}
                            <div className="absolute top-4 left-4 bg-secondary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                                {product.category}
                            </div>

                            {/* Price Badge (Top Right) */}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-sm font-bold text-secondary">
                                ${product.price.toFixed(2)}
                            </div>

                            {/* Product Name (Bottom) */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-lg font-bold text-white line-clamp-2">
                                    {product.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 text-center">
                <div className="glass p-12 rounded-2xl border border-secondary/20 backdrop-blur-md bg-white/5 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4 uppercase">
                        Browse All 363+ Products
                    </h2>
                    <p className="text-cream mb-8 text-lg">
                        Discover our complete selection of premium cannabis products, all meeting the Empire Standard™.
                    </p>
                    <Link href="/shop">
                        <Button variant="brand" size="lg">
                            Explore Full Shop
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
