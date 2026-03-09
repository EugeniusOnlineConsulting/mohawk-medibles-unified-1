"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useState } from "react";

interface WishlistButtonProps {
    product: {
        id: string | number;
        slug: string;
        name: string;
        price: number;
        image: string;
        category: string;
    };
    size?: "sm" | "md";
    className?: string;
}

export default function WishlistButton({ product, size = "sm", className = "" }: WishlistButtonProps) {
    const { toggleItem, isInWishlist } = useWishlist();
    const [animating, setAnimating] = useState(false);

    const id = String(product.id);
    const active = isInWishlist(id);

    function handleClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setAnimating(true);
        toggleItem({
            id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
        });
        setTimeout(() => setAnimating(false), 300);
    }

    const sizeClasses = size === "md"
        ? "h-5 w-5"
        : "h-4 w-4";

    const buttonClasses = size === "md"
        ? "p-2 rounded-xl"
        : "p-1.5 rounded-lg";

    return (
        <button
            onClick={handleClick}
            className={`${buttonClasses} transition-all duration-200 ${
                active
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-red-400"
            } ${animating ? "scale-125" : "scale-100"} ${className}`}
            title={active ? "Remove from wishlist" : "Add to wishlist"}
            aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={`${sizeClasses} transition-all ${active ? "fill-red-400" : ""}`}
            />
        </button>
    );
}
