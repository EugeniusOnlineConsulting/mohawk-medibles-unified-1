import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto px-6">
                <div className="text-8xl font-black text-forest/20 dark:text-cream/20">404</div>
                <h1 className="text-3xl font-bold text-forest dark:text-cream">Page Not Found</h1>
                <p className="text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-forest text-white rounded-lg font-medium hover:bg-forest/90 transition-colors"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/shop"
                        className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                        Browse Shop
                    </Link>
                </div>
            </div>
        </div>
    );
}
