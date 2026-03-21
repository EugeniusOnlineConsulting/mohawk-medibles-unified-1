"use client";

import { useState, useEffect, useMemo } from "react";
import {
    BarChart3, TrendingUp, Mail, MousePointerClick, Eye, Users,
    ArrowUpRight, ArrowDownRight, ChevronRight, Calendar, Target,
    Loader2, RefreshCw, GitCompare, Trophy, Minus, ArrowRight,
} from "lucide-react";

const cardClass = "bg-[#0f0f18] border border-white/5 rounded-2xl";
const badgeClass = "text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full";

function MetricCard({ label, value, subValue, icon: Icon, color, trend }: {
    label: string; value: string | number; subValue?: string;
    icon: any; color: string; trend?: number;
}) {
    return (
        <div className={`${cardClass} p-5`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend !== undefined && trend !== 0 && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-green-400" : "text-red-500"}`}>
                        {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs text-zinc-500 mt-1">{label}</p>
            {subValue && <p className="text-[10px] text-zinc-600 mt-0.5">{subValue}</p>}
        </div>
    );
}

function BarChartSimple({ data, labelKey, valueKey, color = "bg-green-500", height = 160 }: {
    data: any[]; labelKey: string; valueKey: string; color?: string; height?: number;
}) {
    const max = Math.max(...data.map(d => d[valueKey] || 0), 1);

    return (
        <div className="relative" style={{ height }}>
            <div className="absolute inset-0 flex items-end justify-between gap-1 px-1">
                {data.map((d, i) => {
                    const val = d[valueKey] || 0;
                    const pct = max > 0 ? (val / max) * 100 : 0;
                    return (
                        <div key={i} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full flex justify-center mb-1">
                                <div
                                    className={`${color} rounded-t-md w-full min-w-[6px] transition-all duration-300 hover:opacity-80`}
                                    style={{ height: `${Math.max(pct * (height - 30) / 100, 2)}px` }}
                                />
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {val}
                                </div>
                            </div>
                            <span className="text-[8px] text-zinc-600 truncate w-full text-center leading-tight">
                                {d[labelKey]?.slice(5) || ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function HorizontalBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
    const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 w-24 truncate capitalize">{label}</span>
            <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 1)}%` }} />
            </div>
            <span className="text-xs font-semibold text-zinc-300 w-12 text-right">{value.toFixed(1)}%</span>
        </div>
    );
}

function ComparisonMetricRow({ label, valueA, valueB, delta, winner, unit = "%", lowerIsBetter = false }: {
    label: string; valueA: number; valueB: number; delta: number;
    winner: "a" | "b" | "tie"; unit?: string; lowerIsBetter?: boolean;
}) {
    const deltaColor = delta === 0 ? "text-zinc-500" : (lowerIsBetter ? delta < 0 : delta > 0) ? "text-green-400" : "text-red-500";
    return (
        <div className="grid grid-cols-[1fr_100px_60px_100px_1fr] items-center gap-2 py-3 border-b border-white/5 last:border-0">
            <div className={`text-right ${winner === "a" ? "font-bold text-white" : "text-zinc-400"}`}>
                <span className="text-lg">{valueA}{unit}</span>
                {winner === "a" && <Trophy className="w-3.5 h-3.5 text-amber-500 inline ml-1.5" />}
            </div>
            <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
            </div>
            <div className={`text-center text-xs font-semibold ${deltaColor}`}>
                {delta > 0 ? "+" : ""}{delta}{unit}
            </div>
            <div className="text-center">
                <p className="text-xs text-zinc-600">vs</p>
            </div>
            <div className={`${winner === "b" ? "font-bold text-white" : "text-zinc-400"}`}>
                <span className="text-lg">{valueB}{unit}</span>
                {winner === "b" && <Trophy className="w-3.5 h-3.5 text-amber-500 inline ml-1.5" />}
            </div>
        </div>
    );
}

export default function CampaignAnalyticsPage() {
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [view, setView] = useState<"overview" | "detail" | "compare">("overview");
    const [compareA, setCompareA] = useState<string | null>(null);
    const [compareB, setCompareB] = useState<string | null>(null);

    const [dashboard, setDashboard] = useState<any>(null);
    const [detail, setDetail] = useState<any>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [comparisonLoading, setComparisonLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch("/api/admin/analytics/campaigns?action=dashboard")
            .then(r => r.json())
            .then(data => { setDashboard(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedCampaignId) return;
        setDetailLoading(true);
        fetch(`/api/admin/analytics/campaigns?action=detail&id=${selectedCampaignId}`)
            .then(r => r.json())
            .then(data => { setDetail(data); setDetailLoading(false); })
            .catch(() => setDetailLoading(false));
    }, [selectedCampaignId]);

    useEffect(() => {
        if (!compareA || !compareB || compareA === compareB) return;
        setComparisonLoading(true);
        fetch(`/api/admin/analytics/campaigns?action=compare&idA=${compareA}&idB=${compareB}`)
            .then(r => r.json())
            .then(data => { setComparison(data); setComparisonLoading(false); })
            .catch(() => setComparisonLoading(false));
    }, [compareA, compareB]);

    const overview = dashboard?.overview;
    const campaigns = dashboard?.campaigns || [];
    const timeline = dashboard?.timeline || [];
    const topPerformers = dashboard?.topPerformers || [];

    const sentCampaigns = useMemo(() => campaigns.filter((c: any) => c.status === "sent" && c.recipients > 0), [campaigns]);

    const refetch = () => {
        setLoading(true);
        fetch("/api/admin/analytics/campaigns?action=dashboard")
            .then(r => r.json())
            .then(data => { setDashboard(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                <span className="ml-2 text-zinc-500">Loading campaign analytics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-500" />
                        Campaign Performance
                    </h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Track open rates, click rates, and engagement across all campaigns</p>
                </div>
                <div className="flex gap-2">
                    {sentCampaigns.length >= 2 && (
                        <button
                            onClick={() => { setView("compare"); setCompareA(null); setCompareB(null); setComparison(null); }}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/10 transition-colors"
                        >
                            <GitCompare className="w-3.5 h-3.5" />
                            Compare
                        </button>
                    )}
                    <button onClick={refetch} className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>
            </div>

            {view === "overview" && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard label="Total Campaigns" value={overview?.totalCampaigns || 0} subValue={`${overview?.totalSent || 0} sent, ${overview?.totalDraft || 0} draft`} icon={Mail} color="bg-green-500/10 text-green-400" />
                        <MetricCard label="Avg Open Rate" value={`${overview?.avgOpenRate || 0}%`} subValue={`${overview?.totalOpened || 0} total opens`} icon={Eye} color="bg-blue-500/10 text-blue-400" />
                        <MetricCard label="Avg Click Rate" value={`${overview?.avgClickRate || 0}%`} subValue={`${overview?.totalClicked || 0} total clicks`} icon={MousePointerClick} color="bg-green-500/10 text-green-400" />
                        <MetricCard label="Total Recipients" value={(overview?.totalRecipients || 0).toLocaleString()} subValue={`${overview?.avgClickToOpenRate || 0}% click-to-open`} icon={Users} color="bg-amber-500/10 text-amber-400" />
                    </div>

                    {/* Timeline Chart */}
                    {timeline.length > 0 && (
                        <div className={`${cardClass} p-5`}>
                            <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Campaign Activity Timeline
                            </h3>
                            <p className="text-xs text-zinc-600 mb-4">Emails sent per day</p>
                            <BarChartSimple data={timeline} labelKey="date" valueKey="recipients" color="bg-green-500" height={140} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Performers */}
                        <div className={`${cardClass} p-5`}>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-green-400" />
                                Top Performing Campaigns
                            </h3>
                            {topPerformers.length > 0 ? (
                                <div className="space-y-3">
                                    {topPerformers.map((c: any, i: number) => (
                                        <button
                                            key={c.id}
                                            onClick={() => { setSelectedCampaignId(c.id); setView("detail"); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors text-left group"
                                        >
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-zinc-500/20 text-zinc-400" : "bg-orange-500/20 text-orange-400"
                                            }`}>
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{c.name}</p>
                                                <p className="text-[10px] text-zinc-600">{c.recipients} recipients</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-green-400">{c.openRate}%</p>
                                                <p className="text-[10px] text-zinc-600">open rate</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-600 text-center py-6">No sent campaigns yet</p>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className={`${cardClass} p-5`}>
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" />
                                Campaign Summary
                            </h3>
                            {sentCampaigns.length > 0 ? (
                                <div className="space-y-4">
                                    <HorizontalBar label="Avg Open Rate" value={overview?.avgOpenRate || 0} maxValue={100} color="bg-blue-500" />
                                    <HorizontalBar label="Avg Click Rate" value={overview?.avgClickRate || 0} maxValue={100} color="bg-green-500" />
                                    <HorizontalBar label="Click-to-Open" value={overview?.avgClickToOpenRate || 0} maxValue={100} color="bg-amber-500" />
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-600 text-center py-6">No campaign data yet</p>
                            )}
                        </div>
                    </div>

                    {/* Campaign Table */}
                    <div className={`${cardClass} overflow-hidden`}>
                        <div className="p-5 border-b border-white/5">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                All Campaigns
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                                        <th className="text-left px-5 py-3 font-semibold">Campaign</th>
                                        <th className="text-left px-3 py-3 font-semibold">Status</th>
                                        <th className="text-right px-3 py-3 font-semibold">Recipients</th>
                                        <th className="text-right px-3 py-3 font-semibold">Open Rate</th>
                                        <th className="text-right px-3 py-3 font-semibold">Click Rate</th>
                                        <th className="text-right px-3 py-3 font-semibold">CTO Rate</th>
                                        <th className="text-right px-5 py-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {campaigns.map((c: any) => {
                                        const statusColors: Record<string, string> = {
                                            sent: "text-green-400 bg-green-500/10 border-green-500/30",
                                            draft: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
                                            scheduled: "text-blue-400 bg-blue-500/10 border-blue-500/30",
                                            sending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                                            cancelled: "text-red-400 bg-red-500/10 border-red-500/30",
                                        };
                                        return (
                                            <tr
                                                key={c.id}
                                                className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                                                onClick={() => { setSelectedCampaignId(c.id); setView("detail"); }}
                                            >
                                                <td className="px-5 py-3">
                                                    <p className="font-semibold truncate max-w-[200px]">{c.name}</p>
                                                    <p className="text-[10px] text-zinc-600 truncate max-w-[200px]">{c.subject}</p>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className={`${badgeClass} border ${statusColors[c.status] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/30"}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right font-medium">{c.recipients.toLocaleString()}</td>
                                                <td className="px-3 py-3 text-right">
                                                    <span className={`font-semibold ${c.openRate > 20 ? "text-green-400" : c.openRate > 10 ? "text-amber-400" : "text-zinc-500"}`}>
                                                        {c.openRate}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <span className={`font-semibold ${c.clickRate > 5 ? "text-green-400" : c.clickRate > 2 ? "text-amber-400" : "text-zinc-500"}`}>
                                                        {c.clickRate}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-right font-medium text-zinc-400">{c.clickToOpenRate}%</td>
                                                <td className="px-5 py-3 text-right text-zinc-500 text-xs">
                                                    {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : c.scheduledAt ? `Sched: ${new Date(c.scheduledAt).toLocaleDateString()}` : "--"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {campaigns.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-10 text-zinc-500">No campaigns found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Campaign Detail View */}
            {view === "detail" && (
                <div>
                    <button
                        onClick={() => { setView("overview"); setSelectedCampaignId(null); setDetail(null); }}
                        className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 mb-4 transition-colors"
                    >
                        ← Back to Overview
                    </button>

                    {detailLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                        </div>
                    ) : detail ? (
                        <div className="space-y-6">
                            <div className={`${cardClass} p-6`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-black">{detail.name}</h3>
                                        <p className="text-sm text-zinc-500">{detail.subject}</p>
                                    </div>
                                    <span className={`${badgeClass} border ${
                                        detail.status === "sent" ? "text-green-400 bg-green-500/10 border-green-500/30" : "text-zinc-400 bg-zinc-500/10 border-zinc-500/30"
                                    }`}>
                                        {detail.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-4 bg-white/[0.03] rounded-lg">
                                        <p className="text-2xl font-black">{detail.recipients.toLocaleString()}</p>
                                        <p className="text-xs text-zinc-500">Recipients</p>
                                    </div>
                                    <div className="p-4 bg-blue-500/5 rounded-lg">
                                        <p className="text-2xl font-black text-blue-400">{detail.openRate}%</p>
                                        <p className="text-xs text-blue-400">Open Rate</p>
                                        <p className="text-[10px] text-blue-400/60">{detail.opened} opens</p>
                                    </div>
                                    <div className="p-4 bg-green-500/5 rounded-lg">
                                        <p className="text-2xl font-black text-green-400">{detail.clickRate}%</p>
                                        <p className="text-xs text-green-400">Click Rate</p>
                                        <p className="text-[10px] text-green-400/60">{detail.clicked} clicks</p>
                                    </div>
                                    <div className="p-4 bg-amber-500/5 rounded-lg">
                                        <p className="text-2xl font-black text-amber-400">{detail.clickToOpenRate}%</p>
                                        <p className="text-xs text-amber-400">Click-to-Open</p>
                                        <p className="text-[10px] text-amber-400/60">{detail.bounced || 0} bounced</p>
                                    </div>
                                </div>
                            </div>

                            {/* Engagement Funnel */}
                            <div className={`${cardClass} p-5`}>
                                <h4 className="text-sm font-bold mb-4">Engagement Funnel</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: "Delivered", value: detail.recipients, pct: 100, color: "bg-green-500" },
                                        { label: "Opened", value: detail.opened, pct: detail.openRate, color: "bg-blue-500" },
                                        { label: "Clicked", value: detail.clicked, pct: detail.clickRate, color: "bg-green-500" },
                                    ].map(step => (
                                        <div key={step.label} className="flex items-center gap-3">
                                            <span className="text-xs text-zinc-400 w-20">{step.label}</span>
                                            <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden relative">
                                                <div className={`${step.color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.max(step.pct, 0.5)}%` }} />
                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                                                    {step.value.toLocaleString()} ({step.pct}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className={`${cardClass} p-5`}>
                                <h4 className="text-sm font-bold mb-3">Campaign Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-zinc-600 text-xs">Audience</span>
                                        <p className="font-medium capitalize">{detail.audience}</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 text-xs">Sent At</span>
                                        <p className="font-medium">{detail.sentAt ? new Date(detail.sentAt).toLocaleString() : "--"}</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 text-xs">Unsubscribe Rate</span>
                                        <p className="font-medium">{detail.unsubscribeRate || 0}%</p>
                                    </div>
                                    <div>
                                        <span className="text-zinc-600 text-xs">Created</span>
                                        <p className="font-medium">{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : "--"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-zinc-500">Campaign not found</div>
                    )}
                </div>
            )}

            {/* Campaign Comparison View */}
            {view === "compare" && (
                <div>
                    <button
                        onClick={() => { setView("overview"); setCompareA(null); setCompareB(null); setComparison(null); }}
                        className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 mb-4 transition-colors"
                    >
                        ← Back to Overview
                    </button>

                    <div className={`${cardClass} p-6 mb-6`}>
                        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <GitCompare className="w-4 h-4 text-green-500" />
                            Select Two Campaigns to Compare
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Campaign A</label>
                                <select
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-green-500/50"
                                    value={compareA || ""}
                                    onChange={e => setCompareA(e.target.value || null)}
                                >
                                    <option value="">Select a campaign...</option>
                                    {sentCampaigns.filter((c: any) => c.id !== compareB).map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.recipients} recipients, {c.openRate}% open)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-1.5">Campaign B</label>
                                <select
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-green-500/50"
                                    value={compareB || ""}
                                    onChange={e => setCompareB(e.target.value || null)}
                                >
                                    <option value="">Select a campaign...</option>
                                    {sentCampaigns.filter((c: any) => c.id !== compareA).map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name} ({c.recipients} recipients, {c.openRate}% open)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {comparisonLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                            <span className="ml-2 text-zinc-500">Comparing campaigns...</span>
                        </div>
                    )}

                    {comparison && (
                        <div className="space-y-6">
                            {/* Overall Winner Banner */}
                            <div className={`${cardClass} p-5 ${
                                comparison.overallWinner === "tie" ? "" :
                                comparison.overallWinner === "a" ? "border-blue-500/30" : "border-purple-500/30"
                            }`}>
                                <div className="flex items-center justify-center gap-3">
                                    {comparison.overallWinner === "tie" ? (
                                        <>
                                            <Minus className="w-5 h-5 text-zinc-500" />
                                            <span className="text-lg font-bold text-zinc-400">It's a Tie</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="w-6 h-6 text-amber-500" />
                                            <span className="text-lg font-bold">
                                                {comparison.overallWinner === "a" ? comparison.campaignA.name : comparison.campaignB.name}
                                            </span>
                                            <span className="text-sm text-zinc-500">wins overall</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Campaign Headers */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`${cardClass} p-5 ${comparison.overallWinner === "a" ? "ring-2 ring-blue-500/50" : ""}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded">A</span>
                                        {comparison.overallWinner === "a" && <Trophy className="w-4 h-4 text-amber-500" />}
                                    </div>
                                    <h4 className="text-sm font-bold truncate">{comparison.campaignA.name}</h4>
                                    <p className="text-[10px] text-zinc-600 truncate">{comparison.campaignA.subject}</p>
                                    <p className="text-[10px] text-zinc-600 mt-1">
                                        {comparison.campaignA.sentAt ? new Date(comparison.campaignA.sentAt).toLocaleDateString() : "--"}
                                        {" -- "}{comparison.campaignA.audience}
                                    </p>
                                </div>
                                <div className={`${cardClass} p-5 ${comparison.overallWinner === "b" ? "ring-2 ring-purple-500/50" : ""}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">B</span>
                                        {comparison.overallWinner === "b" && <Trophy className="w-4 h-4 text-amber-500" />}
                                    </div>
                                    <h4 className="text-sm font-bold truncate">{comparison.campaignB.name}</h4>
                                    <p className="text-[10px] text-zinc-600 truncate">{comparison.campaignB.subject}</p>
                                    <p className="text-[10px] text-zinc-600 mt-1">
                                        {comparison.campaignB.sentAt ? new Date(comparison.campaignB.sentAt).toLocaleDateString() : "--"}
                                        {" -- "}{comparison.campaignB.audience}
                                    </p>
                                </div>
                            </div>

                            {/* Side-by-Side Metrics */}
                            <div className={`${cardClass} p-6`}>
                                <h4 className="text-sm font-bold mb-4 text-center">Metric Comparison</h4>
                                <ComparisonMetricRow label="Open Rate" valueA={comparison.campaignA.openRate} valueB={comparison.campaignB.openRate} delta={comparison.deltas.openRate} winner={comparison.winners.openRate} />
                                <ComparisonMetricRow label="Click Rate" valueA={comparison.campaignA.clickRate} valueB={comparison.campaignB.clickRate} delta={comparison.deltas.clickRate} winner={comparison.winners.clickRate} />
                                <ComparisonMetricRow label="CTO Rate" valueA={comparison.campaignA.clickToOpenRate} valueB={comparison.campaignB.clickToOpenRate} delta={comparison.deltas.clickToOpenRate} winner={comparison.winners.clickToOpenRate} />
                                <ComparisonMetricRow label="Unsub Rate" valueA={comparison.campaignA.unsubscribeRate} valueB={comparison.campaignB.unsubscribeRate} delta={comparison.deltas.unsubscribeRate} winner={comparison.winners.unsubscribeRate} lowerIsBetter />
                            </div>

                            {/* Volume Comparison */}
                            <div className={`${cardClass} p-6`}>
                                <h4 className="text-sm font-bold mb-4">Volume Comparison</h4>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: "Recipients", a: comparison.campaignA.recipients, b: comparison.campaignB.recipients, delta: comparison.deltas.recipients },
                                        { label: "Opened", a: comparison.campaignA.opened, b: comparison.campaignB.opened, delta: comparison.deltas.opened },
                                        { label: "Clicked", a: comparison.campaignA.clicked, b: comparison.campaignB.clicked, delta: comparison.deltas.clicked },
                                        { label: "Unsubscribed", a: comparison.campaignA.unsubscribed, b: comparison.campaignB.unsubscribed, delta: comparison.deltas.unsubscribed },
                                    ].map(m => (
                                        <div key={m.label} className="text-center p-3 bg-white/[0.03] rounded-lg">
                                            <p className="text-xs text-zinc-500 mb-2">{m.label}</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-sm font-bold text-blue-400">{m.a.toLocaleString()}</span>
                                                <ArrowRight className="w-3 h-3 text-zinc-600" />
                                                <span className="text-sm font-bold text-purple-400">{m.b.toLocaleString()}</span>
                                            </div>
                                            <p className={`text-[10px] mt-1 font-semibold ${
                                                m.delta === 0 ? "text-zinc-500" : m.delta > 0 ? "text-green-400" : "text-red-500"
                                            }`}>
                                                {m.delta > 0 ? "+" : ""}{m.delta.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {compareA && compareB && compareA === compareB && (
                        <div className="text-center py-10 text-amber-400 text-sm">Please select two different campaigns to compare.</div>
                    )}

                    {(!compareA || !compareB) && !comparisonLoading && (
                        <div className="text-center py-16 text-zinc-500">
                            <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select two campaigns above to see a side-by-side comparison</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
