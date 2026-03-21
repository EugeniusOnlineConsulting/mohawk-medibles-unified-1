"use client";

/**
 * Email Editor — Compose and edit email campaigns with live preview
 * Ported from mohawk-medibles2 EmailEditorTab.tsx
 */

import { useState, useEffect, useCallback } from "react";
import {
    Paintbrush, RotateCcw, Save, Eye, Monitor, Smartphone,
    Palette, Type, Image, AlignLeft, RectangleHorizontal,
} from "lucide-react";

interface EditorSettings {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    contentBgColor: string;
    textColor: string;
    mutedTextColor: string;
    headerBorderColor: string;
    fontFamily: string;
    headerFontSize: string;
    bodyFontSize: string;
    showHeaderImage: boolean;
    headerImageUrl: string;
    headerText: string;
    footerTextEn: string;
    footerTextFr: string;
    footerLegalEn: string;
    footerLegalFr: string;
    buttonBorderRadius: string;
    buttonPadding: string;
}

const DEFAULT_SETTINGS: EditorSettings = {
    primaryColor: "#2D5016",
    secondaryColor: "#3a6b1e",
    backgroundColor: "#f4f4f4",
    contentBgColor: "#ffffff",
    textColor: "#333333",
    mutedTextColor: "#666666",
    headerBorderColor: "#2D5016",
    fontFamily: "Arial, sans-serif",
    headerFontSize: "22px",
    bodyFontSize: "14px",
    showHeaderImage: false,
    headerImageUrl: "",
    headerText: "Mohawk Medibles",
    footerTextEn: "Thank you for shopping with us!",
    footerTextFr: "Merci de magasiner avec nous!",
    footerLegalEn: "",
    footerLegalFr: "",
    buttonBorderRadius: "6px",
    buttonPadding: "14px 32px",
};

type TabKey = "colors" | "typography" | "header" | "footer" | "buttons";

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50";

export default function EmailEditorPage() {
    const [form, setForm] = useState<EditorSettings>(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState<TabKey>("colors");
    const [previewLang, setPreviewLang] = useState<"en" | "fr">("en");
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/email/editor/")
            .then(r => r.json())
            .then(d => { if (d && !d.error) setForm({ ...DEFAULT_SETTINGS, ...d }); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const updateField = useCallback((key: keyof EditorSettings, value: string | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }, []);

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/email/editor/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "save", settings: form }),
            });
            if (res.ok) {
                // Success handled silently
            }
        } catch { /* error handled silently */ }
        setSaving(false);
    }

    async function handleReset() {
        if (!confirm("Reset all settings to defaults?")) return;
        setForm(DEFAULT_SETTINGS);
        await fetch("/api/admin/email/editor/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset" }),
        });
    }

    function generatePreviewHtml(): string {
        const footer = previewLang === "fr" ? form.footerTextFr : form.footerTextEn;
        const legal = previewLang === "fr" ? form.footerLegalFr : form.footerLegalEn;
        const heading = previewLang === "fr" ? "Confirmation de commande" : "Order Confirmation";
        const bodyText = previewLang === "fr"
            ? "Merci pour votre commande! Nous preparons votre colis maintenant."
            : "Thank you for your order! We are preparing your package now.";
        const btnText = previewLang === "fr" ? "Voir la commande" : "View Order";

        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:${form.fontFamily};background-color:${form.backgroundColor};">
<div style="max-width:600px;margin:0 auto;background:${form.contentBgColor};border-radius:8px;overflow:hidden;margin-top:20px;margin-bottom:20px;">
    <div style="background-color:${form.primaryColor};padding:24px;text-align:center;border-bottom:3px solid ${form.headerBorderColor};">
        ${form.showHeaderImage && form.headerImageUrl ? `<img src="${form.headerImageUrl}" alt="${form.headerText}" style="max-height:60px;margin-bottom:8px;">` : ""}
        <h1 style="color:white;font-size:${form.headerFontSize};margin:0;">${form.headerText}</h1>
    </div>
    <div style="padding:32px;color:${form.textColor};font-size:${form.bodyFontSize};">
        <h2 style="color:${form.primaryColor};margin-top:0;">${heading}</h2>
        <p>${bodyText}</p>
        <div style="text-align:center;margin:24px 0;">
            <a href="#" style="display:inline-block;background:${form.secondaryColor};color:white;padding:${form.buttonPadding};border-radius:${form.buttonBorderRadius};text-decoration:none;font-weight:bold;">${btnText}</a>
        </div>
        <p style="color:${form.mutedTextColor};font-size:12px;">Order #12345 &bull; ${new Date().toLocaleDateString()}</p>
    </div>
    <div style="background:${form.backgroundColor};padding:16px;text-align:center;font-size:11px;color:${form.mutedTextColor};">
        <p style="margin:0;">${footer}</p>
        ${legal ? `<p style="margin:4px 0 0;font-size:10px;">${legal}</p>` : ""}
    </div>
</div>
</body></html>`;
    }

    const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
        { key: "colors", label: "Colors", icon: Palette },
        { key: "typography", label: "Type", icon: Type },
        { key: "header", label: "Header", icon: Image },
        { key: "footer", label: "Footer", icon: AlignLeft },
        { key: "buttons", label: "Buttons", icon: RectangleHorizontal },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Paintbrush className="h-7 w-7 text-green-400" /> Email Template Editor
                    </h1>
                    <p className="text-zinc-500 mt-1">Customize email colors, fonts, headers, and footers without touching code</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" /> Reset
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                        <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Editor Panel */}
                <div className="space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 bg-[#0f0f18] border border-white/5 rounded-2xl p-1">
                        {TABS.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                                    activeTab === t.key
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Colors Tab */}
                    {activeTab === "colors" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold mb-2">Color Palette</h3>
                            <p className="text-xs text-zinc-500 mb-4">Customize the color scheme of all outgoing emails</p>
                            <ColorField label="Primary Color" value={form.primaryColor} onChange={v => updateField("primaryColor", v)} />
                            <ColorField label="Secondary Color" value={form.secondaryColor} onChange={v => updateField("secondaryColor", v)} />
                            <ColorField label="Background" value={form.backgroundColor} onChange={v => updateField("backgroundColor", v)} />
                            <ColorField label="Content Background" value={form.contentBgColor} onChange={v => updateField("contentBgColor", v)} />
                            <ColorField label="Text Color" value={form.textColor} onChange={v => updateField("textColor", v)} />
                            <ColorField label="Muted Text" value={form.mutedTextColor} onChange={v => updateField("mutedTextColor", v)} />
                            <ColorField label="Header Border" value={form.headerBorderColor} onChange={v => updateField("headerBorderColor", v)} />
                        </div>
                    )}

                    {/* Typography Tab */}
                    {activeTab === "typography" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold mb-2">Font Settings</h3>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Font Family</label>
                                <input className={inputClass} value={form.fontFamily} onChange={e => updateField("fontFamily", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Header Font Size</label>
                                <input className={inputClass} value={form.headerFontSize} onChange={e => updateField("headerFontSize", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Body Font Size</label>
                                <input className={inputClass} value={form.bodyFontSize} onChange={e => updateField("bodyFontSize", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Header Tab */}
                    {activeTab === "header" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold mb-2">Email Header</h3>
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-zinc-500">Show Header Image</label>
                                <button
                                    onClick={() => updateField("showHeaderImage", !form.showHeaderImage)}
                                    className={`w-10 h-5 rounded-full transition-colors ${form.showHeaderImage ? "bg-green-500" : "bg-zinc-700"}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.showHeaderImage ? "translate-x-5" : "translate-x-0.5"}`} />
                                </button>
                            </div>
                            {form.showHeaderImage && (
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Header Image URL</label>
                                    <input className={inputClass} value={form.headerImageUrl} onChange={e => updateField("headerImageUrl", e.target.value)} placeholder="https://..." />
                                </div>
                            )}
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Header Text</label>
                                <input className={inputClass} value={form.headerText} onChange={e => updateField("headerText", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Footer Tab */}
                    {activeTab === "footer" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold mb-2">Footer Content</h3>
                            <p className="text-xs text-zinc-500 mb-2">Customize footer text for English and French emails</p>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Footer Text (English)</label>
                                <textarea className={`${inputClass} resize-y`} rows={2} value={form.footerTextEn} onChange={e => updateField("footerTextEn", e.target.value)} placeholder="Thank you for shopping with us!" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Footer Text (French)</label>
                                <textarea className={`${inputClass} resize-y`} rows={2} value={form.footerTextFr} onChange={e => updateField("footerTextFr", e.target.value)} placeholder="Merci de magasiner avec nous!" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Legal Text (English)</label>
                                <textarea className={`${inputClass} resize-y`} rows={2} value={form.footerLegalEn} onChange={e => updateField("footerLegalEn", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Legal Text (French)</label>
                                <textarea className={`${inputClass} resize-y`} rows={2} value={form.footerLegalFr} onChange={e => updateField("footerLegalFr", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Buttons Tab */}
                    {activeTab === "buttons" && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold mb-2">Button Styling</h3>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Border Radius</label>
                                <input className={inputClass} value={form.buttonBorderRadius} onChange={e => updateField("buttonBorderRadius", e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Padding</label>
                                <input className={inputClass} value={form.buttonPadding} onChange={e => updateField("buttonPadding", e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="space-y-3">
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Eye className="h-4 w-4 text-green-400" /> Live Preview
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPreviewLang("en")}
                                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${previewLang === "en" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-zinc-500 border border-transparent"}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setPreviewLang("fr")}
                                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${previewLang === "fr" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-zinc-500 border border-transparent"}`}
                                >
                                    FR
                                </button>
                                <button
                                    onClick={() => setPreviewDevice(previewDevice === "desktop" ? "mobile" : "desktop")}
                                    className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {previewDevice === "desktop" ? <Monitor size={14} /> : <Smartphone size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-900">
                            <div
                                className="mx-auto bg-white rounded-xl overflow-hidden shadow-lg transition-all"
                                style={{ maxWidth: previewDevice === "mobile" ? "375px" : "100%" }}
                            >
                                <iframe
                                    srcDoc={generatePreviewHtml()}
                                    className="w-full border-0"
                                    style={{ height: "500px" }}
                                    title="Email Preview"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-10 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <div className="flex-1">
                <label className="text-xs text-zinc-500 mb-0.5 block">{label}</label>
                <input
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-green-500/50"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
