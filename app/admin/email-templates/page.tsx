"use client";

import { useState, useEffect } from "react";
import {
    Mail, Eye, Send, Globe, Maximize2, Minimize2,
    CheckCircle, Smartphone, Monitor, Copy,
    History, RotateCcw, ArrowLeftRight, Clock, Paintbrush, X,
} from "lucide-react";

const TEMPLATE_OPTIONS = [
    { id: "order_confirmation", label: "Order Confirmation", icon: "\ud83d\udce7", description: "Sent when a new order is placed" },
    { id: "payment_received", label: "Payment Received", icon: "\ud83d\udcb0", description: "Sent when payment is confirmed" },
    { id: "order_shipped", label: "Order Shipped", icon: "\ud83d\udce6", description: "Sent when order ships with tracking" },
    { id: "order_delivered", label: "Order Delivered", icon: "\u2705", description: "Sent when order is delivered" },
    { id: "order_cancelled", label: "Order Cancelled", icon: "\u274c", description: "Sent when order is cancelled" },
    { id: "order_refunded", label: "Refund Processed", icon: "\ud83d\udcb8", description: "Sent when refund is issued" },
    { id: "back_in_stock", label: "Back in Stock", icon: "\ud83d\udd14", description: "Sent when a watched product restocks" },
    { id: "password_reset", label: "Password Reset", icon: "\ud83d\udd11", description: "Sent when password reset is requested" },
    { id: "owner_alert", label: "New Order Alert (Owner)", icon: "\ud83c\udfea", description: "Admin-only \u2014 always English" },
    { id: "low_stock", label: "Low Stock Alert (Owner)", icon: "\u26a0\ufe0f", description: "Admin-only \u2014 always English" },
];

type ViewMode = "side-by-side" | "english" | "french";
type DeviceMode = "desktop" | "mobile";
type Tab = "preview" | "history";

export default function EmailTemplatesPage() {
    const [tab, setTab] = useState<Tab>("preview");
    const [selectedTemplate, setSelectedTemplate] = useState("order_confirmation");
    const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
    const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
    const [fullscreen, setFullscreen] = useState<"en" | "fr" | null>(null);
    const [preview, setPreview] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [sendingTest, setSendingTest] = useState<"en" | "fr" | null>(null);

    // Version history state
    const [versions, setVersions] = useState<any[]>([]);
    const [selectedVersion, setSelectedVersion] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [compareA, setCompareA] = useState<number | null>(null);
    const [compareB, setCompareB] = useState<number | null>(null);
    const [showCompare, setShowCompare] = useState(false);
    const [compareResult, setCompareResult] = useState<any>(null);

    // Load template preview
    useEffect(() => {
        if (tab !== "preview") return;
        setPreviewLoading(true);
        fetch("/api/admin/email-templates/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ templateId: selectedTemplate, action: "preview" }),
        })
            .then(r => r.json())
            .then(d => { setPreview(d); setPreviewLoading(false); })
            .catch(() => setPreviewLoading(false));
    }, [selectedTemplate, tab]);

    // Load version history
    useEffect(() => {
        if (tab !== "history") return;
        fetch("/api/admin/email-templates/")
            .then(r => r.json())
            .then(d => setVersions(d.versions || []))
            .catch(() => {});
    }, [tab]);

    // Load compare
    useEffect(() => {
        if (!showCompare || !compareA || !compareB) return;
        fetch("/api/admin/email-templates/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "compare", versionA: compareA, versionB: compareB }),
        })
            .then(r => r.json())
            .then(setCompareResult)
            .catch(() => {});
    }, [showCompare, compareA, compareB]);

    const handleSendTest = (lang: "en" | "fr") => {
        if (!preview) return;
        setSendingTest(lang);
        setTimeout(() => setSendingTest(null), 1500);
    };

    const templateInfo = TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate);
    const isAdminOnly = selectedTemplate === "owner_alert" || selectedTemplate === "low_stock";
    const iframeWidth = deviceMode === "mobile" ? "375px" : "100%";

    function startCompare(id: number) {
        if (!compareA) { setCompareA(id); }
        else if (!compareB) { setCompareB(id); setShowCompare(true); }
        else { setCompareA(id); setCompareB(null); setShowCompare(false); }
    }

    function resetCompare() {
        setCompareA(null); setCompareB(null); setShowCompare(false); setCompareResult(null);
    }

    const renderPreviewPane = (lang: "en" | "fr", data: any, isFullscreen: boolean) => {
        const langLabel = lang === "fr" ? "Fran\u00e7ais" : "English";
        const flagEmoji = lang === "fr" ? "\ud83c\uddeb\ud83c\uddf7" : "\ud83c\uddec\ud83c\udde7";

        return (
            <div className={`flex flex-col ${isFullscreen ? "fixed inset-0 z-50 bg-[#0a0a0f]" : "flex-1 min-w-0"}`}>
                <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{flagEmoji}</span>
                        <span className="text-sm font-bold">{langLabel}</span>
                        {isAdminOnly && lang === "fr" && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                                Admin emails are English-only
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => handleSendTest(lang)} disabled={sendingTest !== null || !data}
                            className="px-3 py-1.5 border border-white/10 text-zinc-400 text-xs rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            {sendingTest === lang ? "Sending..." : <><Send size={12} className="inline mr-1" /> Send Test</>}
                        </button>
                        <button onClick={() => setFullscreen(isFullscreen ? null : lang)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                    </div>
                </div>
                <div className="px-4 py-2 bg-white/[0.01] border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Subject:</span>
                        <span className="text-xs text-zinc-400 font-medium truncate">{data?.subject || "Loading..."}</span>
                        {data?.subject && (
                            <button onClick={() => navigator.clipboard.writeText(data.subject)} className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors shrink-0">
                                <Copy size={10} />
                            </button>
                        )}
                    </div>
                </div>
                <div className={`flex-1 bg-[#0a0a0f] flex items-start justify-center overflow-auto p-4`}>
                    {previewLoading || !data ? (
                        <div className="flex items-center justify-center h-64 w-full">
                            <div className="animate-pulse text-center">
                                <div className="w-12 h-12 rounded-xl bg-white/5 mx-auto mb-3" />
                                <div className="h-3 w-32 bg-white/5 rounded mx-auto" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300" style={{ width: iframeWidth, maxWidth: "100%" }}>
                            <iframe srcDoc={data.html} title={`${langLabel} email preview`} className="w-full border-0" style={{ height: "700px", minHeight: "500px" }} sandbox="allow-same-origin" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (fullscreen) {
        const data = fullscreen === "fr" ? preview?.fr : preview?.en;
        return renderPreviewPane(fullscreen, data, true);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Eye size={28} className="text-green-400" /> Email Templates
                    </h1>
                    <p className="text-white/60 mt-1">Preview templates and manage version history</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Tab toggle */}
                    <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                        <button onClick={() => setTab("preview")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === "preview" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                            <Eye size={12} className="inline mr-1" /> Preview
                        </button>
                        <button onClick={() => setTab("history")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${tab === "history" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                            <History size={12} className="inline mr-1" /> History
                        </button>
                    </div>
                </div>
            </div>

            {tab === "preview" ? (
                <>
                    {/* Controls */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                            <button onClick={() => setDeviceMode("desktop")} className={`p-1.5 rounded-md transition-colors ${deviceMode === "desktop" ? "bg-white/10 text-green-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                                <Monitor size={14} />
                            </button>
                            <button onClick={() => setDeviceMode("mobile")} className={`p-1.5 rounded-md transition-colors ${deviceMode === "mobile" ? "bg-white/10 text-green-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                                <Smartphone size={14} />
                            </button>
                        </div>
                        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                            {(["side-by-side", "english", "french"] as ViewMode[]).map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-colors ${viewMode === mode ? "bg-white/10 text-green-400" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {mode === "side-by-side" ? "EN | FR" : mode === "english" ? "\ud83c\uddec\ud83c\udde7 EN" : "\ud83c\uddeb\ud83c\uddf7 FR"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template Selector */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-green-400" />
                                <span className="text-sm font-semibold">Template:</span>
                            </div>
                            <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                                className="flex-1 min-w-[250px] px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30"
                            >
                                {TEMPLATE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.icon} {opt.label}</option>)}
                            </select>
                            {templateInfo && <span className="text-xs text-zinc-500">{templateInfo.description}</span>}
                            {isAdminOnly && (
                                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full font-semibold">English Only</span>
                            )}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden" style={{ minHeight: "750px" }}>
                        {isAdminOnly ? (
                            renderPreviewPane("en", preview?.en, false)
                        ) : viewMode === "side-by-side" ? (
                            <div className="flex gap-0 h-full">
                                <div className="flex-1 border-r border-white/5">{renderPreviewPane("en", preview?.en, false)}</div>
                                <div className="flex-1">{renderPreviewPane("fr", preview?.fr, false)}</div>
                            </div>
                        ) : viewMode === "english" ? renderPreviewPane("en", preview?.en, false) : renderPreviewPane("fr", preview?.fr, false)}
                    </div>

                    {/* Coverage Summary */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-4">
                            <Globe size={14} className="text-green-400" /> Translation Coverage
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {TEMPLATE_OPTIONS.map(opt => {
                                const isAdmin = opt.id === "owner_alert" || opt.id === "low_stock";
                                return (
                                    <div key={opt.id} onClick={() => setSelectedTemplate(opt.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-white/20 ${
                                            selectedTemplate === opt.id ? "border-green-500/30 bg-green-500/5" : "border-white/5 bg-white/[0.02]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <span className="text-sm">{opt.icon}</span>
                                            <span className="text-[10px] font-bold truncate">{opt.label}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="flex items-center gap-0.5 text-[9px]"><CheckCircle size={10} className="text-green-400" /> EN</span>
                                            {isAdmin ? (
                                                <span className="text-[9px] text-zinc-600">Admin only</span>
                                            ) : (
                                                <span className="flex items-center gap-0.5 text-[9px]"><CheckCircle size={10} className="text-green-400" /> FR</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                /* VERSION HISTORY TAB */
                <>
                    {/* Compare Mode Banner */}
                    {(compareA || compareB) && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowLeftRight size={16} className="text-blue-400" />
                                <span className="text-sm text-blue-300 font-medium">
                                    {compareA && !compareB
                                        ? `Version #${compareA} selected. Click another version to compare.`
                                        : `Comparing Version #${compareA} vs Version #${compareB}`}
                                </span>
                            </div>
                            <button onClick={resetCompare} className="text-xs text-blue-400 hover:text-blue-300 font-bold">Cancel Compare</button>
                        </div>
                    )}

                    {/* Version List */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider">Saved Versions ({versions.length})</h3>
                            <button onClick={resetCompare} disabled={!compareA}
                                className="px-3 py-1.5 border border-white/10 text-zinc-400 text-xs rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                <ArrowLeftRight size={12} className="inline mr-1" /> Reset Compare
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                        <th className="text-left p-3 pl-6">Version</th>
                                        <th className="text-left p-3">Description</th>
                                        <th className="text-left p-3">Changed Fields</th>
                                        <th className="text-left p-3">Date</th>
                                        <th className="text-left p-3">By</th>
                                        <th className="text-left p-3 pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {versions.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                            No versions saved yet. Make changes in the Email Editor tab to start tracking versions.
                                        </td></tr>
                                    ) : versions.map((v: any, i: number) => (
                                        <tr key={v.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                                            (compareA === v.id || compareB === v.id) ? "bg-blue-500/5" : ""
                                        }`}>
                                            <td className="p-3 pl-6">
                                                <span className="text-xs font-bold">#{v.versionNumber}</span>
                                                {i === 0 && <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">latest</span>}
                                            </td>
                                            <td className="p-3 text-xs text-zinc-400 max-w-[200px] truncate">{v.changeDescription}</td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {(v.changedFields || []).slice(0, 3).map((f: string) => (
                                                        <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded border bg-violet-500/10 text-violet-400 border-violet-500/30">{f}</span>
                                                    ))}
                                                    {(v.changedFields || []).length > 3 && <span className="text-[10px] text-zinc-600">+{v.changedFields.length - 3} more</span>}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs text-zinc-500">
                                                <Clock size={10} className="inline mr-1" />
                                                {v.createdAt ? new Date(v.createdAt).toLocaleString() : "\u2014"}
                                            </td>
                                            <td className="p-3 text-xs text-zinc-500">{v.createdBy || "admin"}</td>
                                            <td className="p-3 pr-6">
                                                <div className="flex gap-1">
                                                    <button className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded hover:bg-blue-500/20 transition-colors"
                                                        onClick={() => {
                                                            fetch("/api/admin/email-templates/", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ action: "get", versionId: v.id }),
                                                            }).then(r => r.json()).then(d => { setSelectedVersion(d); setShowPreview(true); });
                                                        }}
                                                    ><Eye size={12} /></button>
                                                    <button className="px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded hover:bg-violet-500/20 transition-colors"
                                                        onClick={() => startCompare(v.id)}
                                                    ><ArrowLeftRight size={12} /></button>
                                                    {i > 0 && (
                                                        <button className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded hover:bg-amber-500/20 transition-colors"
                                                            onClick={() => {
                                                                if (confirm("Are you sure you want to revert to this version?")) {
                                                                    fetch("/api/admin/email-templates/", {
                                                                        method: "POST",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify({ action: "revert", versionId: v.id }),
                                                                    });
                                                                }
                                                            }}
                                                        ><RotateCcw size={12} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Compare Result */}
                    {showCompare && compareResult && (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                    <ArrowLeftRight size={14} className="text-blue-400" />
                                    Comparing Version #{compareA} vs Version #{compareB}
                                </h3>
                                <button onClick={resetCompare} className="px-3 py-1.5 border border-white/10 text-zinc-400 text-xs rounded-lg hover:bg-white/5 transition-colors">Close</button>
                            </div>
                            {compareResult.diffs.length === 0 ? (
                                <p className="text-sm text-zinc-500 text-center py-8">No differences found between these versions.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                                <th className="text-left p-3">Field</th>
                                                <th className="text-left p-3">Version #{compareA}</th>
                                                <th className="text-left p-3">Version #{compareB}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compareResult.diffs.map((diff: any) => (
                                                <tr key={diff.field} className="border-b border-white/5">
                                                    <td className="p-3 text-xs font-bold text-zinc-400">{diff.label}</td>
                                                    <td className="p-3">
                                                        <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                                                            <span className="text-xs text-red-400">{String(diff.oldValue)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
                                                            <span className="text-xs text-green-400">{String(diff.newValue)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-3">How It Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: Paintbrush, title: "Auto-Tracked", desc: "Every change made in the Email Editor is automatically saved as a new version." },
                                { icon: ArrowLeftRight, title: "Compare Versions", desc: "Select two versions to see a side-by-side diff of all changed settings." },
                                { icon: RotateCcw, title: "One-Click Revert", desc: "Revert to any previous version instantly. Current settings are auto-saved first." },
                            ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                                        <Icon size={16} className="text-green-400 mb-2" />
                                        <p className="text-sm font-bold mb-1">{item.title}</p>
                                        <p className="text-zinc-500 text-xs">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Version Detail Modal */}
            {showPreview && selectedVersion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowPreview(false)}>
                    <div className="bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <div>
                                <h3 className="text-sm font-bold">Version #{selectedVersion.versionNumber}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">{selectedVersion.changeDescription}</p>
                            </div>
                            <button className="p-1.5 hover:bg-white/5 rounded" onClick={() => setShowPreview(false)}>
                                <X size={16} className="text-zinc-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-3">
                                {Object.entries(selectedVersion.settings || {}).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-3 py-2 border-b border-white/5">
                                        <span className="text-xs font-bold text-zinc-400 w-40 shrink-0">{key}</span>
                                        <span className="text-xs text-zinc-300">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
