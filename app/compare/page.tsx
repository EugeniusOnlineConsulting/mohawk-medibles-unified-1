import type { Metadata } from "next";
import { Suspense } from "react";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
    title: "Compare Products | Side-by-Side Cannabis Comparison",
    description:
        "Compare cannabis products side by side at Mohawk Medibles. View prices, THC%, CBD%, strain type, terpenes, and availability in one place.",
    alternates: {
        canonical: "https://mohawkmedibles.ca/compare",
    },
};

export default function ComparePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                </div>
            }
        >
            <CompareClient />
        </Suspense>
    );
}
