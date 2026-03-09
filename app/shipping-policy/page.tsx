/**
 * Shipping Policy — Mohawk Medibles
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping Policy | Mohawk Medibles",
    description: "Canada-wide shipping via Xpresspost. Discreet packaging, age verification, and tracking.",
};

export default function ShippingPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold text-foreground mb-2">Shipping Policy</h1>
                <p className="text-sm text-muted-foreground mb-10">Fast, discreet, Canada-wide delivery.</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Shipping Methods</h2>
                        <p className="text-muted-foreground">
                            All orders are shipped via <strong>Canada Post Xpresspost</strong> for reliable, tracked delivery across Canada. We also offer local delivery for Hamilton, Brantford, and the Six Nations area.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Delivery Times</h2>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4 my-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b border-green-200 dark:border-green-800/30">
                                        <th className="py-2 text-foreground">Region</th>
                                        <th className="py-2 text-foreground">Estimated Delivery</th>
                                        <th className="py-2 text-foreground">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">Local (Hamilton/Brantford/Six Nations)</td>
                                        <td className="py-2">Same day / Next day</td>
                                        <td className="py-2 font-semibold text-green-600 dark:text-green-400">FREE</td>
                                    </tr>
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">Ontario</td>
                                        <td className="py-2">1-3 business days</td>
                                        <td className="py-2">$15.00</td>
                                    </tr>
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">Quebec / Maritimes</td>
                                        <td className="py-2">2-4 business days</td>
                                        <td className="py-2">$18.00</td>
                                    </tr>
                                    <tr className="border-b border-green-100 dark:border-green-800/20">
                                        <td className="py-2">Western Canada (MB, SK, AB, BC)</td>
                                        <td className="py-2">3-5 business days</td>
                                        <td className="py-2">$20.00</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Northern Canada (Territories)</td>
                                        <td className="py-2">5-10 business days</td>
                                        <td className="py-2">$25.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-muted-foreground">
                            <strong>FREE shipping</strong> on all orders over $150 CAD, Canada-wide.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Discreet Packaging</h2>
                        <p className="text-muted-foreground">
                            All orders are shipped in plain, unbranded packaging with no indication of the contents. Return address shows a generic business name. All products are vacuum-sealed for freshness and odor control.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Order Tracking</h2>
                        <p className="text-muted-foreground">
                            Once your order ships, you&apos;ll receive a shipping confirmation email with a Canada Post tracking number. You can also track your order through your account dashboard or by asking MedAgent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Age Verification</h2>
                        <p className="text-muted-foreground">
                            <strong>You must be 19+ to receive deliveries.</strong> Canada Post may require age verification and a signature upon delivery. Please have valid government-issued photo ID available.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Processing Times</h2>
                        <p className="text-muted-foreground">
                            Orders placed before 2:00 PM ET on business days are typically processed and shipped the same day. Orders placed after 2:00 PM ET or on weekends/holidays will be processed the next business day.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Lost or Damaged Packages</h2>
                        <p className="text-muted-foreground">
                            If your package is lost or arrives damaged, please contact us within 48 hours of expected delivery. We&apos;ll work with Canada Post to locate the package or arrange a replacement. Email <a href="mailto:support@mohawkmedibles.ca" className="text-green-600 dark:text-green-400 underline">support@mohawkmedibles.ca</a> with your order number and photos of any damage.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
