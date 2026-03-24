"use client";

import { useState } from "react";
import {
  ShieldCheck, Search, Send, CheckCircle2, Clock,
  AlertCircle, Percent, BadgeCheck, Scale, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PriceMatchClient() {
  const [form, setForm] = useState({
    productName: "",
    competitorUrl: "",
    competitorPrice: "",
    screenshotUrl: "",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productName || !form.competitorUrl || !form.competitorPrice || !form.email) {
      setStatus("error");
      setMessage("Please fill in all required fields.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/trpc/priceMatch.submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            productName: form.productName,
            competitorUrl: form.competitorUrl,
            competitorPrice: parseFloat(form.competitorPrice),
            screenshotUrl: form.screenshotUrl || undefined,
            email: form.email,
          },
        }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Your price match request has been submitted! We'll review it within 24 hours.");
        setForm({ productName: "", competitorUrl: "", competitorPrice: "", screenshotUrl: "", email: "" });
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-forest to-emerald-950 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15),_transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <ShieldCheck className="h-5 w-5 text-lime" />
              <span className="text-sm font-bold tracking-wider uppercase">Lowest Price Guarantee</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Found It Cheaper?{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime to-emerald-400">
                We&apos;ll Beat It by 5%
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              We&apos;re committed to offering the lowest prices on premium cannabis in Canada.
              If you find a lower price, we&apos;ll match it <strong className="text-white">and</strong> beat it by 5%.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30 dark:bg-white/[0.02]">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-black text-center text-forest dark:text-cream mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Search,
                step: "1",
                title: "Find a Lower Price",
                desc: "Spot a lower price on the same product at a Canadian online dispensary.",
                color: "text-blue-500 bg-blue-500/10",
              },
              {
                icon: Send,
                step: "2",
                title: "Submit Proof",
                desc: "Fill out our form with the competitor URL, price, and product details.",
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: Percent,
                step: "3",
                title: "Get Matched + 5% Off",
                desc: "We verify and match the price, then knock off an extra 5%. You save more.",
                color: "text-amber-500 bg-amber-500/10",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-forest dark:bg-lime text-white dark:text-forest rounded-full flex items-center justify-center text-xs font-black">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-forest dark:text-cream">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream mb-8 text-center">
              Price Match Rules
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Package, text: "Must be the same product, strain, and weight" },
                { icon: Scale, text: "Competitor must be a Canadian online dispensary" },
                { icon: BadgeCheck, text: "Product must be currently in stock at the competitor" },
                { icon: AlertCircle, text: "Limit one price match per product per order" },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-white/[0.03] border border-border">
                  <rule.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/80 dark:text-cream/80">{rule.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      <section className="py-16 md:py-20 bg-muted/30 dark:bg-white/[0.02]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-forest dark:text-cream mb-2 text-center">
              Submit a Price Match
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              We check every claim within 24 hours
            </p>

            {status === "success" ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-forest dark:text-cream">Request Submitted!</h3>
                <p className="text-muted-foreground">{message}</p>
                <Button variant="outline" onClick={() => setStatus("idle")}>
                  Submit Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-forest dark:text-cream mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => setForm({ ...form, productName: e.target.value })}
                    placeholder="e.g. Pink Kush AAAA — 1 oz"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white dark:bg-card text-foreground dark:text-cream placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-forest dark:text-cream mb-1.5">
                    Competitor URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={form.competitorUrl}
                    onChange={(e) => setForm({ ...form, competitorUrl: e.target.value })}
                    placeholder="https://competitor.ca/product-page"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white dark:bg-card text-foreground dark:text-cream placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-forest dark:text-cream mb-1.5">
                      Competitor Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.competitorPrice}
                        onChange={(e) => setForm({ ...form, competitorPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-white dark:bg-card text-foreground dark:text-cream placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest dark:text-cream mb-1.5">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white dark:bg-card text-foreground dark:text-cream placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-forest dark:text-cream mb-1.5">
                    Screenshot URL <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={form.screenshotUrl}
                    onChange={(e) => setForm({ ...form, screenshotUrl: e.target.value })}
                    placeholder="https://imgur.com/screenshot or direct link"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white dark:bg-card text-foreground dark:text-cream placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wider uppercase shadow-lg"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Price Match Request
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-foreground/70 dark:text-cream/70">We check every claim within <strong className="text-foreground dark:text-cream">24 hours</strong></span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-foreground/70 dark:text-cream/70">Applies to all <strong className="text-foreground dark:text-cream">flower, edibles, and concentrates</strong></span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="flex items-center gap-3 text-sm">
              <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-foreground/70 dark:text-cream/70">Match + <strong className="text-foreground dark:text-cream">5% extra off</strong> every time</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
