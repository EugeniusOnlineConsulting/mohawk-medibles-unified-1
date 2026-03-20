"use client";

/**
 * SmokeEffect — Pure CSS smoke/haze overlay for the hero section.
 * Renders 4 translucent layers that drift organically across the viewport.
 * Zero JS animation logic, zero npm deps, zero canvas — all CSS keyframes.
 * Hidden on mobile for Core Web Vitals. Respects prefers-reduced-motion.
 */
export function SmokeEffect() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-[15] pointer-events-none overflow-hidden smoke-container"
    >
      {/* Layer 1 — Large slow drift from left */}
      <div className="smoke-layer smoke-layer-1" />

      {/* Layer 2 — Medium drift from right, offset timing */}
      <div className="smoke-layer smoke-layer-2" />

      {/* Layer 3 — Small rising wisps, lime-tinted */}
      <div className="smoke-layer smoke-layer-3" />

      {/* Layer 4 — Wide low haze that crawls across bottom */}
      <div className="smoke-layer smoke-layer-4" />
    </div>
  );
}
