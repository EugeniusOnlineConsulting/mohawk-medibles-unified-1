import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, Package, Truck, Bitcoin, Wallet } from "lucide-react";

export default function HowToOrderPage() {
    return (
        <div className="min-h-screen pt-32 pb-20 bg-forest text-cream">
            <div className="container mx-auto px-6 max-w-4xl space-y-20">
                {/* Header / H1 */}
                <section className="text-center space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase">
                        How to Order
                    </h1>
                    <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
                        Ordering cannabis from Mohawk Medibles is simple, secure, and fast. Follow our easy 3-step process to get premium, lab-tested products delivered to your door.
                    </p>
                </section>

                {/* 3 Step Cards */}
                <section className="space-y-8">
                    {/* Step 01 */}
                    <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                        <div className="text-6xl font-bold text-secondary/20">01</div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-white">Browse & Select</h2>
                            <p className="text-cream/70">
                                Visit our shop and explore our extensive collection of products. Use our smart filters to search by category, potency, product type, or price. Choose from 363+ lab-tested cannabis products including flower, edibles, concentrates, vapes, hash, CBD, mushrooms, and accessories.
                            </p>
                            <ul className="space-y-2 text-cream/70 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Browse by category: Flower, Edibles, Concentrates, Vapes, Hash, CBD, and more</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Filter by THC/CBD content, price, brand, and customer ratings</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Read detailed product descriptions and lab test results</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Check customer reviews and terpene profiles</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 02 */}
                    <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                        <div className="text-6xl font-bold text-secondary/20">02</div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-white">Add to Cart & Checkout</h2>
                            <p className="text-cream/70">
                                Add your selected items to your cart and proceed to secure checkout. We offer multiple safe and convenient payment methods to suit your preferences.
                            </p>
                            <ul className="space-y-2 text-cream/70 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Visa and Mastercard (processed securely via Stripe)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Interac e-Transfer (Canadian bank accounts)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Cryptocurrency (Bitcoin and Ethereum)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>All transactions are encrypted and PCI-DSS compliant</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 03 */}
                    <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                        <div className="text-6xl font-bold text-secondary/20">03</div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-white">Fast Delivery</h2>
                            <p className="text-cream/70">
                                Your order is processed quickly and shipped via Canada Post Xpresspost. Track your package in real-time and receive it at your door with discreet packaging.
                            </p>
                            <ul className="space-y-2 text-cream/70 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Same-day processing for orders placed before 2:00 PM EST</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Shipped via Canada Post Xpresspost for reliable, traceable delivery</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Tracking number emailed immediately upon shipment</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-secondary mt-1">•</span>
                                    <span>Plain, unmarked packaging with no indication of contents</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Payment Methods Section */}
                <section className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Payment Methods</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Interac e-Transfer */}
                            <div className="glass p-6 rounded-xl border border-white/5 text-center space-y-3">
                                <Wallet className="h-10 w-10 text-secondary mx-auto" />
                                <h3 className="font-bold text-white">Interac e-Transfer</h3>
                                <p className="text-sm text-cream/70">
                                    Fast, secure Canadian bank transfers. Instant confirmation.
                                </p>
                            </div>

                            {/* Visa / Mastercard */}
                            <div className="glass p-6 rounded-xl border border-white/5 text-center space-y-3">
                                <CreditCard className="h-10 w-10 text-secondary mx-auto" />
                                <h3 className="font-bold text-white">Visa & Mastercard</h3>
                                <p className="text-sm text-cream/70">
                                    Secure credit card payments via Stripe (PCI-DSS Level 1).
                                </p>
                            </div>

                            {/* Cryptocurrency */}
                            <div className="glass p-6 rounded-xl border border-white/5 text-center space-y-3">
                                <Bitcoin className="h-10 w-10 text-secondary mx-auto" />
                                <h3 className="font-bold text-white">Cryptocurrency</h3>
                                <p className="text-sm text-cream/70">
                                    Bitcoin and Ethereum for decentralized payments.
                                </p>
                            </div>

                            {/* Cash (Local Pickup) */}
                            <div className="glass p-6 rounded-xl border border-white/5 text-center space-y-3">
                                <Package className="h-10 w-10 text-secondary mx-auto" />
                                <h3 className="font-bold text-white">Cash (Local Pickup)</h3>
                                <p className="text-sm text-cream/70">
                                    Pay cash for local pickup in Hamilton, Brantford, or Six Nations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shipping Information Section */}
                <section className="space-y-6 glass p-8 rounded-2xl border border-white/10">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Truck className="h-8 w-8 text-secondary" />
                        Shipping Information
                    </h2>

                    <div className="space-y-4 text-cream/70">
                        <div>
                            <h3 className="font-bold text-white mb-2">Free Shipping</h3>
                            <p>Orders over $150 CAD ship FREE Canada-wide via Canada Post Xpresspost.</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-2">Shipping Method</h3>
                            <p>All orders ship via Canada Post Xpresspost for reliable, insured delivery across Canada.</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-2">Delivery Times</h3>
                            <ul className="space-y-1 text-sm ml-4">
                                <li>• Ontario: 1-3 business days</li>
                                <li>• Quebec & Atlantic Provinces: 2-4 business days</li>
                                <li>• Western Provinces: 3-5 business days</li>
                                <li>• Northern Territories: 5-10 business days</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-2">Discreet Packaging</h3>
                            <p>All orders are shipped in plain, unmarked boxes with no indication of contents. Products are vacuum-sealed for freshness and odour control.</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-2">Order Tracking</h3>
                            <p>You'll receive a full Canada Post tracking number via email immediately upon shipment. Track your package in real-time online or in your account dashboard.</p>
                        </div>
                    </div>
                </section>

                {/* Need Help Section */}
                <section className="glass p-8 rounded-2xl border border-white/10 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-white">Need Help?</h2>
                    <p className="text-cream/70 max-w-2xl mx-auto">
                        Have questions about ordering, shipping, or products? Check out our comprehensive FAQ or contact our support team.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/faq">
                            <Button variant="outline" className="w-full sm:w-auto">
                                View FAQ
                            </Button>
                        </Link>
                        <Link href="/support">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Contact Support
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-white">Ready to Order?</h2>
                    <p className="text-cream/70 text-lg">
                        Browse 363+ lab-tested cannabis products and start shopping now.
                    </p>
                    <Link href="/shop">
                        <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-forest font-bold px-8">
                            Start Shopping
                        </Button>
                    </Link>
                </section>
            </div>
        </div>
    );
}
