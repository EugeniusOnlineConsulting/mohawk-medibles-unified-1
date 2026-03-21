"use client";

/**
 * Email Analytics — Campaign performance, open/click rates, deliverability
 * Ported from mohawk-medibles2 EmailAnalyticsTab.tsx
 */

import { useState, useEffect, useMemo } from "react";
import {
    Mail, Send, CheckCircle, XCircle, AlertTriangle, TrendingUp,
    Users, Clock, BarChart3, Eye, MousePointerClick, RefreshCw,
} from "lucide-react";

interface CampaignAnalytics {
    id: string;
    name: string;
    subject: string;
    status: string;
    recipients: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    sentAt: string | null;
    createdAt: string;
}

interface AnalyticsData {
    overview: {
        totalCampaigns: number;
        totalSent: number;
        totalScheduled: number;
        totalDraft: number;
        avgOpenRate: number;
        avgClickRate: number;
        avgClickToOpenRate: number;
        totalRecipients: number;
        totalOpened: number;
        totalClicked: number;
        totalUnsubscribed: number;
    };
    campaigns: CampaignAnalytics[];
    timeline: { date: string; sent: number; opened: number; clicked: number; recipients: number }[];
    topPerformers: CampaignAnalytics[];
    audienceBreakdown: { audience: string; count: number; totalRecipients: number; totalOpened: number; totalClicked: number; avgOpenRate: number; avgClickRate: number }[];
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    SENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    SENT: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function EmailAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timelineRange, setTimelineRange] = useState(30);

    useEffect(() => {
        fetch("/api/admin/email/analytics/")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filteredTimeline = useMemo(() => {
        if (!data?.timeline) return [];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - timelineRange);
        return data.timeline.filter(d => new Date(d.date) >= cutoff);
    }, [data?.timeline, timelineRange]);

    const maxVolume = useMemo(() => {
        return Math.max(...filteredTimeline.map(d => d.recipients), 1);
    }, [filteredTimeline]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                Failed to load analytics data.
            </div>
        );
    }

    const ov = data.overview;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-7 w-7 text-green-400" /> Email Analytics
                </h1>
                <p className="text-zinc-500 mt-1">Campaign performance metrics, deliverability, and engagement tracking</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Campaigns", value: ov.totalCampaigns, icon: Mail, gradient: "from-blue-500 to-cyan-600" },
                    { label: "Total Recipients", value: ov.totalRecipients.toLocaleString(), icon: Users, gradient: "from-purple-500 to-violet-600" },
                    { label: "Avg Open Rate", value: `${ov.avgOpenRate}%`, icon: Eye, gradient: "from-green-500 to-emerald-600" },
                    { label: "Avg Click Rate", value: `${ov.avgClickRate}%`, icon: MousePointerClick, gradient: "from-amber-500 to-orange-600" },
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

            {/* Engagement Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Opened", value: ov.totalOpened.toLocaleString(), icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
                    { label: "Total Clicked", value: ov.totalClicked.toLocaleString(), icon: MousePointerClick, color: "text-cyan-400", bg: "bg-cyan-500/10" },
                    { label: "Click-to-Open", value: `${ov.avgClickToOpenRate}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Unsubscribed", value: ov.totalUnsubscribed, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/5`}>
                        <div className="flex items-center gap-2 mb-2">
                            <s.icon size={16} className={s.color} />
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Sent", count: ov.totalSent, color: "text-green-400", bg: "bg-green-500/10" },
                    { label: "Scheduled", count: ov.totalScheduled, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Drafts", count: ov.totalDraft, color: "text-zinc-400", bg: "bg-zinc-500/10" },
                    { label: "Total", count: ov.totalCampaigns, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-white/5`}>
                        <p className={`text-lg font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-[10px] text-zinc-500">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Chart */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-green-400" /> Campaign Volume
                        </h3>
                        <div className="flex gap-1">
                            {[7, 14, 30, 90].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setTimelineRange(d)}
                                    className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${timelineRange === d ? "bg-green-500/20 text-green-400 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                    {filteredTimeline.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
                            No campaign data for this period
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="flex items-end gap-1 h-40">
                                {filteredTimeline.map((day, i) => {
                                    const height = (day.recipients / maxVolume) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-[9px] text-zinc-400 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none border border-white/10">
                                                {day.date}: {day.recipients} recipients
                                            </div>
                                            <div className="w-full bg-green-500/40 rounded-t hover:bg-green-500/60 transition-colors" style={{ height: `${Math.max(height, 3)}%` }} />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-1">
                                {filteredTimeline.map((day, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        {(i === 0 || i === filteredTimeline.length - 1 || i % Math.ceil(filteredTimeline.length / 6) === 0) && (
                                            <span className="text-[8px] text-zinc-600">
                                                {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Audience Breakdown */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 mb-4">
                        <Users size={14} className="text-green-400" /> Audience Performance
                    </h3>
                    {data.audienceBreakdown.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
                            No audience data available
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {data.audienceBreakdown.map(a => (
                                <div key={a.audience}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-zinc-400 capitalize">{a.audience || "All Subscribers"}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold">{a.count} campaigns</span>
                                            <span className="text-[10px] text-zinc-500">{a.avgOpenRate}% open</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-green-500/60 transition-all" style={{ width: `${Math.min(a.avgOpenRate, 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Top Performers */}
            {data.topPerformers.length > 0 && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                    <h3 className="text-sm font-bold flex items-center gap-1.5 mb-4">
                        <TrendingUp size={14} className="text-green-400" /> Top Performing Campaigns
                    </h3>
                    <div className="space-y-2">
                        {data.topPerformers.map((c, i) => (
                            <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-zinc-600 w-5 text-right font-mono">#{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-medium">{c.name}</p>
                                        <p className="text-[10px] text-zinc-500">{c.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-right">
                                    <div>
                                        <p className="text-sm font-bold text-green-400">{c.openRate}%</p>
                                        <p className="text-[10px] text-zinc-600">Open Rate</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-cyan-400">{c.clickRate}%</p>
                                        <p className="text-[10px] text-zinc-600">Click Rate</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{c.recipients}</p>
                                        <p className="text-[10px] text-zinc-600">Recipients</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Campaigns Performance Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h3 className="font-semibold">Campaign Performance Detail</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                <th className="text-left px-6 py-3">Campaign</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Recipients</th>
                                <th className="text-right px-4 py-3">Opened</th>
                                <th className="text-right px-4 py-3">Open Rate</th>
                                <th className="text-right px-4 py-3">Clicked</th>
                                <th className="text-right px-4 py-3">Click Rate</th>
                                <th className="text-right px-4 py-3">CTO Rate</th>
                                <th className="text-right px-6 py-3">Sent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-500">
                                        No campaigns to analyze yet.
                                    </td>
                                </tr>
                            ) : data.campaigns.map(c => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-3">
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{c.subject}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${STATUS_COLORS[c.status] || STATUS_COLORS.DRAFT}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-zinc-400">{c.recipients}</td>
                                    <td className="px-4 py-3 text-right text-zinc-400">{c.opened}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={c.openRate > 20 ? "text-green-400 font-bold" : "text-zinc-400"}>
                                            {c.openRate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-zinc-400">{c.clicked}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={c.clickRate > 3 ? "text-cyan-400 font-bold" : "text-zinc-400"}>
                                            {c.clickRate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-zinc-400">{c.clickToOpenRate}%</td>
                                    <td className="px-6 py-3 text-right text-xs text-zinc-500">
                                        {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "--"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
