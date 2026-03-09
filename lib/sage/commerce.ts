/**
 * MedAgent Commerce — UCP-Compatible Commerce Layer
 * ═════════════════════════════════════════════════
 * Server-side cart management, checkout intent generation,
 * and order tracking. Implements Google UCP (Universal Commerce
 * Protocol) actions for agentic commerce.
 *
 * Bridges MedAgent Engine → Stripe checkout + Google Pay.
 */

import { PRODUCTS, type Product } from "@/lib/productData";
import { getOrCreateSession } from "./sessions";

// ─── Types ──────────────────────────────────────────────────

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    slug?: string;
}

export interface MedAgentCart {
    items: CartItem[];
    subtotal: number;
    currency: "CAD";
    itemCount: number;
}

export interface CheckoutIntent {
    type: "stripe" | "google_pay" | "auto";
    cart: MedAgentCart;
    checkoutUrl?: string;
    googlePayRequest?: GooglePayRequest;
}

export interface GooglePayRequest {
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: {
        type: string;
        parameters: {
            allowedAuthMethods: string[];
            allowedCardNetworks: string[];
        };
        tokenizationSpecification: {
            type: string;
            parameters: {
                gateway: string;
                gatewayMerchantId: string;
            };
        };
    }[];
    merchantInfo: {
        merchantName: string;
        merchantId: string;
    };
    transactionInfo: {
        totalPriceStatus: string;
        totalPrice: string;
        currencyCode: string;
        countryCode: string;
    };
}

// ─── Cart Limits ────────────────────────────────────────────

const MAX_QUANTITY_PER_ITEM = 99;
const MAX_CART_ITEMS = 50;

// ─── Server-Side Cart Store (per MedAgent session) ──────────

const sessionCarts = new Map<string, CartItem[]>();

// ─── Cart Management ────────────────────────────────────────

export function getCart(sessionId: string): MedAgentCart {
    const items = sessionCarts.get(sessionId) || [];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        currency: "CAD",
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
}

export function addToCart(
    sessionId: string,
    query: string,
    quantity = 1
): { success: boolean; item?: CartItem; cart: MedAgentCart; message: string } {
    // Find product by name/slug (fuzzy match)
    const product = findProductByQuery(query);

    if (!product) {
        return {
            success: false,
            cart: getCart(sessionId),
            message: `I couldn't find a product matching "${query}". Try browsing our categories or searching for something specific!`,
        };
    }

    // Sanitize quantity
    const safeQuantity = Math.min(Math.max(1, Math.floor(quantity)), MAX_QUANTITY_PER_ITEM);

    const items = sessionCarts.get(sessionId) || [];
    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
        // Cap accumulated quantity per item
        existing.quantity = Math.min(existing.quantity + safeQuantity, MAX_QUANTITY_PER_ITEM);
    } else {
        // Reject if cart already at max unique line items
        if (items.length >= MAX_CART_ITEMS) {
            return {
                success: false,
                cart: getCart(sessionId),
                message: `Your cart is full (${MAX_CART_ITEMS} items max). Please remove something before adding more!`,
            };
        }
        items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: safeQuantity,
            image: product.image,
            slug: product.slug,
        });
    }

    sessionCarts.set(sessionId, items);
    const cart = getCart(sessionId);

    return {
        success: true,
        item: {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.image,
            slug: product.slug,
        },
        cart,
        message: `Added **${product.name}** ($${product.price.toFixed(2)}) to your cart! 🛒 Cart total: **$${cart.subtotal.toFixed(2)}** (${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""})`,
    };
}

export function removeFromCart(
    sessionId: string,
    query: string
): { success: boolean; cart: MedAgentCart; message: string } {
    const items = sessionCarts.get(sessionId) || [];
    const product = findProductByQuery(query);

    if (!product) {
        return {
            success: false,
            cart: getCart(sessionId),
            message: `I couldn't find "${query}" in your cart.`,
        };
    }

    const filtered = items.filter((i) => i.productId !== product.id);
    sessionCarts.set(sessionId, filtered);
    const cart = getCart(sessionId);

    return {
        success: true,
        cart,
        message: `Removed **${product.name}** from your cart. Cart total: **$${cart.subtotal.toFixed(2)}** (${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""})`,
    };
}

export function clearCart(sessionId: string): MedAgentCart {
    sessionCarts.delete(sessionId);
    return getCart(sessionId);
}

// ─── Checkout Intent ────────────────────────────────────────

export function createCheckoutIntent(
    sessionId: string,
    paymentMethod: "stripe" | "google_pay" | "auto" = "auto"
): CheckoutIntent {
    const cart = getCart(sessionId);

    const intent: CheckoutIntent = {
        type: paymentMethod,
        cart,
    };

    // Google Pay payment request (UCP-compatible)
    if (paymentMethod === "google_pay" || paymentMethod === "auto") {
        intent.googlePayRequest = buildGooglePayRequest(cart);
    }

    return intent;
}

// ─── Google Pay Request Builder ─────────────────────────────

function buildGooglePayRequest(cart: MedAgentCart): GooglePayRequest {
    return {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: "CARD",
                parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: ["VISA", "MASTERCARD", "AMEX", "DISCOVER"],
                },
                tokenizationSpecification: {
                    type: "PAYMENT_GATEWAY",
                    parameters: {
                        gateway: "stripe",
                        gatewayMerchantId: process.env.STRIPE_PUBLISHABLE_KEY || "",
                    },
                },
            },
        ],
        merchantInfo: {
            merchantName: "Mohawk Medibles",
            merchantId: process.env.GOOGLE_MERCHANT_ID || "",
        },
        transactionInfo: {
            totalPriceStatus: "FINAL",
            totalPrice: cart.subtotal.toFixed(2),
            currencyCode: "CAD",
            countryCode: "CA",
        },
    };
}

// ─── Product Fuzzy Finder ───────────────────────────────────

function findProductByQuery(query: string): Product | undefined {
    const normalized = query.toLowerCase().trim();

    // 1. Exact slug match
    const bySlug = PRODUCTS.find((p) => p.slug === normalized);
    if (bySlug) return bySlug;

    // 2. Exact name match (case-insensitive)
    const byName = PRODUCTS.find((p) => p.name.toLowerCase() === normalized);
    if (byName) return byName;

    // 3. Starts with match
    const startsWith = PRODUCTS.find((p) => p.name.toLowerCase().startsWith(normalized));
    if (startsWith) return startsWith;

    // 4. Contains match (best fuzzy)
    const contains = PRODUCTS.find((p) => p.name.toLowerCase().includes(normalized));
    if (contains) return contains;

    // 5. Word overlap scoring
    const queryWords = normalized.split(/\s+/);
    let bestMatch: Product | undefined;
    let bestScore = 0;

    for (const p of PRODUCTS) {
        const nameWords = p.name.toLowerCase().split(/\s+/);
        const score = queryWords.filter((w) => nameWords.some((nw) => nw.includes(w))).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = p;
        }
    }

    return bestScore >= 2 ? bestMatch : undefined;
}

// ─── Sync Client Cart → Server Cart ─────────────────────────

/**
 * Sync client-side localStorage cart into the server-side session cart.
 * This allows turbo router's view/remove/checkout commands to operate
 * on the REAL cart items instead of the empty server-side cart.
 */
export function syncClientCart(
    sessionId: string,
    clientItems: { id: string; name: string; price: number; quantity: number }[]
): void {
    const items: CartItem[] = clientItems.map((item) => {
        // Resolve product from catalog for proper integer ID and metadata
        const product = PRODUCTS.find(
            (p) =>
                p.name.toLowerCase() === item.name.toLowerCase() ||
                p.slug === item.id ||
                String(p.id) === item.id
        );
        return {
            productId: product?.id ?? 0,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: product?.image,
            slug: product?.slug ?? item.id,
        };
    });
    sessionCarts.set(sessionId, items);
}

// ─── View Cart Formatted ────────────────────────────────────

export function formatCartForDisplay(sessionId: string): string {
    const cart = getCart(sessionId);

    if (cart.items.length === 0) {
        return "Your cart is empty! Browse our shop or ask me for recommendations. 🛒";
    }

    const itemLines = cart.items
        .map((item, idx) => `${idx + 1}. **${item.name}** × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

    return `🛒 **Your Cart** (${cart.itemCount} item${cart.itemCount !== 1 ? "s" : ""}):\n\n${itemLines}\n\n**Subtotal: $${cart.subtotal.toFixed(2)} CAD**\n\nSay "checkout" when you're ready, or keep browsing!`;
}
