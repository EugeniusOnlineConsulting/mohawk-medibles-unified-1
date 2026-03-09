/**
 * Privacy Policy — Mohawk Medibles
 * Required legal page for cannabis dispensary operations.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Mohawk Medibles",
    description: "How Mohawk Medibles collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-10">Last updated: February 2026</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">1. Who We Are</h2>
                        <p className="text-muted-foreground">
                            Mohawk Medibles is an Indigenous-owned cannabis dispensary operating from Six Nations of the Grand River Territory, Ontario, Canada. This policy explains how we handle your personal data when you use our website, place orders, or interact with our services including our AI-powered MedAgent assistant.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
                        <p className="text-muted-foreground"><strong>Information you provide:</strong></p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>Name, email, phone number (during registration or checkout)</li>
                            <li>Shipping and billing addresses</li>
                            <li>Order history and preferences</li>
                            <li>Support ticket messages and chat conversations with MedAgent</li>
                            <li>Age verification acknowledgment (19+)</li>
                        </ul>
                        <p className="text-muted-foreground mt-3"><strong>Information collected automatically:</strong></p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>Device type, browser, and operating system</li>
                            <li>IP address (used for fraud prevention and age compliance)</li>
                            <li>Pages visited and interactions on our site</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>To process and fulfill your orders via Canada Post Xpresspost</li>
                            <li>To send order confirmations, shipping notifications, and delivery updates</li>
                            <li>To provide customer support through our MedAgent AI and human agents</li>
                            <li>To improve our products, services, and website experience</li>
                            <li>To comply with legal and regulatory requirements</li>
                            <li>To prevent fraud and verify age eligibility (19+)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">4. Payment Security</h2>
                        <p className="text-muted-foreground">
                            All payment processing is handled securely through Stripe. We never store your full credit card number, CVV, or banking details on our servers. Payment data is encrypted in transit using TLS and at rest within Stripe&apos;s PCI-DSS Level 1 compliant infrastructure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">5. Data Sharing</h2>
                        <p className="text-muted-foreground">We share data only with:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li><strong>Stripe</strong> — for payment processing</li>
                            <li><strong>ShipStation / Canada Post</strong> — for order fulfillment and shipping</li>
                            <li><strong>Resend</strong> — for transactional emails (order confirmations, shipping updates)</li>
                            <li><strong>Law enforcement</strong> — only when required by law</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">We do not sell, rent, or trade your personal information to any third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
                        <p className="text-muted-foreground">You have the right to:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                            <li>Access your personal data we hold</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of your account and data</li>
                            <li>Opt out of marketing communications</li>
                            <li>Request a copy of your data in a portable format</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">To exercise any of these rights, email us at <a href="mailto:privacy@mohawkmedibles.ca" className="text-green-600 dark:text-green-400 underline">privacy@mohawkmedibles.ca</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
                        <p className="text-muted-foreground">
                            We use essential cookies for authentication, cart functionality, and site security. Optional analytics cookies may be used to understand site usage. You can control cookies through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
                        <p className="text-muted-foreground">
                            We retain order records for 7 years for tax and regulatory compliance. Account data is retained until you request deletion. Chat and support logs are retained for 2 years.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
                        <p className="text-muted-foreground">
                            For privacy inquiries, contact us at <a href="mailto:privacy@mohawkmedibles.ca" className="text-green-600 dark:text-green-400 underline">privacy@mohawkmedibles.ca</a> or by mail at: Mohawk Medibles, Six Nations of the Grand River, Ontario, Canada.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
