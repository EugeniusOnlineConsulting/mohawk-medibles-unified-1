"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowDown, ArrowRight, Users, UserPlus, ShoppingCart, TrendingUp, Clock, Award, BarChart3, Target } from "lucide-react";

interface AnalyticsData {
    funnel: { shares: number; signups: number; purchases: number; conversionRate: number };
    timeline: Array<{ date: string; shares: number; signups: number; purchases: number; points: number }>;
    topPerformers: Array<{
        userId: string; name: string; email: string;
        totalShares: number; completedPurchases: number; conversionRate: number; pointsEarned: number;
    }>;
    summary: { totalPointsAwarded: number; avgTimeToConvert: string; pendingReferrals: number };
}

export default function ReferralAnalyticsPage() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/referral-analytics/?days=${days}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [days]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-48 bg-white/5 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (!data) return <div className="text-zinc-500 text-center py-12">No analytics data available</div>;

    const { funnel, timeline, topPerformers, summary } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BarChart3 className="h-7 w-7 text-green-400" />
                        Referral Analytics
                    </h1>
                    <p className="text-white/60 mt-1">Track referral performance, conversion funnel, and top performers</p>
                </div>
                <select
                    value={days}
                    onChange={e => setDays(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={180}>Last 6 months</option>
                    <option value={365}>Last year</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard icon={<Award className="h-5 w-5" />} label="Points Awarded" value={summary.totalPointsAwarded.toLocaleString()} gradient="from-amber-500 to-orange-600" />
                <SummaryCard icon={<Clock className="h-5 w-5" />} label="Avg. Conversion Time" value={summary.avgTimeToConvert} gradient="from-blue-500 to-indigo-600" />
                <SummaryCard icon={<Target className="h-5 w-5" />} label="Conversion Rate" value={`${funnel.conversionRate}%`} gradient="from-green-500 to-emerald-600" />
                <SummaryCard icon={<Users className="h-5 w-5" />} label="Pending Referrals" value={String(summary.pendingReferrals)} gradient="from-purple-500 to-violet-600" />
            </div>

            {/* Conversion Funnel */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-1">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Conversion Funnel
                </h2>
                <p className="text-xs text-zinc-500 mb-6">Track how referrals progress from shares to purchases</p>
                <div className="flex items-center justify-center gap-2 md:gap-6 py-4">
                    <FunnelStep icon={<Users className="h-8 w-8" />} label="Shares" value={funnel.shares} color="from-blue-500 to-blue-600" percentage={100} />
                    <ArrowRight className="h-6 w-6 text-zinc-600 shrink-0 hidden md:block" />
                    <ArrowDown className="h-6 w-6 text-zinc-600 shrink-0 md:hidden" />
                    <FunnelStep icon={<UserPlus className="h-8 w-8" />} label="Sign-ups" value={funnel.signups} color="from-amber-500 to-orange-600" percentage={funnel.shares > 0 ? Math.round((funnel.signups / funnel.shares) * 100) : 0} />
                    <ArrowRight className="h-6 w-6 text-zinc-600 shrink-0 hidden md:block" />
                    <ArrowDown className="h-6 w-6 text-zinc-600 shrink-0 md:hidden" />
                    <FunnelStep icon={<ShoppingCart className="h-8 w-8" />} label="Purchases" value={funnel.purchases} color="from-green-500 to-emerald-600" percentage={funnel.shares > 0 ? Math.round((funnel.purchases / funnel.shares) * 100) : 0} />
                </div>
                <div className="flex justify-center gap-8 md:gap-16 text-sm text-zinc-500 mt-4">
                    <span>Share -&gt; Signup: <strong className="text-white">{funnel.shares > 0 ? Math.round((funnel.signups / funnel.shares) * 100) : 0}%</strong></span>
                    <span>Signup -&gt; Purchase: <strong className="text-white">{funnel.signups > 0 ? Math.round((funnel.purchases / funnel.signups) * 100) : 0}%</strong></span>
                </div>
            </div>

            {/* Timeline Chart */}
            <TimelineChart timeline={timeline} />

            {/* Top Performers */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5 text-amber-400" />
                        Top Performers
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">Referrers with the highest conversion rates</p>
                </div>
                {topPerformers.length === 0 ? (
                    <p className="text-zinc-500 text-center py-12">No referral data in this period</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                    <th className="text-left pb-3 pt-4 pl-6 w-12">#</th>
                                    <th className="text-left pb-3 pt-4">Referrer</th>
                                    <th className="text-center pb-3 pt-4">Shares</th>
                                    <th className="text-center pb-3 pt-4">Purchases</th>
                                    <th className="text-center pb-3 pt-4">Conv. Rate</th>
                                    <th className="text-right pb-3 pt-4 pr-6">Points Earned</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPerformers.map((p, i) => (
                                    <tr key={p.userId} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3 pl-6 font-bold">
                                            {i === 0 ? "\ud83e\udd47" : i === 1 ? "\ud83e\udd48" : i === 2 ? "\ud83e\udd49" : `${i + 1}`}
                                        </td>
                                        <td className="py-3">
                                            <div className="font-medium text-sm">{p.name}</div>
                                            <div className="text-xs text-zinc-500">{p.email}</div>
                                        </td>
                                        <td className="py-3 text-center text-sm">{p.totalShares}</td>
                                        <td className="py-3 text-center text-sm">{p.completedPurchases}</td>
                                        <td className="py-3 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${
                                                p.conversionRate >= 50
                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                    : p.conversionRate >= 25
                                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                                    : "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                                            }`}>
                                                {p.conversionRate}%
                                            </span>
                                        </td>
                                        <td className="py-3 text-right pr-6 font-bold text-sm text-green-400">{p.pointsEarned.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: string; gradient: string }) {
    return (
        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
        </div>
    );
}

function FunnelStep({ icon, label, value, color, percentage }: {
    icon: React.ReactNode; label: string; value: number; color: string; percentage: number;
}) {
    return (
        <div className="flex flex-col items-center gap-2 p-4 md:p-6 rounded-xl bg-white/5 border border-white/10 min-w-[100px] md:min-w-[140px]">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                {icon}
            </div>
            <span className="text-2xl md:text-3xl font-bold">{value}</span>
            <span className="text-sm font-medium text-zinc-400">{label}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-zinc-300">{percentage}%</span>
        </div>
    );
}

function TimelineChart({ timeline }: { timeline: Array<{ date: string; shares: number; signups: number; purchases: number; points: number }> }) {
    const [metric, setMetric] = useState<'shares' | 'signups' | 'purchases' | 'points'>('shares');

    const maxVal = useMemo(() => Math.max(1, ...timeline.map(d => d[metric])), [timeline, metric]);

    const displayData = useMemo(() => {
        if (timeline.length <= 30) return timeline;
        const step = Math.ceil(timeline.length / 30);
        const aggregated: typeof timeline = [];
        for (let i = 0; i < timeline.length; i += step) {
            const chunk = timeline.slice(i, i + step);
            aggregated.push({
                date: chunk[0].date + (chunk.length > 1 ? ` - ${chunk[chunk.length - 1].date.slice(5)}` : ''),
                shares: chunk.reduce((s, d) => s + d.shares, 0),
                signups: chunk.reduce((s, d) => s + d.signups, 0),
                purchases: chunk.reduce((s, d) => s + d.purchases, 0),
                points: chunk.reduce((s, d) => s + d.points, 0),
            });
        }
        return aggregated;
    }, [timeline]);

    const metricColors: Record<string, string> = {
        shares: 'bg-blue-500',
        signups: 'bg-amber-500',
        purchases: 'bg-green-500',
        points: 'bg-purple-500',
    };

    const total = useMemo(() => timeline.reduce((s, d) => s + d[metric], 0), [timeline, metric]);

    return (
        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-semibold text-lg">Activity Timeline</h2>
                    <p className="text-xs text-zinc-500 mt-1">Total: <strong className="text-white">{total.toLocaleString()}</strong> {metric} in this period</p>
                </div>
                <div className="flex gap-1">
                    {(['shares', 'signups', 'purchases', 'points'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setMetric(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                                metric === m ? 'bg-white/15 text-white' : 'bg-white/5 text-zinc-500 hover:bg-white/10'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-end gap-[2px] h-[200px]">
                {displayData.map((d, i) => {
                    const height = maxVal > 0 ? (d[metric] / maxVal) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
                            <div
                                className={`w-full rounded-t ${metricColors[metric]} opacity-60 hover:opacity-100 transition-opacity min-h-[2px]`}
                                style={{ height: `${Math.max(height, 1)}%` }}
                            />
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                <div className="bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl px-3 py-2 text-xs whitespace-nowrap">
                                    <div className="font-medium">{d.date}</div>
                                    <div className="text-zinc-400">{metric}: {d[metric].toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-600">
                <span>{displayData[0]?.date.slice(5)}</span>
                {displayData.length > 2 && <span>{displayData[Math.floor(displayData.length / 2)]?.date.slice(5)}</span>}
                <span>{displayData[displayData.length - 1]?.date.slice(5)}</span>
            </div>
        </div>
    );
}
