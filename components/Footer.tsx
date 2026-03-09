"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { CreditCard, Bitcoin, ShieldCheck, Zap, Loader2, Check } from "lucide-react";

const provinces = [
    { name: "Alberta", slug: "alberta" },
    { name: "British Columbia", slug: "british-columbia" },
    { name: "Manitoba", slug: "manitoba" },
    { name: "New Brunswick", slug: "new-brunswick" },
    { name: "Newfoundland & Labrador", slug: "newfoundland-and-labrador" },
    { name: "Northwest Territories", slug: "northwest-territories" },
    { name: "Nova Scotia", slug: "nova-scotia" },
    { name: "Nunavut", slug: "nunavut" },
    { name: "Ontario", slug: "ontario" },
    { name: "Prince Edward Island", slug: "prince-edward-island" },
    { name: "Quebec", slug: "quebec" },
    { name: "Saskatchewan", slug: "saskatchewan" },
    { name: "Yukon", slug: "yukon" },
];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubscribe() {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus("error");
            setMessage("Please enter a valid email.");
            return;
        }
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "footer" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setStatus("success");
                setMessage(data.message || "Welcome to the Empire!");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Something went wrong.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    }

    return (
        <footer className="bg-forest text-cream py-16 border-t border-white/10 relative z-40">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                {/* Brand & Mission */}
                <div className="lg:col-span-2 space-y-6">
                    <Link href="/" className="relative block h-16 w-64 transition-opacity hover:opacity-80">
                        <Image
                            src="/assets/logos/medibles-photoroom.png"
                            alt="Mohawk Medibles Logo"
                            fill
                            className="object-contain object-left"
                        />
                    </Link>
                    <p className="text-cream/90 text-sm max-w-sm leading-relaxed">
                        Indigenous-owned cannabis dispensary serving Canada since 2019.
                        Premium edibles, vapes, concentrates, and flower with fast,
                        discreet shipping from Tyendinaga Mohawk Territory, Ontario.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-secondary font-bold">Fast Delivery</span>
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-secondary font-bold">Quality Assurance</span>
                        <span className="text-[9px] uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-secondary font-bold">Customer Support</span>
                    </div>
                </div>

                {/* Shop Links */}
                <div className="space-y-4">
                    <h5 className="font-bold text-sm tracking-widest uppercase text-white">Shop</h5>
                    <ul className="space-y-2 text-sm text-cream/80">
                        <li><Link href="/shop" className="hover:text-secondary transition-colors">All Collections</Link></li>
                        <li><Link href="/shop?category=Flower" className="hover:text-secondary transition-colors">Premium Flower</Link></li>
                        <li><Link href="/shop?category=Edibles" className="hover:text-secondary transition-colors">Artisan Edibles</Link></li>
                        <li><Link href="/shop?category=Concentrates" className="hover:text-secondary transition-colors">Pure Concentrates</Link></li>
                        <li><Link href="/shop?category=Vapes" className="hover:text-secondary transition-colors">Elite Vapes</Link></li>
                        <li><Link href="/shop?category=Hash" className="hover:text-secondary transition-colors">Hash</Link></li>
                        <li><Link href="/shop?category=Pre-Rolls" className="hover:text-secondary transition-colors">Pre-Rolls</Link></li>
                        <li><Link href="/shop?category=CBD" className="hover:text-secondary transition-colors">CBD</Link></li>
                    </ul>
                </div>

                {/* Support & Legal */}
                <div className="space-y-4">
                    <h5 className="font-bold text-sm tracking-widest uppercase text-white">Support</h5>
                    <ul className="space-y-2 text-sm text-cream/80">
                        <li><Link href="/faq" className="hover:text-secondary transition-colors">FAQ & Knowledgebase</Link></li>
                        <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                        <li><Link href="/shipping-policy" className="hover:text-secondary transition-colors">Shipping Policy</Link></li>
                        <li><Link href="/returns-policy" className="hover:text-secondary transition-colors">Returns Policy</Link></li>
                        <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    <h5 className="font-bold text-sm tracking-widest uppercase text-white">Quick Links</h5>
                    <ul className="space-y-2 text-sm text-cream/80">
                        <li><Link href="/deals" className="hover:text-secondary transition-colors">Deals</Link></li>
                        <li><Link href="/how-to-order" className="hover:text-secondary transition-colors">How to Order</Link></li>
                        <li><Link href="/blog" className="hover:text-secondary transition-colors">Blog</Link></li>
                    </ul>
                </div>

                {/* Delivery / Provinces */}
                <div className="space-y-4">
                    <h5 className="font-bold text-sm tracking-widest uppercase text-white">Delivery</h5>
                    <ul className="space-y-2 text-sm text-cream/80">
                        <li><Link href="/delivery" className="hover:text-secondary transition-colors">All Locations</Link></li>
                    </ul>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        <ul className="space-y-1 text-xs text-cream/75">
                            {provinces.slice(0, 7).map((p) => (
                                <li key={p.slug}>
                                    <Link href={`/delivery/${p.slug}`} className="hover:text-secondary transition-colors">
                                        {p.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ul className="space-y-1 text-xs text-cream/75">
                            {provinces.slice(7).map((p) => (
                                <li key={p.slug}>
                                    <Link href={`/delivery/${p.slug}`} className="hover:text-secondary transition-colors">
                                        {p.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Trust & Newsletter */}
            <div className="container mx-auto px-6 mt-16 pt-12 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-wrap gap-6 sm:gap-10 items-center transition-all duration-500">
                        {/* Professional Payment Trust Badges */}
                        <div className="flex flex-col items-center gap-2 group cursor-help">
                            <div className="bg-white/10 p-2.5 px-4 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/15 transition-all duration-300">
                                <Zap className="h-5 w-5 text-yellow-400" />
                                <span className="ml-2 text-[10px] font-bold text-cream tracking-widest">INTERAC</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-cream/80 group-hover:text-secondary transition-colors">Instant Pay</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-help">
                            <div className="bg-white/10 p-2.5 px-4 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/15 transition-all duration-300">
                                <CreditCard className="h-5 w-5 text-blue-400" />
                                <span className="ml-2 text-[10px] font-bold text-cream tracking-widest">VISA / MC</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-cream/80 group-hover:text-secondary transition-colors">Global Credit</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-help">
                            <div className="bg-white/10 p-2.5 px-4 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/15 transition-all duration-300">
                                <Bitcoin className="h-5 w-5 text-orange-400" />
                                <span className="ml-2 text-[10px] font-bold text-cream tracking-widest">BITCOIN</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-cream/80 group-hover:text-secondary transition-colors">Crypto Ready</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-help">
                            <div className="bg-white/10 p-2.5 px-4 rounded-lg border border-white/20 flex items-center justify-center hover:bg-white/15 transition-all duration-300">
                                <ShieldCheck className="h-5 w-5 text-green-400" />
                                <span className="ml-2 text-[10px] font-bold text-cream tracking-widest">SSL SECURE</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-cream/80 group-hover:text-secondary transition-colors">256-bit AES</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
                        {status === "success" ? (
                            <div className="flex items-center gap-2 text-secondary text-sm">
                                <Check className="h-4 w-4" />
                                <span>{message}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center md:items-end gap-2">
                                <div className="flex gap-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                                        placeholder="Join the Empire... (Email)"
                                        className="bg-white/5 border border-white/10 rounded-full px-6 py-2 text-sm text-white w-64 focus:outline-none focus:border-secondary transition-colors"
                                    />
                                    <Button
                                        variant="brand"
                                        size="sm"
                                        className="rounded-full"
                                        onClick={handleSubscribe}
                                        disabled={status === "loading"}
                                    >
                                        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
                                    </Button>
                                </div>
                                {status === "error" && (
                                    <p className="text-red-400 text-[10px]">{message}</p>
                                )}
                            </div>
                        )}
                        <p className="text-[10px] text-cream/70 uppercase tracking-widest">Subscriber Perk: Free 1:1 consultation & special drops</p>
                    </div>
                </div>
            </div>

            {/* Copyright & Info */}
            <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-cream/70 uppercase tracking-widest">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <span>45 Dundas Street Deseronto, Ontario</span>
                    <span>(613) 396 6728</span>
                    <span>info@mohawkmedibles.ca</span>
                </div>
                <div>
                    © 2026 Mohawk Medibles • Indigenous Sovereignty • 19+ Only
                </div>
            </div>
        </footer>
    );
}
