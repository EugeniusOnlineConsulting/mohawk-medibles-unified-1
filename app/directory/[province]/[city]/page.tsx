import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Cannabis Directory | Mohawk Medibles",
    description: "Find cannabis dispensaries across Canada. Coming soon.",
};

export default function CityPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-4xl font-bold mb-4">Cannabis Directory</h1>
                    <p className="text-xl text-emerald-100">
                        Our dispensary directory is coming soon. In the meantime, shop our full catalog.
                    </p>
                </div>
            </section>
            <section className="py-12 text-center">
                <Link
                    href="/shop"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                    Browse Shop
                </Link>
            </section>
        </div>
    );
}
