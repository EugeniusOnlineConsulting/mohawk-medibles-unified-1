/**
 * Contact Us — Mohawk Medibles
 * Contact form + direct contact info.
 */
"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTACT_INFO = [
    {
        icon: Mail,
        label: "Email",
        value: "info@mohawkmedibles.ca",
        href: "mailto:info@mohawkmedibles.ca",
        description: "General inquiries — we respond within 24 hours",
    },
    {
        icon: Phone,
        label: "Phone",
        value: "(613) 396-6728",
        href: "tel:+16133966728",
        description: "Available Mon–Fri, 10 AM – 6 PM ET",
    },
    {
        icon: MapPin,
        label: "Location",
        value: "45 Dundas Street, Deseronto, ON",
        href: "https://maps.google.com/?q=45+Dundas+Street+Deseronto+Ontario",
        description: "Tyendinaga Mohawk Territory",
    },
    {
        icon: Clock,
        label: "Business Hours",
        value: "Mon–Sat: 10 AM – 8 PM ET",
        href: null,
        description: "Sunday: 12 PM – 6 PM ET",
    },
];

const DEPARTMENTS = [
    { value: "general", label: "General Inquiry" },
    { value: "orders", label: "Order Support" },
    { value: "returns", label: "Returns & Refunds" },
    { value: "wholesale", label: "Wholesale / Bulk" },
    { value: "press", label: "Press & Media" },
    { value: "technical", label: "Website / Technical" },
];

export default function ContactPage() {
    const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "general",
        subject: "",
        message: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormState("sending");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to send");
            setFormState("sent");
            setFormData({ name: "", email: "", department: "general", subject: "", message: "" });
        } catch {
            setFormState("error");
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-6">
                    <p className="text-sm uppercase tracking-widest text-green-600 dark:text-green-400 font-bold mb-4">Get In Touch</p>
                    <h1 className="text-4xl font-bold text-foreground mb-3">Contact Us</h1>
                    <p className="text-muted-foreground text-lg">
                        Have a question about an order, our products, or anything else? We&apos;re here to help.
                    </p>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {CONTACT_INFO.map((info) => (
                            <div
                                key={info.label}
                                className="bg-card border border-border rounded-xl p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <info.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-foreground">{info.label}</h3>
                                        {info.href ? (
                                            <a
                                                href={info.href}
                                                target={info.href.startsWith("http") ? "_blank" : undefined}
                                                rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                                className="text-green-600 dark:text-green-400 text-sm hover:underline"
                                            >
                                                {info.value}
                                            </a>
                                        ) : (
                                            <p className="text-sm text-foreground">{info.value}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* MedAgent CTA */}
                        <div className="bg-forest/5 dark:bg-green-900/20 border border-forest/10 dark:border-green-800/30 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-forest/10 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-forest dark:text-leaf" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-forest dark:text-leaf">Need Instant Help?</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Chat with MedAgent, our AI assistant, for quick answers about products, orders, and more.
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                        Click the chat icon in the bottom-right corner →
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-xl p-8">
                            <h2 className="text-xl font-bold text-foreground mb-6">Send Us a Message</h2>

                            {formState === "sent" ? (
                                <div className="text-center py-12 space-y-4">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                                    <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                                    <p className="text-muted-foreground">
                                        We&apos;ll get back to you within 24 hours. Check your email for a confirmation.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setFormState("idle")}
                                        className="mt-4"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition text-foreground"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition text-foreground"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                Department
                                            </label>
                                            <select
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition text-foreground"
                                            >
                                                {DEPARTMENTS.map((d) => (
                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                Subject *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition text-foreground"
                                                placeholder="What's this about?"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            Message *
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 outline-none transition resize-none text-foreground"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>

                                    {formState === "error" && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm">
                                            Something went wrong. Please try again or email us directly at info@mohawkmedibles.ca
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="brand"
                                        size="lg"
                                        className="gap-2"
                                        disabled={formState === "sending"}
                                    >
                                        {formState === "sending" ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" /> Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
