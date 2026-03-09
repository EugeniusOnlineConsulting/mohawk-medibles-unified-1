"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/LocaleProvider";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import SearchAutocomplete from "@/components/SearchAutocomplete";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";
    const { t } = useLocale();
    const { items } = useCart();
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const { count: wishlistCount } = useWishlist();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* Notice Banner */}
            <div role="alert" className="bg-zinc-950 text-white text-[10px] py-1.5 px-6 text-center font-bold tracking-widest border-b border-white/5 uppercase relative z-[60] font-sans">
                NOTICE: WE HAVE UPDATED OUR E-TRANSFER PAYMENT DETAILS. PLEASE CHECK YOUR EMAIL.
            </div>

            <nav
                role="navigation"
                aria-label="Main navigation"
                className={`fixed w-full z-50 transition-all duration-700 px-6 py-4 flex justify-between items-center ${isScrolled || !isHome
                    ? "bg-zinc-950/95 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
                    : "bg-transparent"
                    } ${isHome ? "top-8" : "top-8"}`}
            >
                <div className="flex items-center gap-8">
                    <Link href="/" className="relative h-10 w-40 md:h-12 md:w-48 transition-opacity hover:opacity-80">
                        <Image
                            src="/assets/logos/medibles-photoroom.png"
                            alt="Mohawk Medibles"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-white font-sans">
                        {(["Shop", "Deals", "About", "Blog", "Reviews", "FAQ", "Support"] as const).map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase()}`}
                                className="relative group transition-colors hover:text-white"
                            >
                                {t(`nav.${item.toLowerCase()}`)}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-secondary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <SearchAutocomplete />
                        <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/5" aria-label="My account">
                            <User className="h-4 w-4" />
                        </Button>
                    </div>

                    <Link href="/wishlist" className="relative" aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ""}`}>
                        <Button variant="ghost" size="icon" className="text-white/80 hover:text-red-400 hover:bg-white/5">
                            <Heart className="h-4 w-4" />
                        </Button>
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                                {wishlistCount > 99 ? "99+" : wishlistCount}
                            </span>
                        )}
                    </Link>

                    <Link href="/checkout" className="relative" aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}>
                        <Button variant="brand" size="sm" className="rounded-full flex items-center gap-2 px-4 shadow-lg shadow-secondary/20">
                            <ShoppingCart className="h-4 w-4" />
                            <span className="hidden md:inline text-[10px] font-bold tracking-widest uppercase">Cart</span>
                        </Button>
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                                {cartCount > 99 ? "99+" : cartCount}
                            </span>
                        )}
                    </Link>

                    <button
                        className="lg:hidden text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div id="mobile-menu" role="menu" aria-label="Mobile navigation" className="absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-10 flex flex-col gap-8 text-2xl font-bold uppercase tracking-tight animate-in fade-in slide-in-from-top-4 duration-500 font-heading z-[70]">
                        <Link href="/shop" className="hover:text-secondary transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                            Shop
                            <div className="w-8 h-[1px] bg-white/20" />
                        </Link>
                        <Link href="/deals" className="hover:text-secondary transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                            Deals
                            <div className="w-8 h-[1px] bg-white/20" />
                        </Link>
                        <Link href="/about" className="hover:text-secondary transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                            About
                            <div className="w-8 h-[1px] bg-white/20" />
                        </Link>
                        <Link href="/faq" className="hover:text-secondary transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                            FAQ
                            <div className="w-8 h-[1px] bg-white/20" />
                        </Link>
                        <Link href="/blog" className="hover:text-secondary transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                            Blog
                            <div className="w-8 h-[1px] bg-white/20" />
                        </Link>
                        <Link href="/contact" className="hover:text-secondary transition-colors flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                            Contact
                            <div className="w-8 h-[1px] bg-white/20" />
                        </Link>
                        <div className="flex flex-col gap-4 pt-8 font-sans text-sm tracking-widest">
                            <Button variant="outline" className="w-full rounded-2xl border-white/10 h-14 uppercase font-bold bg-white/5 hover:bg-white/10">Member Login</Button>
                            <Button variant="brand" className="w-full rounded-2xl h-14 uppercase font-bold shadow-lg shadow-secondary/20">Talk to Support</Button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
