/**
 * Contact Us — Client Content
 * Uses i18n translation system for all text content.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleProvider";

export default function ContactClientContent() {
    const { t } = useLocale();

    const CONTACT_INFO = [
        {
            icon: Mail,
            label: t("contact.emailLabel"),
            value: t("contact.emailValue"),
            href: "mailto:info@mohawkmedibles.ca",
            description: t("contact.emailDesc"),
        },
        {
            icon: Phone,
            label: t("contact.phoneLabel"),
            value: t("contact.phoneValue"),
            href: "tel:+16133966728",
            description: t("contact.phoneDesc"),
        },
        {
            icon: MapPin,
            label: t("contact.locationLabel"),
            value: t("contact.locationValue"),
            href: "https://maps.google.com/?q=45+Dundas+Street+Deseronto+Ontario",
            description: t("contact.locationDesc"),
        },
        {
            icon: Clock,
            label: t("contact.hoursLabel"),
            value: t("contact.hoursValue"),
            href: null,
            description: t("contact.hoursDesc"),
        },
    ];

    const DEPARTMENTS = [
        { value: "general", label: t("contact.deptGeneral") },
        { value: "orders", label: t("contact.deptOrders") },
        { value: "returns", label: t("contact.deptReturns") },
        { value: "wholesale", label: t("contact.deptWholesale") },
        { value: "press", label: t("contact.deptPress") },
        { value: "technical", label: t("contact.deptTechnical") },
    ];

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
        <div className="min-h-screen page-glass text-foreground">
            {/* Hero with background image */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/assets/hero/abstract-haze.webp"
                        alt=""
                        fill
                        className="object-cover opacity-30"
                        sizes="100vw"
                        aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-white dark:from-charcoal-deep/70 dark:via-charcoal-deep/90 dark:to-charcoal-deep" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/15 border border-lime/30 text-lime text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        {t("contact.badge")}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight font-display mb-3">{t("contact.title")}</h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        {t("contact.subtitle")}
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
                                className="glass-card border border-border rounded-xl p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-forest/10 dark:bg-lime/10 rounded-lg">
                                        <info.icon className="h-5 w-5 text-forest dark:text-lime" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-foreground">{info.label}</h3>
                                        {info.href ? (
                                            <a
                                                href={info.href}
                                                target={info.href.startsWith("http") ? "_blank" : undefined}
                                                rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                                className="text-forest dark:text-lime text-sm hover:underline"
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
                        <div className="bg-forest/5 dark:bg-lime/5 border border-forest/15 dark:border-lime/15 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-forest/10 dark:bg-lime/10 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-forest dark:text-lime" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-forest dark:text-lime">{t("contact.needInstantHelp")}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t("contact.medAgentDesc")}
                                    </p>
                                    <p className="text-xs text-forest/80 dark:text-lime/80 mt-2 font-medium">
                                        {t("contact.medAgentHint")} &rarr;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-card border border-border rounded-xl p-8">
                            <h2 className="text-xl font-bold text-foreground mb-6">{t("contact.sendUsMessage")}</h2>

                            {formState === "sent" ? (
                                <div className="text-center py-12 space-y-4">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                                    <h3 className="text-xl font-bold text-foreground">{t("contact.messageSentTitle")}</h3>
                                    <p className="text-muted-foreground">
                                        {t("contact.messageSentDesc")}
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => setFormState("idle")}
                                        className="mt-4"
                                    >
                                        {t("contact.sendAnother")}
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                {t("contact.fullName")}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 dark:focus:ring-lime/30 focus:border-forest/50 dark:focus:border-lime/50 outline-none transition text-foreground"
                                                placeholder={t("contact.fullNamePlaceholder")}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                {t("contact.email")}
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 dark:focus:ring-lime/30 focus:border-forest/50 dark:focus:border-lime/50 outline-none transition text-foreground"
                                                placeholder={t("contact.emailPlaceholder")}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                {t("contact.department")}
                                            </label>
                                            <select
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 dark:focus:ring-lime/30 focus:border-forest/50 dark:focus:border-lime/50 outline-none transition text-foreground"
                                            >
                                                {DEPARTMENTS.map((d) => (
                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                                {t("contact.subject")}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 dark:focus:ring-lime/30 focus:border-forest/50 dark:focus:border-lime/50 outline-none transition text-foreground"
                                                placeholder={t("contact.subjectPlaceholder")}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            {t("contact.message")}
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-muted focus:ring-2 focus:ring-forest/30 dark:focus:ring-lime/30 focus:border-forest/50 dark:focus:border-lime/50 outline-none transition resize-none text-foreground"
                                            placeholder={t("contact.messagePlaceholder")}
                                        />
                                    </div>

                                    {formState === "error" && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                                            {t("contact.formError")}
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
                                                <Loader2 className="h-4 w-4 animate-spin" /> {t("contact.sending")}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" /> {t("contact.sendMessage")}
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
