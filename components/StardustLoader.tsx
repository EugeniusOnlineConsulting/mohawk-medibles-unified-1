"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StardustLoader — Space stardust particles converge to form the Mohawk Medibles leaf logo.
 *
 * Phase 1 (0-1.8s):   Particles drift randomly like stardust in space
 * Phase 2 (1.8-3.8s): Particles converge toward logo pixel positions
 * Phase 3 (3.5-4.5s): Logo image fades in over formed particle shape
 * Phase 4 (4.5-5.2s): Whole screen fades out, site revealed
 *
 * Uses canvas for performance (800+ particles at 60fps).
 * Samples logo PNG pixel data — targets GREEN pixels from the leaf artwork.
 */

const LOGO_SRC = "/assets/logos/medibles-logo2.png";
const PARTICLE_COUNT = 800;
const LOGO_CANVAS_SIZE = 250; // Match actual logo dimensions

// Lime/green/gold palette matching brand
const PARTICLE_COLORS = [
  [200, 230, 62],   // lime
  [160, 200, 48],   // darker lime
  [76, 175, 80],    // forest green
  [139, 195, 74],   // light green
  [255, 215, 0],    // gold sparkle
  [255, 255, 255],  // white star
  [124, 179, 66],   // olive green
  [100, 221, 23],   // bright green
];

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  size: number;
  color: number[];
  alpha: number;
  wobbleAmpX: number;
  wobbleAmpY: number;
  wobbleFreq: number;
  twinkleSpeed: number;
  phase: number;
  trail: { x: number; y: number; alpha: number }[];
}

export default function StardustLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDone, setIsDone] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Sample logo pixels — specifically target the GREEN leaf artwork
  const sampleLogoPixels = useCallback(
    (img: HTMLImageElement, centerX: number, centerY: number) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = LOGO_CANVAS_SIZE;
      offscreen.height = LOGO_CANVAS_SIZE;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return [];

      // Draw logo centered
      const scale = Math.min(
        LOGO_CANVAS_SIZE / img.naturalWidth,
        LOGO_CANVAS_SIZE / img.naturalHeight
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const ox = (LOGO_CANVAS_SIZE - w) / 2;
      const oy = (LOGO_CANVAS_SIZE - h) / 2;
      ctx.drawImage(img, ox, oy, w, h);

      const imageData = ctx.getImageData(0, 0, LOGO_CANVAS_SIZE, LOGO_CANVAS_SIZE);
      const pixels = imageData.data;
      const targets: { x: number; y: number }[] = [];

      // Sample every 2nd pixel for high density
      for (let y = 0; y < LOGO_CANVAS_SIZE; y += 2) {
        for (let x = 0; x < LOGO_CANVAS_SIZE; x += 2) {
          const i = (y * LOGO_CANVAS_SIZE + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a < 80) continue; // Skip transparent

          // Target the GREEN leaf pixels (high green, not white/gray)
          const isGreen = g > 60 && g > r * 0.8 && a > 100;
          // Also target dark outlines (black/dark strokes of the leaf)
          const isDark = r < 80 && g < 80 && b < 80 && a > 150;
          // Also target the circle outline
          const isOutline = a > 200 && r < 120 && g < 120 && b < 120;

          if (isGreen || isDark || isOutline) {
            targets.push({
              x: centerX - LOGO_CANVAS_SIZE / 2 + x,
              y: centerY - LOGO_CANVAS_SIZE / 2 + y,
            });
          }
        }
      }

      return targets;
    },
    []
  );

  useEffect(() => {
    // Only show once per session
    if (typeof window !== "undefined" && sessionStorage.getItem("mm-loader-shown")) {
      setIsDone(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Load logo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = LOGO_SRC;

    img.onload = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 - 30;

      const targets = sampleLogoPixels(img, cx, cy);

      // Create particles scattered across the screen
      const particles: Particle[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(canvas.width, canvas.height) * 0.7;
        const originX = cx + Math.cos(angle) * dist;
        const originY = cy + Math.sin(angle) * dist;

        const target =
          targets.length > 0
            ? targets[i % targets.length]
            : { x: cx, y: cy };

        particles.push({
          x: originX,
          y: originY,
          targetX: target.x,
          targetY: target.y,
          originX,
          originY,
          size: Math.random() * 2.2 + 0.4,
          color:
            PARTICLE_COLORS[
              Math.floor(Math.random() * PARTICLE_COLORS.length)
            ],
          alpha: Math.random() * 0.7 + 0.3,
          wobbleAmpX: (Math.random() - 0.5) * 3,
          wobbleAmpY: (Math.random() - 0.5) * 3,
          wobbleFreq: Math.random() * 2 + 0.5,
          twinkleSpeed: Math.random() * 4 + 1,
          phase: Math.random() * Math.PI * 2,
          trail: [],
        });
      }

      startTimeRef.current = performance.now();

      // ─── Animation Loop ─────────────────────────────
      const animate = (time: number) => {
        const elapsed = (time - startTimeRef.current) / 1000;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ── Space background ──
        // Deep space gradient
        const grad = ctx.createRadialGradient(
          cx, cy, 0,
          cx, cy, Math.max(canvas.width, canvas.height) * 0.7
        );
        grad.addColorStop(0, "rgba(15, 35, 10, 0.2)");
        grad.addColorStop(0.4, "rgba(5, 15, 5, 0.1)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ── Phase timing ──
        const driftEnd = 1.8;
        const convergeEnd = 3.8;
        const logoFadeStart = 3.5;
        const totalDuration = 5.2;

        // Convergence progress with smooth easing
        let t = 0;
        if (elapsed > driftEnd && elapsed <= convergeEnd) {
          t = (elapsed - driftEnd) / (convergeEnd - driftEnd);
          // Smooth step (Hermite interpolation)
          t = t * t * (3 - 2 * t);
        } else if (elapsed > convergeEnd) {
          t = 1;
        }

        // ── Draw particles ──
        for (const p of particles) {
          const twinkle =
            0.4 + 0.6 * Math.sin(elapsed * p.twinkleSpeed + p.phase);

          // Wobble during drift, dampened during convergence
          const wobDamp = 1 - t;
          const wobX =
            Math.sin(elapsed * p.wobbleFreq + p.phase) *
            p.wobbleAmpX *
            wobDamp;
          const wobY =
            Math.cos(elapsed * p.wobbleFreq * 1.3 + p.phase) *
            p.wobbleAmpY *
            wobDamp;

          // Slow drift during phase 1
          if (elapsed < driftEnd) {
            p.originX += Math.sin(elapsed * 0.5 + p.phase) * 0.15;
            p.originY += Math.cos(elapsed * 0.3 + p.phase) * 0.12;
          }

          // Lerp position
          const prevX = p.x;
          const prevY = p.y;
          p.x = p.originX + (p.targetX - p.originX) * t + wobX;
          p.y = p.originY + (p.targetY - p.originY) * t + wobY;

          // Trail (only during convergence movement)
          if (t > 0.05 && t < 0.95) {
            p.trail.push({ x: prevX, y: prevY, alpha: 0.3 });
            if (p.trail.length > 6) p.trail.shift();
          } else {
            p.trail.length = 0;
          }

          // Draw trail
          for (let ti = 0; ti < p.trail.length; ti++) {
            const tp = p.trail[ti];
            tp.alpha *= 0.85;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${tp.alpha * 0.3})`;
            ctx.fill();
          }

          // Dynamic size
          const sz = p.size * (1 + wobDamp * twinkle * 0.4);
          const alpha = p.alpha * (t > 0.7 ? 1 : 0.3 + twinkle * 0.7);

          // Glow halo
          if (sz > 1) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha * 0.08})`;
            ctx.fill();
          }

          // Core particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
          ctx.fill();
        }

        // ── Constellation lines during convergence ──
        if (t > 0.4 && t < 1) {
          const lineAlpha = 0.03 * Math.min(1, (t - 0.4) * 3);
          ctx.strokeStyle = `rgba(200, 230, 62, ${lineAlpha})`;
          ctx.lineWidth = 0.4;
          for (let i = 0; i < particles.length; i += 6) {
            for (
              let j = i + 1;
              j < Math.min(i + 8, particles.length);
              j += 2
            ) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              if (dx * dx + dy * dy < 625) {
                // 25px radius
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }

        // ── Logo reveal trigger ──
        if (elapsed > logoFadeStart && !showLogo) {
          setShowLogo(true);
        }

        // ── End ──
        if (elapsed < totalDuration) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          sessionStorage.setItem("mm-loader-shown", "1");
          setIsDone(true);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    };

    // Fallback if logo fails
    img.onerror = () => {
      setTimeout(() => {
        sessionStorage.setItem("mm-loader-shown", "1");
        setIsDone(true);
      }, 1500);
    };

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [sampleLogoPixels, showLogo]);

  if (isDone && !canvasRef.current) return null;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="stardust-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at center, #0a1a08 0%, #050a04 40%, #000000 100%)",
          }}
          aria-label="Loading Mohawk Medibles"
          role="progressbar"
        >
          {/* Starfield canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

          {/* Logo fade-in over the formed particle shape */}
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center gap-5"
              >
                {/* Logo with glow */}
                <div className="relative">
                  {/* Glow behind logo */}
                  <div
                    className="absolute inset-0 blur-[40px] opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(200,230,62,0.4) 0%, transparent 70%)",
                      transform: "scale(1.5)",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={LOGO_SRC}
                    alt="Mohawk Medibles"
                    width={200}
                    height={200}
                    className="relative drop-shadow-[0_0_20px_rgba(200,230,62,0.5)]"
                  />
                </div>

                {/* Territory text */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-lime/70 text-[11px] font-semibold tracking-[0.35em] uppercase font-display"
                >
                  Tyendinaga Mohawk Territory
                </motion.p>

                {/* Loading pulse dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-1.5"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-lime/50 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ambient corner glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-lime/4 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-900/8 rounded-full blur-[120px] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
