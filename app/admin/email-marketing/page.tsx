"use client";

/**
 * Email Marketing — Campaign Management
 * Ported from mohawk-medibles2 EmailMarketingTab.tsx
 * Create, schedule, send, and manage email campaigns
 */

import { useState, useEffect, useCallback } from "react";
import {
    Mail, Send, BarChart3, Users, Plus, Trash2, Eye, X,
    Clock, CalendarClock, XCircle, RefreshCw, Copy, Target,
} from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    subject: string;
    previewText: string | null;
    htmlContent: string;
    status: string;
    segmentRules: string | null;
    scheduledAt: string | null;
    sentAt: string | null;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    createdAt: string;
    _count?: { sends: number };
}

interface CampaignStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSubscribers: number;
    totalSent: number;
    openRate: number;
    clickRate: number;
}

const STATUS_STYLES: Record<string, string> = {
    DRAFT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    SENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    SENT: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const SEGMENT_OPTIONS = [
    { value: "", label: "All Subscribers" },
    { value: "VIP", label: "VIP ($500+ spend, 3+ orders)" },
    { value: "Loyal", label: "Loyal ($100+, repeat buyers)" },
    { value: "At-Risk", label: "At-Risk (60-119 days inactive)" },
    { value: "New", label: "New Customers" },
    { value: "Dormant", label: "Dormant (120+ days inactive)" },
    { value: "High-AOV", label: "High-AOV ($300+ total)" },
    { value: "Prospect", label: "Prospects (never ordered)" },
];

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50";

export default function EmailMarketingPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [sending, setSending] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewSubject, setPreviewSubject] = useState("");
    const [previewName, setPreviewName] = useState("");
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [form, setForm] = useState({
        name: "", subject: "", previewText: "", htmlContent: "",
        segment: "", scheduleEnabled: false, scheduledAt: "",
    });

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetch("/api/admin/campaigns/").then(r => r.json()).catch(() => []),
            fetch("/api/admin/campaigns/?action=stats").then(r => r.json()).catch(() => null),
        ]).then(([campData, statsData]) => {
            setCampaigns(Array.isArray(campData) ? campData : []);
            setStats(statsData);
            setLoading(false);
        });
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    function resetForm() {
        setForm({ name: "", subject: "", previewText: "", htmlContent: "", segment: "", scheduleEnabled: false, scheduledAt: "" });
    }

    async function createCampaign() {
        if (!form.name.trim() || !form.subject.trim() || !form.htmlContent.trim()) return;

        const payload: Record<string, unknown> = {
            action: "create",
            name: form.name,
            subject: form.subject,
            previewText: form.previewText,
            htmlContent: form.htmlContent,
            segmentRules: form.segment ? { segment: form.segment } : null,
        };

        const res = await fetch("/api/admin/campaigns/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success && form.scheduleEnabled && form.scheduledAt && data.campaign?.id) {
            await fetch("/api/admin/campaigns/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "schedule", id: data.campaign.id, scheduledAt: form.scheduledAt }),
            });
        }

        setShowCreate(false);
        resetForm();
        fetchData();
    }

    async function sendCampaign(id: string) {
        if (!confirm("Send this campaign now? This will email all subscribers in the target segment.")) return;
        setSending(id);
        await fetch("/api/admin/campaigns/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "send", id }),
        });
        setSending(null);
        fetchData();
    }

    async function cancelCampaign(id: string) {
        if (!confirm("Cancel this campaign?")) return;
        await fetch("/api/admin/campaigns/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel", id }),
        });
        fetchData();
    }

    async function duplicateCampaign(id: string) {
        await fetch("/api/admin/campaigns/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "duplicate", id }),
        });
        fetchData();
    }

    async function rescheduleCampaign() {
        if (!rescheduleId || !rescheduleDate) return;
        await fetch("/api/admin/campaigns/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "schedule", id: rescheduleId, scheduledAt: rescheduleDate }),
        });
        setRescheduleId(null);
        setRescheduleDate("");
        fetchData();
    }

    async function deleteCampaign(id: string) {
        if (!confirm("Permanently delete this campaign?")) return;
        await fetch("/api/admin/campaigns/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id }),
        });
        fetchData();
    }

    const scheduledCampaigns = campaigns.filter(c => c.status === "SCHEDULED");

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Preview Modal */}
            {previewHtml !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewHtml(null)}>
                    <div className="bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div>
                                <h3 className="text-sm font-bold">{previewName}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Subject: {previewSubject}</p>
                            </div>
                            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setPreviewHtml(null)}>
                                <X size={16} className="text-zinc-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-zinc-900 p-4">
                            <div className="mx-auto max-w-[640px] bg-white rounded-xl shadow-lg overflow-hidden">
                                <iframe
                                    srcDoc={previewHtml}
                                    className="w-full border-0"
                                    style={{ minHeight: "500px", height: "600px" }}
                                    title="Email Preview"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        </div>
                        <div className="p-3 border-t border-white/10">
                            <p className="text-[10px] text-zinc-500 text-center">
                                Preview may differ from actual rendering across email clients.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setRescheduleId(null)}>
                    <div className="bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CalendarClock size={16} className="text-blue-400" /> Reschedule Campaign
                        </h3>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1">New Send Date & Time</label>
                            <input
                                type="datetime-local"
                                className={inputClass}
                                value={rescheduleDate}
                                min={new Date().toISOString().slice(0, 16)}
                                onChange={e => setRescheduleDate(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={rescheduleCampaign}
                                disabled={!rescheduleDate}
                                className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                Reschedule
                            </button>
                            <button onClick={() => setRescheduleId(null)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Mail className="h-7 w-7 text-green-400" /> Email Marketing
                    </h1>
                    <p className="text-zinc-500 mt-1">Create, schedule, and send targeted email campaigns to subscribers</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> New Campaign
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: "Subscribers", value: stats.totalSubscribers.toLocaleString(), icon: Users, gradient: "from-blue-500 to-cyan-600" },
                        { label: "Campaigns", value: String(stats.totalCampaigns), icon: Mail, gradient: "from-purple-500 to-violet-600" },
                        { label: "Active", value: String(stats.activeCampaigns), icon: Send, gradient: "from-green-500 to-emerald-600" },
                        { label: "Total Sent", value: stats.totalSent.toLocaleString(), icon: Send, gradient: "from-amber-500 to-orange-600" },
                        { label: "Open Rate", value: `${stats.openRate}%`, icon: Eye, gradient: "from-cyan-500 to-blue-600" },
                        { label: "Click Rate", value: `${stats.clickRate}%`, icon: Target, gradient: "from-pink-500 to-rose-600" },
                    ].map(s => (
                        <div key={s.label} className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center`}>
                                    <s.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{s.value}</div>
                            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Campaign Form */}
            {showCreate && (
                <div className="bg-[#0f0f18] border border-green-500/20 rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-400" /> Create New Campaign
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Campaign Name *</label>
                            <input
                                className={inputClass}
                                placeholder="Summer Sale Blast"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Subject Line *</label>
                            <input
                                className={inputClass}
                                placeholder="Don't miss our biggest sale!"
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Preview Text</label>
                            <input
                                className={inputClass}
                                placeholder="Shop now and save up to 30%"
                                value={form.previewText}
                                onChange={e => setForm(f => ({ ...f, previewText: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Target Segment</label>
                            <select
                                className={`${inputClass} appearance-none`}
                                value={form.segment}
                                onChange={e => setForm(f => ({ ...f, segment: e.target.value }))}
                            >
                                {SEGMENT_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value} className="bg-[#0f0f18]">{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* HTML Content */}
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Email HTML Content *</label>
                        <textarea
                            className={`${inputClass} min-h-[200px] font-mono resize-y`}
                            placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                            value={form.htmlContent}
                            onChange={e => setForm(f => ({ ...f, htmlContent: e.target.value }))}
                        />
                    </div>

                    {/* Schedule Toggle */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.scheduleEnabled}
                                onChange={e => setForm(f => ({ ...f, scheduleEnabled: e.target.checked, scheduledAt: e.target.checked ? f.scheduledAt : "" }))}
                                className="rounded border-zinc-600 bg-white/5"
                            />
                            <CalendarClock size={14} className="text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">Schedule for Later</span>
                        </label>
                        {form.scheduleEnabled && (
                            <div className="mt-3">
                                <label className="text-xs text-zinc-500 mb-1 block">Send Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className={inputClass}
                                    value={form.scheduledAt}
                                    min={new Date().toISOString().slice(0, 16)}
                                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                                />
                                <p className="text-[10px] text-zinc-600 mt-1">Campaign will be automatically sent at the scheduled time.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={createCampaign}
                            disabled={!form.name || !form.subject || !form.htmlContent}
                            className="px-4 py-2 rounded-xl bg-green-600 text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {form.scheduleEnabled ? "Schedule Campaign" : "Create Campaign"}
                        </button>
                        {form.htmlContent && (
                            <button
                                onClick={() => { setPreviewHtml(form.htmlContent); setPreviewSubject(form.subject || "No subject"); setPreviewName("Campaign Preview"); }}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <Eye className="h-4 w-4" /> Preview
                            </button>
                        )}
                        <button
                            onClick={() => { setShowCreate(false); resetForm(); }}
                            className="px-4 py-2 text-zinc-500 text-sm hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Upcoming Scheduled Campaigns */}
            {scheduledCampaigns.length > 0 && (
                <div className="bg-[#0f0f18] border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CalendarClock size={14} className="text-blue-400" /> Upcoming Scheduled Campaigns
                    </h3>
                    <div className="space-y-2">
                        {scheduledCampaigns.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                <div>
                                    <span className="text-sm font-medium">{c.name}</span>
                                    <span className="text-xs text-zinc-500 ml-2">{c.subject}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                        <Clock size={10} />
                                        {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : ""}
                                    </span>
                                    <button
                                        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                                        onClick={() => { setRescheduleId(c.id); setRescheduleDate(c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : ""); }}
                                    >
                                        <RefreshCw size={12} />
                                    </button>
                                    <button
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        onClick={() => cancelCampaign(c.id)}
                                    >
                                        <XCircle size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Campaigns Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-semibold">All Campaigns</h2>
                    <span className="text-zinc-500 text-sm">{campaigns.length} total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                <th className="text-left px-6 py-3">Campaign</th>
                                <th className="text-left px-4 py-3">Subject</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-left px-4 py-3">Scheduled</th>
                                <th className="text-left px-4 py-3">Sent</th>
                                <th className="text-left px-4 py-3">Opens</th>
                                <th className="text-left px-4 py-3">Clicks</th>
                                <th className="text-left px-4 py-3">Created</th>
                                <th className="text-right px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-500">
                                        No campaigns yet. Create your first campaign above.
                                    </td>
                                </tr>
                            ) : campaigns.map(c => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3 font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-zinc-400 max-w-[200px] truncate">{c.subject}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${STATUS_STYLES[c.status] || STATUS_STYLES.DRAFT}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">
                                        {c.scheduledAt ? (
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} className="text-blue-400" />
                                                {new Date(c.scheduledAt).toLocaleString()}
                                            </span>
                                        ) : "--"}
                                    </td>
                                    <td className="px-4 py-3 text-zinc-400">{c.totalSent || 0}</td>
                                    <td className="px-4 py-3 text-zinc-400">{c.totalOpened || 0}</td>
                                    <td className="px-4 py-3 text-zinc-400">{c.totalClicked || 0}</td>
                                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-1.5 justify-end">
                                            {c.htmlContent && (
                                                <button
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                                                    title="Preview"
                                                    onClick={() => { setPreviewHtml(c.htmlContent); setPreviewSubject(c.subject); setPreviewName(c.name); }}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            {c.status === "DRAFT" && (
                                                <button
                                                    className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors text-green-400"
                                                    title="Send Now"
                                                    disabled={sending === c.id}
                                                    onClick={() => sendCampaign(c.id)}
                                                >
                                                    {sending === c.id ? (
                                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border border-green-400 border-t-transparent" />
                                                    ) : (
                                                        <Send size={14} />
                                                    )}
                                                </button>
                                            )}
                                            {c.status === "SCHEDULED" && (
                                                <>
                                                    <button
                                                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-amber-400"
                                                        title="Reschedule"
                                                        onClick={() => { setRescheduleId(c.id); setRescheduleDate(c.scheduledAt ? new Date(c.scheduledAt).toISOString().slice(0, 16) : ""); }}
                                                    >
                                                        <RefreshCw size={14} />
                                                    </button>
                                                    <button
                                                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400"
                                                        title="Cancel"
                                                        onClick={() => cancelCampaign(c.id)}
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                                                title="Duplicate"
                                                onClick={() => duplicateCampaign(c.id)}
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button
                                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400"
                                                title="Delete"
                                                onClick={() => deleteCampaign(c.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Email Marketing Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: "Preview First", desc: "Always preview your email before sending. Check formatting across devices." },
                        { title: "Segment Targeting", desc: "Use segments like VIP, Loyal, or At-Risk to personalize campaigns and boost engagement." },
                        { title: "Best Practices", desc: "Send during business hours. Keep subject lines under 50 chars. Include a clear CTA." },
                    ].map((tip, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4">
                            <p className="font-medium text-sm mb-1">{tip.title}</p>
                            <p className="text-xs text-zinc-500">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
