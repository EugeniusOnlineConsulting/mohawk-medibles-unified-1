"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { markAuthenticated } from "@/lib/sage/memory";
import { setUserAuthenticated } from "@/lib/sage/behavioral";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "login", email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            markAuthenticated();
            setUserAuthenticated();
            router.push("/account");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Leaf className="h-12 w-12 text-forest dark:text-leaf mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Welcome Back</h1>
                    <p className="text-muted-foreground mt-2">Sign in to your Mohawk Medibles account</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">{error}</div>
                    )}

                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                placeholder="you@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-forest dark:text-cream">Password</label>
                            <Link href="/forgot-password" className="text-xs text-forest/70 hover:text-forest">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="password"
                                type={showPass ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest"
                            >
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" variant="brand" size="lg" className="w-full gap-2" disabled={loading}>
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-forest dark:text-leaf font-medium hover:underline">Create one</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
