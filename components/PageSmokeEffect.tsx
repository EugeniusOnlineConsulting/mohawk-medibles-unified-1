"use client";

/**
 * PageSmokeEffect — Ambient page-level smoke/haze that drifts behind content.
 * Lighter than HeroCarousel's SmokeEffect. Fixed position, covers full viewport.
 * Hidden on mobile. Respects prefers-reduced-motion.
 */
export function PageSmokeEffect() {
    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden page-smoke-container"
        >
            {/* Slow drifting haze — top-left */}
            <div className="page-smoke page-smoke-1" />
            {/* Lime-tinted wisp — center-right */}
            <div className="page-smoke page-smoke-2" />
            {/* Bottom crawling mist */}
            <div className="page-smoke page-smoke-3" />
        </div>
    );
}
