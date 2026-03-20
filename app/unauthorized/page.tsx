import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
    title: "Access Denied | Mohawk Medibles",
    description: "You do not have permission to access this page.",
    robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
    return (
        <main className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-foreground mb-3">Access Denied</h1>
                <p className="text-muted-foreground mb-8">
                    You don&apos;t have permission to access this page. If you believe this is an error, please contact us.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-forest dark:bg-lime text-white dark:text-charcoal font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                    Return Home
                </Link>
            </div>
        </main>
    );
}
