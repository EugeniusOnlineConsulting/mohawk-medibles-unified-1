"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [ageVerified, setAgeVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const passwordStrength = password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirm) { setError("Passwords don't match"); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
        if (!ageVerified) { setError("You must be 19+ to create an account"); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "register", name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            router.push("/account");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Leaf className="h-12 w-12 text-forest dark:text-leaf mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-forest dark:text-cream">Create Account</h1>
                    <p className="text-muted-foreground mt-2">Join the Mohawk Medibles community</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-card rounded-2xl border border-border p-8 space-y-5 shadow-sm">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">{error}</div>
                    )}

                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="name" type="text" required value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="email" type="email" required value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                placeholder="you@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="password" type={showPass ? "text" : "password"} required value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                placeholder="Min 8 characters"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest">
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {password.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex gap-1 flex-1">
                                    <div className={`h-1 rounded flex-1 ${passwordStrength !== "weak" ? "bg-green-500" : "bg-muted"}`} />
                                    <div className={`h-1 rounded flex-1 ${passwordStrength === "medium" || passwordStrength === "strong" ? "bg-green-500" : "bg-muted"}`} />
                                    <div className={`h-1 rounded flex-1 ${passwordStrength === "strong" ? "bg-green-500" : "bg-muted"}`} />
                                </div>
                                <span className="text-xs text-muted-foreground capitalize">{passwordStrength}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirm" className="text-sm font-medium text-forest dark:text-cream mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                id="confirm" type="password" required value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition"
                                placeholder="••••••••"
                            />
                            {confirm.length > 0 && password === confirm && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                            )}
                        </div>
                    </div>

                    {/* Age Verification */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox" checked={ageVerified}
                            onChange={(e) => setAgeVerified(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-border accent-forest"
                        />
                        <span className="text-sm text-muted-foreground">
                            I confirm I am <strong>19 years of age or older</strong> as required by Ontario law to purchase cannabis products.
                        </span>
                    </label>

                    <Button type="submit" variant="brand" size="lg" className="w-full gap-2" disabled={loading || !ageVerified}>
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                        {loading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-forest dark:text-leaf font-medium hover:underline">Sign in</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
