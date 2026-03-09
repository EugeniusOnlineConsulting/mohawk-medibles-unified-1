"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[Error Boundary]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto px-6">
                <div className="text-6xl">⚠️</div>
                <h1 className="text-3xl font-bold text-forest dark:text-cream">Something Went Wrong</h1>
                <p className="text-muted-foreground">
                    An unexpected error occurred. Please try again or contact support if the problem persists.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex gap-4 justify-center pt-4">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-forest text-white rounded-lg font-medium hover:bg-forest/90 transition-colors"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
