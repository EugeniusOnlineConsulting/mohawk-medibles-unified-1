"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelledPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 max-w-md mx-auto px-6"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <XCircle className="h-24 w-24 text-amber-500 mx-auto" />
                </motion.div>

                <h1 className="text-3xl font-bold text-forest dark:text-cream">Checkout Cancelled</h1>

                <p className="text-muted-foreground">
                    No worries — your cart is still saved. You can return to checkout whenever you&apos;re ready.
                </p>

                <div className="p-4 bg-forest/5 rounded-xl text-sm text-muted-foreground">
                    <p>No payment was processed. Your card has not been charged.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link href="/checkout">
                        <Button variant="brand" className="gap-2 w-full sm:w-auto">
                            <ShoppingCart className="h-4 w-4" /> Return to Checkout
                        </Button>
                    </Link>
                    <Link href="/shop">
                        <Button variant="outline" className="gap-2 w-full sm:w-auto">
                            <ArrowLeft className="h-4 w-4" /> Continue Shopping
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
