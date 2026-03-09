"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import ProductImage from "@/components/ProductImage";

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlist();
    const { addItem } = useCart();

    function handleAddToCart(item: typeof items[0]) {
        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
        });
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                        <p className="text-muted-foreground mt-1">
                            {items.length === 0
                                ? "Your wishlist is empty"
                                : `${items.length} saved product${items.length === 1 ? "" : "s"}`}
                        </p>
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearWishlist}
                            className="text-sm text-muted-foreground hover:text-red-400 transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No saved products yet</h2>
                        <p className="text-muted-foreground mb-6">
                            Browse our shop and tap the heart icon to save products you love.
                        </p>
                        <Link href="/shop">
                            <Button className="bg-forest hover:bg-forest/90 text-white">
                                Browse Shop <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border border-border rounded-2xl overflow-hidden group"
                            >
                                <Link href={`/product/${item.slug}`}>
                                    <div className="relative aspect-square bg-muted">
                                        <ProductImage
                                            src={item.image}
                                            alt={item.name}
                                            sizes="(max-width: 768px) 50vw, 25vw"
                                        />
                                    </div>
                                </Link>
                                <div className="p-4 space-y-2">
                                    <Link href={`/product/${item.slug}`}>
                                        <h3 className="font-medium text-sm line-clamp-2 hover:text-forest transition-colors">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                    <p className="font-bold text-forest">
                                        ${item.price.toFixed(2)}
                                    </p>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-forest text-white text-xs font-medium rounded-lg hover:bg-forest/90 transition-colors"
                                        >
                                            <ShoppingCart className="h-3 w-3" /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
