"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/shop", label: "Shop", icon: "🛍️" },
  { href: "/deals", label: "Deals", icon: "🔥" },
  { href: "/checkout", label: "Cart", icon: "🛒", isCart: true },
];

export function StickyMobileNav() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 dark:bg-charcoal/95 backdrop-blur-xl border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-muted-foreground hover:text-lime transition-colors relative"
          >
            <span className="text-xl relative">
              {item.icon}
              {item.isCart && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-lime text-charcoal-deep text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
