"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
    type: "trail" | "puff" | "fill";
    hue: number;
}

interface SmokeCursorProps {
    className?: string;
    maxTrailParticles?: number;
    puffCount?: number;
    enabled?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────
const LEAF_LENGTH = 24;
const LEAF_WIDTH = 10;
const TRAIL_EMIT_INTERVAL = 25;
const PARTICLE_FADE_SPEED = 0.01;
const PUFF_FADE_SPEED = 0.018;
const FILL_FADE_SPEED = 0.004;

// Green palette for particles
const GREENS = [
    "100, 180, 60",   // bright leaf
    "60, 140, 40",    // forest
    "130, 200, 80",   // lime
    "45, 120, 30",    // deep green
    "80, 160, 50",    // medium green
];

// ─── Component ─────────────────────────────────────────────────
export default function SmokeCursor({
    className = "",
    maxTrailParticles = 100,
    puffCount = 30,
    enabled = true,
}: SmokeCursorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: -100, y: -100, prevX: -100, prevY: -100 });
    const lastEmit = useRef(0);
    const animFrame = useRef(0);
    const isActive = useRef(false);
    const clickCount = useRef(0);
    const fillOpacity = useRef(0);

    // ── Draw the green leaf cursor ──────────────────────────────
    const drawLeaf = useCallback(
        (ctx: CanvasRenderingContext2D, x: number, y: number) => {
            const dx = x - mouse.current.prevX;
            const dy = y - mouse.current.prevY;
            const angle = Math.atan2(dy, dx) + Math.PI;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // ── Leaf body ────────────────────────────────────
            ctx.beginPath();
            ctx.moveTo(0, 0);
            // Top curve
            ctx.bezierCurveTo(
                LEAF_LENGTH * 0.3, -LEAF_WIDTH * 0.6,
                LEAF_LENGTH * 0.7, -LEAF_WIDTH * 0.5,
                LEAF_LENGTH, 0
            );
            // Bottom curve
            ctx.bezierCurveTo(
                LEAF_LENGTH * 0.7, LEAF_WIDTH * 0.5,
                LEAF_LENGTH * 0.3, LEAF_WIDTH * 0.6,
                0, 0
            );
            ctx.closePath();

            // Gradient fill
            const leafGrad = ctx.createLinearGradient(0, 0, LEAF_LENGTH, 0);
            leafGrad.addColorStop(0, "rgba(45, 80, 22, 0.95)");   // dark base
            leafGrad.addColorStop(0.3, "rgba(60, 140, 40, 0.9)"); // mid green
            leafGrad.addColorStop(0.7, "rgba(80, 170, 50, 0.85)"); // bright
            leafGrad.addColorStop(1, "rgba(100, 200, 60, 0.8)");  // tip
            ctx.fillStyle = leafGrad;
            ctx.fill();

            // Leaf outline
            ctx.strokeStyle = "rgba(30, 70, 15, 0.5)";
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // ── Center vein ──────────────────────────────────
            ctx.beginPath();
            ctx.moveTo(2, 0);
            ctx.lineTo(LEAF_LENGTH - 2, 0);
            ctx.strokeStyle = "rgba(30, 80, 15, 0.4)";
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // ── Side veins ───────────────────────────────────
            ctx.strokeStyle = "rgba(30, 80, 15, 0.25)";
            ctx.lineWidth = 0.4;
            for (let i = 0; i < 4; i++) {
                const startX = LEAF_LENGTH * (0.2 + i * 0.18);
                const veinLen = LEAF_WIDTH * (0.35 - i * 0.04);
                // Top veins
                ctx.beginPath();
                ctx.moveTo(startX, 0);
                ctx.quadraticCurveTo(startX + 3, -veinLen * 0.6, startX + 5, -veinLen);
                ctx.stroke();
                // Bottom veins
                ctx.beginPath();
                ctx.moveTo(startX, 0);
                ctx.quadraticCurveTo(startX + 3, veinLen * 0.6, startX + 5, veinLen);
                ctx.stroke();
            }

            // ── Glow at the tip ──────────────────────────────
            const tipGlow = ctx.createRadialGradient(
                LEAF_LENGTH, 0, 0,
                LEAF_LENGTH, 0, 8
            );
            tipGlow.addColorStop(0, "rgba(120, 220, 60, 0.5)");
            tipGlow.addColorStop(0.5, "rgba(80, 180, 40, 0.2)");
            tipGlow.addColorStop(1, "rgba(80, 180, 40, 0)");
            ctx.beginPath();
            ctx.arc(LEAF_LENGTH, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = tipGlow;
            ctx.fill();

            ctx.restore();
        },
        []
    );

    // ── Create a trail smoke particle ──────────────────────────
    const emitTrail = useCallback(
        (x: number, y: number) => {
            if (particles.current.filter(p => p.type === "trail").length >= maxTrailParticles) return;

            const angle = Math.random() * Math.PI * 2;
            const speed = 0.2 + Math.random() * 0.4;
            const life = 70 + Math.random() * 50;
            const green = GREENS[Math.floor(Math.random() * GREENS.length)];

            particles.current.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: Math.cos(angle) * speed * 0.4,
                vy: -0.3 - Math.random() * 0.5,
                life,
                maxLife: life,
                size: 3 + Math.random() * 6,
                opacity: 0.2 + Math.random() * 0.15,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                type: "trail",
                hue: 0, // unused — color set via green string
            });
        },
        [maxTrailParticles]
    );

    // ── Create puff particles on click ─────────────────────────
    const emitPuff = useCallback(
        (x: number, y: number) => {
            clickCount.current += 1;

            // Puff burst
            for (let i = 0; i < puffCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 3.5;
                const life = 50 + Math.random() * 60;

                particles.current.push({
                    x: x + (Math.random() - 0.5) * 12,
                    y: y + (Math.random() - 0.5) * 12,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.8,
                    life,
                    maxLife: life,
                    size: 8 + Math.random() * 18,
                    opacity: 0.35 + Math.random() * 0.3,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.04,
                    type: "puff",
                    hue: 100 + Math.random() * 40, // green hue range
                });
            }

            // Fill effect — large expanding green circles that fill the screen
            // More clicks = more fill particles, heavier opacity
            const fillCount = Math.min(clickCount.current, 8);
            for (let i = 0; i < fillCount; i++) {
                const spreadX = x + (Math.random() - 0.5) * 200;
                const spreadY = y + (Math.random() - 0.5) * 200;
                const life = 150 + Math.random() * 200;

                particles.current.push({
                    x: spreadX,
                    y: spreadY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life,
                    maxLife: life,
                    size: 40 + Math.random() * 80,
                    opacity: 0.08 + Math.min(clickCount.current * 0.015, 0.25),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.01,
                    type: "fill",
                    hue: 90 + Math.random() * 50,
                });
            }

            // Increase background green tint with each click
            fillOpacity.current = Math.min(fillOpacity.current + 0.03, 0.35);
        },
        [puffCount]
    );

    // ── Draw a single particle ────────────────────────────────
    const drawParticle = useCallback(
        (ctx: CanvasRenderingContext2D, p: Particle) => {
            const lifeRatio = p.life / p.maxLife;
            const alpha = p.opacity * lifeRatio;

            let growFactor: number;
            let size: number;
            let color: string;

            // Clamp alpha to avoid floating-point edge cases (scientific notation)
            const clampedAlpha = Math.max(0, Math.min(1, alpha));
            const alphaStr = clampedAlpha.toFixed(4);

            if (p.type === "fill") {
                growFactor = 1 + (1 - lifeRatio) * 4;
                size = p.size * growFactor;
                color = `hsla(${p.hue}, 70%, 40%, ${alphaStr})`;
            } else if (p.type === "puff") {
                growFactor = 1 + (1 - lifeRatio) * 2.5;
                size = p.size * growFactor;
                color = `hsla(${p.hue}, 65%, 45%, ${alphaStr})`;
            } else {
                growFactor = 1 + (1 - lifeRatio) * 1.5;
                size = p.size * growFactor;
                const green = GREENS[Math.floor(Math.abs(p.rotation) * 10) % GREENS.length];
                color = `rgba(${green}, ${alphaStr})`;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = 1;

            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            // Clamp alpha values to avoid scientific notation breaking CSS parsing
            const safeAlpha = (v: number) => Math.max(0, Math.min(1, v)).toFixed(4);
            grad.addColorStop(0, color);
            if (p.type === "fill") {
                grad.addColorStop(0.5, color.replace(/[\d.]+\)$/, `${safeAlpha(alpha * 0.6)})`));
                grad.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
            } else {
                grad.addColorStop(0.4, color.replace(/[\d.]+\)$/, `${safeAlpha(alpha * 0.4)})`));
                grad.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
            }

            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.restore();
        },
        []
    );

    // ── Main animation loop ────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener("resize", resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.prevX = mouse.current.x;
            mouse.current.prevY = mouse.current.y;
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            isActive.current = true;

            const now = Date.now();
            if (now - lastEmit.current > TRAIL_EMIT_INTERVAL) {
                const dx = e.clientX - mouse.current.prevX;
                const dy = e.clientY - mouse.current.prevY;
                const angle = Math.atan2(dy, dx) + Math.PI;
                const tipX = e.clientX + Math.cos(angle) * LEAF_LENGTH * 0.9;
                const tipY = e.clientY + Math.sin(angle) * LEAF_LENGTH * 0.9;
                emitTrail(tipX, tipY);
                lastEmit.current = now;
            }
        };

        const handleClick = (e: MouseEvent) => {
            emitPuff(e.clientX, e.clientY);
        };

        const handleMouseLeave = () => {
            isActive.current = false;
        };

        const handleMouseEnter = () => {
            isActive.current = true;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        // ── Render loop ────────────────────────────────────────
        const loop = () => {
            const dpr = window.devicePixelRatio || 1;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Draw persistent green fill overlay (accumulates with clicks)
            if (fillOpacity.current > 0) {
                ctx.fillStyle = `rgba(45, 80, 22, ${fillOpacity.current})`;
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                // Slowly fade the fill
                fillOpacity.current = Math.max(0, fillOpacity.current - 0.0005);
            }

            // Slowly decay click count
            if (clickCount.current > 0 && Math.random() < 0.01) {
                clickCount.current = Math.max(0, clickCount.current - 1);
            }

            // Update & draw particles
            particles.current = particles.current.filter((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.985;
                p.vy *= 0.985;
                p.rotation += p.rotationSpeed;

                let fadeSpeed: number;
                if (p.type === "fill") fadeSpeed = FILL_FADE_SPEED;
                else if (p.type === "puff") fadeSpeed = PUFF_FADE_SPEED;
                else fadeSpeed = PARTICLE_FADE_SPEED;

                p.life -= fadeSpeed * p.maxLife;

                if (p.life <= 0) return false;
                drawParticle(ctx, p);
                return true;
            });

            // Draw leaf cursor
            if (isActive.current && mouse.current.x > 0) {
                drawLeaf(ctx, mouse.current.x, mouse.current.y);
            }

            animFrame.current = requestAnimationFrame(loop);
        };

        animFrame.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animFrame.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [enabled, emitTrail, emitPuff, drawLeaf, drawParticle]);

    if (!enabled) return null;

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 z-[9999] pointer-events-none ${className}`}
            aria-hidden="true"
        />
    );
}
