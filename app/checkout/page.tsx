"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart, Trash2, Plus, Minus, CreditCard,
    Shield, Truck, ArrowLeft, Loader2, Tag, X, CheckCircle, User, LogIn,
} from "lucide-react";
import GooglePayButton from "@/components/GooglePayButton";
import FreeShippingBar from "@/components/FreeShippingBar";
import { trackBeginCheckout } from "@/lib/analytics";

interface CouponResult {
    valid: boolean;
    reason?: string;
    code?: string;
    type?: string;
    discount?: number;
    freeShipping?: boolean;
}

export default function CheckoutPage() {
    const { items, removeItem, addItem, updateQuantity, clearCart, total } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Authenticated user state (for email pre-fill + faster checkout)
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Fetch user profile on mount (non-blocking, silent on failure)
    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const res = await fetch("/api/account?action=profile");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.email) {
                        setUserEmail(data.user.email);
                        setUserName(data.user.name || null);
                        setIsAuthenticated(true);
                    }
                }
            } catch {
                // Guest checkout — no session, no problem
            }
        }
        fetchUserProfile();
    }, []);

    // GA4: Track begin_checkout
    useEffect(() => {
        if (items.length > 0) {
            trackBeginCheckout(
                items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                total
            );
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync cart with email for abandoned cart tracking
    useEffect(() => {
        if (userEmail && items.length > 0) {
            fetch("/api/cart/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, email: userEmail }),
            }).catch(() => {});
        }
    }, [userEmail, items]);

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
    const [couponError, setCouponError] = useState("");

    // Calculate totals with coupon
    const discount = appliedCoupon?.valid ? (appliedCoupon.discount || 0) : 0;
    const subtotalAfterDiscount = Math.max(0, total - discount);
    const hasFreeShipping = appliedCoupon?.valid && appliedCoupon.freeShipping;
    const shipping = hasFreeShipping ? 0 : (total >= 150 ? 0 : 15);
    const tax = +((subtotalAfterDiscount + shipping) * 0.13).toFixed(2); // Ontario HST 13%
    const grandTotal = +(subtotalAfterDiscount + shipping + tax).toFixed(2);

    // ─── Coupon Validation ───────────────────────────────────
    async function handleApplyCoupon() {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");

        try {
            const res = await fetch(
                `/api/admin/coupons?action=validate&code=${encodeURIComponent(couponCode.trim())}&total=${total}`
            );
            const data = await res.json();

            if (data.valid) {
                setAppliedCoupon({
                    valid: true,
                    code: couponCode.trim().toUpperCase(),
                    type: data.type,
                    discount: data.discount || 0,
                    freeShipping: data.type === "FREE_SHIPPING",
                });
                setCouponError("");
            } else {
                setCouponError(data.reason || "Invalid coupon code");
                setAppliedCoupon(null);
            }
        } catch {
            setCouponError("Failed to validate coupon. Try again.");
        }
        setCouponLoading(false);
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    }

    // ─── Checkout ────────────────────────────────────────────
    async function handleCheckout() {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    email: userEmail || undefined, // Pre-fill Stripe email for authenticated users
                    couponCode: appliedCoupon?.valid ? appliedCoupon.code : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Checkout failed");

            // Redirect to Stripe
            window.location.href = data.url;
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
            setLoading(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6"
                >
                    <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto" />
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Your Cart is Empty</h1>
                    <p className="text-muted-foreground">Browse our collection to find your perfect product.</p>
                    <Link href="/shop">
                        <Button variant="brand" size="lg" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Continue Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest mb-8">
                    <ArrowLeft className="h-4 w-4" /> Continue Shopping
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Checkout</h1>
                    <button
                        onClick={() => {
                            if (window.confirm("Remove all items from your cart?")) {
                                clearCart();
                            }
                        }}
                        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Empty Cart
                    </button>
                </div>

                {/* Authentication Status Banner */}
                {isAuthenticated ? (
                    <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-3">
                        <User className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="text-sm">
                            <span className="text-green-700 dark:text-green-300">
                                Signed in as <strong>{userName || userEmail}</strong>
                            </span>
                            <span className="text-green-600/70 dark:text-green-400/70 ml-1">
                                — your email will be pre-filled at payment
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Have an account? <Link href="/login?redirect=/checkout" className="font-bold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100">Sign in</Link> for faster checkout
                            </span>
                        </div>
                        <span className="text-[10px] text-blue-500 dark:text-blue-400 uppercase tracking-wider font-bold whitespace-nowrap">
                            Guest OK
                        </span>
                    </div>
                )}

                {/* Free Shipping Progress */}
                <div className="mb-6">
                    <FreeShippingBar />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white dark:bg-card rounded-xl border border-border p-4 flex items-center gap-4"
                            >
                                <div className="w-20 h-20 bg-forest/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ShoppingCart className="h-8 w-8 text-forest/20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-forest dark:text-cream truncate">{item.name}</h3>
                                    <div className="text-lg font-bold mt-1">${item.price.toFixed(2)} CAD</div>
                                </div>
                                <div className="flex items-center gap-1" role="group" aria-label={`Quantity for ${item.name}`}>
                                    <button
                                        onClick={() => {
                                            if (item.quantity <= 1) removeItem(item.id);
                                            else updateQuantity(item.id, item.quantity - 1);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-muted border border-border transition-colors"
                                        aria-label={`Decrease quantity of ${item.name}`}
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <select
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                        className="font-mono font-bold text-center w-14 py-1 rounded-lg border border-border bg-transparent text-sm focus:ring-2 focus:ring-forest/30 outline-none"
                                        aria-label={`Quantity of ${item.name}`}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1.5 rounded-lg hover:bg-muted border border-border transition-colors disabled:opacity-30"
                                        disabled={item.quantity >= 10}
                                        aria-label={`Increase quantity of ${item.name}`}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="font-bold text-lg min-w-[80px] text-right" aria-label={`Subtotal: $${(item.price * item.quantity).toFixed(2)}`}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    aria-label={`Remove ${item.name} from cart`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-card rounded-xl border border-border p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-forest dark:text-cream mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                    <span className="font-medium">${total.toFixed(2)}</span>
                                </div>

                                {/* Coupon Discount */}
                                {appliedCoupon?.valid && discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> Discount ({appliedCoupon.code})
                                        </span>
                                        <span className="font-medium text-green-600 dark:text-green-400">-${discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping (Xpresspost)</span>
                                    <span className="font-medium">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">
                                                FREE {hasFreeShipping && <span className="text-[10px]">(coupon)</span>}
                                            </span>
                                        ) : (
                                            `$${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">HST (13%)</span>
                                    <span className="font-medium">${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-lg text-forest dark:text-leaf">${grandTotal.toFixed(2)} CAD</span>
                                </div>
                            </div>

                            {/* Coupon Code Input */}
                            <div className="mb-4">
                                {appliedCoupon?.valid ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="font-medium">{appliedCoupon.code}</span>
                                            <span className="text-xs">applied</span>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-green-800 dark:text-green-400">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                                                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition uppercase"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-4"
                                            >
                                                {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                            </Button>
                                        </div>
                                        {couponError && (
                                            <p className="text-xs text-red-500 mt-1.5 pl-1">{couponError}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {total < 150 && !hasFreeShipping && (
                                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-xs">
                                    Add ${(150 - total).toFixed(2)} more for FREE shipping!
                                </div>
                            )}

                            {/* Age Verification */}
                            <div className="mb-4 p-3 bg-forest/5 rounded-lg text-xs text-muted-foreground">
                                By proceeding, you confirm you are <strong>19 years of age or older</strong> as required by Ontario law.
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                variant="brand"
                                size="lg"
                                className="w-full gap-2 text-base"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" /> Pay ${grandTotal.toFixed(2)} CAD
                                    </>
                                )}
                            </Button>

                            {/* Google Pay — UCP Integration */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white dark:bg-card px-3 text-muted-foreground">or</span>
                                </div>
                            </div>

                            <GooglePayButton
                                totalPrice={grandTotal.toFixed(2)}
                                disabled={loading}
                                onPaymentAuthorized={async (paymentData) => {
                                    console.log("[Google Pay] Payment authorized:", paymentData);
                                    setLoading(true);
                                    setError("");

                                    try {
                                        // Send payment token + cart items to backend for processing
                                        const res = await fetch("/api/sage/checkout", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                items,
                                                paymentMethod: "google_pay",
                                                paymentData, // Google Pay token for Stripe to charge
                                                total: grandTotal,
                                                couponCode: appliedCoupon?.valid ? appliedCoupon.code : undefined,
                                            }),
                                        });

                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data.error || "Google Pay processing failed");

                                        window.location.href = "/checkout/success?method=google_pay";
                                    } catch (e) {
                                        setError(e instanceof Error ? e.message : "Google Pay payment failed");
                                        setLoading(false);
                                    }
                                }}
                                onError={(err) => setError(err.message)}
                            />

                            {/* Trust Signals */}
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Shield className="h-3.5 w-3.5 text-forest" /> Secured by Stripe
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Truck className="h-3.5 w-3.5 text-forest" /> Discreet Canada Post Xpresspost
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
