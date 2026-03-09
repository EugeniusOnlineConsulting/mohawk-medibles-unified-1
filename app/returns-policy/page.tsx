/**
 * Returns & Refund Policy — Mohawk Medibles
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Returns & Refund Policy | Mohawk Medibles",
    description: "Mohawk Medibles returns, refunds, and exchange policy for cannabis products.",
};

export default function ReturnsPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-4xl font-bold text-foreground mb-2">Returns & Refund Policy</h1>
                <p className="text-sm text-muted-foreground mb-10">Your satisfaction is important to us.</p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Eligibility</h2>
                        <p className="text-muted-foreground">
                            Due to the nature of cannabis products and health regulations, we have specific return guidelines:
                        </p>
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl p-4 my-4">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Returns Accepted For:</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                <li>Damaged products (arrived broken, crushed, or compromised)</li>
                                <li>Incorrect items (we shipped the wrong product)</li>
                                <li>Missing items from your order</li>
                                <li>Products that don&apos;t match description (significantly different THC/CBD than listed)</li>
                            </ul>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 my-4">
                            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Returns NOT Accepted For:</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                <li>Change of mind or buyer&apos;s remorse</li>
                                <li>Products that have been opened, used, or consumed</li>
                                <li>Products where the seal has been broken</li>
                                <li>Subjective dissatisfaction with effects or taste</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">How to Request a Return</h2>
                        <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                            <li><strong>Contact us within 48 hours</strong> of receiving your order at <a href="mailto:returns@mohawkmedibles.ca" className="text-green-600 dark:text-green-400 underline">returns@mohawkmedibles.ca</a></li>
                            <li>Include your <strong>order number</strong> and <strong>clear photos</strong> of the issue</li>
                            <li>Our team will review your request within 24 hours</li>
                            <li>If approved, we&apos;ll provide instructions for the return or arrange a replacement</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Refund Process</h2>
                        <p className="text-muted-foreground">
                            Approved refunds are processed back to your original payment method within 5-10 business days. You&apos;ll receive an email confirmation when the refund has been initiated.
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
                            <li><strong>Full refund:</strong> Wrong item shipped, damaged in transit</li>
                            <li><strong>Partial refund:</strong> Missing items from order (refund for missing items only)</li>
                            <li><strong>Store credit:</strong> Available as an alternative for any eligible return</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Exchanges</h2>
                        <p className="text-muted-foreground">
                            We offer exchanges for damaged or incorrect products. If the item you want is available, we&apos;ll ship the replacement at no additional cost. If the item is out of stock, a full refund will be issued.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Shipping for Returns</h2>
                        <p className="text-muted-foreground">
                            If the return is due to our error (wrong item, damage), we cover the return shipping cost. For other eligible returns, the customer is responsible for return shipping. We&apos;ll provide a shipping label and instructions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                        <p className="text-muted-foreground">
                            Email: <a href="mailto:returns@mohawkmedibles.ca" className="text-green-600 dark:text-green-400 underline">returns@mohawkmedibles.ca</a><br />
                            You can also ask MedAgent for return assistance through our chat widget.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
