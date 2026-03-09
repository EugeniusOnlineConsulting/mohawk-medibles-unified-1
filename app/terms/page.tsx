/**
 * Terms of Service — Mohawk Medibles
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Mohawk Medibles",
    description: "Terms and conditions for using Mohawk Medibles online cannabis dispensary.",
};

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using mohawkmedibles.ca, you agree to these Terms of Service. If you do not agree, please do not use our website or services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">2. Age Requirement</h2>
                        <p className="text-muted-foreground">
                            <strong>You must be 19 years of age or older</strong> to browse, purchase, or interact with any products on this website. By using our services, you confirm that you meet this age requirement. We reserve the right to request age verification at any time, including upon delivery.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">3. Indigenous Sovereignty</h2>
                        <p className="text-muted-foreground">
                            Mohawk Medibles operates under the inherent sovereignty of the Haudenosaunee Confederacy and the Mohawk Nation on the territory of Six Nations of the Grand River. Our operations are governed by Indigenous rights and self-determination principles.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">4. Products & Quality</h2>
                        <p className="text-muted-foreground">
                            All products sold through Mohawk Medibles meet our Empire Standard™ quality benchmarks. Product descriptions, images, and specifications are provided as accurately as possible. Actual THC/CBD percentages may vary slightly between batches.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">5. Orders & Payment</h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>All prices are in Canadian Dollars (CAD) unless otherwise stated</li>
                            <li>HST (13%) applies to all orders shipped within Ontario</li>
                            <li>Payments are processed securely through Stripe</li>
                            <li>We reserve the right to cancel or refuse any order</li>
                            <li>Order confirmation does not constitute acceptance until the order has shipped</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">6. Shipping</h2>
                        <p className="text-muted-foreground">
                            Orders are shipped Canada-wide via Canada Post Xpresspost in discreet packaging. Estimated delivery is 2-5 business days. Age verification (19+) may be required at the time of delivery. See our <a href="/shipping-policy" className="text-green-600 dark:text-green-400 underline">Shipping Policy</a> for full details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">7. Returns & Refunds</h2>
                        <p className="text-muted-foreground">
                            Due to the nature of cannabis products, returns are only accepted for damaged, defective, or incorrectly shipped items. See our <a href="/returns-policy" className="text-green-600 dark:text-green-400 underline">Returns Policy</a> for full details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">8. Account Responsibility</h2>
                        <p className="text-muted-foreground">
                            You are responsible for maintaining the security of your account credentials. Notify us immediately if you suspect unauthorized access to your account. You are responsible for all activity under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">9. MedAgent AI Assistant</h2>
                        <p className="text-muted-foreground">
                            Our AI-powered MedAgent assistant provides product information, order tracking, and general support. MedAgent responses are informational only and do not constitute medical advice. Always consult a healthcare professional regarding cannabis use and health concerns.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            Mohawk Medibles provides products and services &quot;as is.&quot; We are not liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific product in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
                        <p className="text-muted-foreground">
                            For questions about these terms, contact us at <a href="mailto:legal@mohawkmedibles.ca" className="text-green-600 dark:text-green-400 underline">legal@mohawkmedibles.ca</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
