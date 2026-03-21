"use client";

import { useState, useEffect } from "react";
import {
    Globe, Users, Clock, Eye, MousePointerClick, ShoppingCart,
    TrendingUp, Monitor, Smartphone, Tablet, Search, MapPin,
    ArrowRight, ChevronDown, ChevronUp, Activity, BarChart3,
    Laptop, X,
} from "lucide-react";

const cardClass = "bg-[#0f0f18] border border-white/5 rounded-2xl p-5";
const badgeClass = "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border";

function formatDuration(secs: number) {
    if (!secs) return "0s";
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remSecs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
}

function formatTimeAgo(date: string | Date) {
    const d = new Date(date);
    const now = Date.now();
    const diff = now - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
}

function DeviceIcon({ device }: { device: string }) {
    if (device === "Mobile") return <Smartphone size={14} />;
    if (device === "Tablet") return <Tablet size={14} />;
    return <Monitor size={14} />;
}

export default function VisitorAnalyticsPage() {
    const [days, setDays] = useState(30);
    const [search, setSearch] = useState("");
    const [showVisitorList, setShowVisitorList] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");

    const [analytics, setAnalytics] = useState<any>(null);
    const [visitors, setVisitors] = useState<any>(null);
    const [customers, setCustomers] = useState<any>(null);
    const [customerDetail, setCustomerDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/analytics/visitors?action=overview&days=${days}`)
            .then(r => r.json())
            .then(data => { setAnalytics(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [days]);

    useEffect(() => {
        if (!showVisitorList) return;
        fetch(`/api/admin/analytics/visitors?action=sessions&days=${days}&search=${search}`)
            .then(r => r.json())
            .then(data => setVisitors(data))
            .catch(() => {});
    }, [showVisitorList, days, search]);

    useEffect(() => {
        fetch(`/api/admin/analytics/visitors?action=customer-list&search=${customerSearch}`)
            .then(r => r.json())
            .then(data => setCustomers(data))
            .catch(() => {});
    }, [customerSearch]);

    useEffect(() => {
        if (!selectedCustomerId) { setCustomerDetail(null); return; }
        fetch(`/api/admin/analytics/visitors?action=customer-detail&userId=${selectedCustomerId}`)
            .then(r => r.json())
            .then(data => setCustomerDetail(data))
            .catch(() => {});
    }, [selectedCustomerId]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`${cardClass} animate-pulse`}>
                            <div className="h-4 bg-white/5 rounded w-20 mb-3" />
                            <div className="h-8 bg-white/5 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with time range */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity size={20} className="text-green-400" />
                    Visitor Analytics
                </h2>
                <div className="flex items-center gap-2">
                    {[7, 14, 30, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                days === d
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-white/5 text-zinc-500 hover:text-zinc-300 border border-white/10"
                            }`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Sessions", value: analytics?.totalVisitors || 0, icon: Eye, color: "text-blue-400" },
                    { label: "Unique Visitors", value: analytics?.uniqueIPs || 0, icon: Users, color: "text-purple-400" },
                    { label: "Avg Duration", value: formatDuration(analytics?.avgDuration || 0), icon: Clock, color: "text-amber-400" },
                    { label: "Avg Pages/Visit", value: analytics?.avgPages || "0.0", icon: BarChart3, color: "text-green-400" },
                ].map((stat, i) => (
                    <div key={i} className={cardClass}>
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon size={16} className={stat.color} />
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                        </div>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart size={16} className="text-amber-400" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Cart Adds</p>
                    </div>
                    <p className="text-3xl font-black text-amber-400">{analytics?.cartAdds || 0}</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={16} className="text-green-400" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Conversions</p>
                    </div>
                    <p className="text-3xl font-black text-green-400">{analytics?.conversions || 0}</p>
                </div>
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-1">
                        <MousePointerClick size={16} className="text-green-500" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Conversion Rate</p>
                    </div>
                    <p className="text-3xl font-black text-green-500">{analytics?.conversionRate || "0.0"}%</p>
                </div>
            </div>

            {/* Daily Visits Chart */}
            {analytics?.dailyVisits && analytics.dailyVisits.length > 0 && (
                <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Daily Visits</h3>
                    <div className="h-40 flex items-end gap-1">
                        {analytics.dailyVisits.map((d: any, i: number) => {
                            const maxVisits = Math.max(...analytics.dailyVisits.map((v: any) => v.visits));
                            const height = maxVisits > 0 ? (d.visits / maxVisits) * 100 : 0;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="absolute -top-8 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {d.date}: {d.visits} visits ({d.uniqueVisitors} unique)
                                    </div>
                                    <div
                                        className="w-full bg-green-500/60 rounded-t hover:bg-green-500/80 transition-colors"
                                        style={{ height: `${Math.max(height, 2)}%` }}
                                    />
                                    {i % Math.ceil(analytics.dailyVisits.length / 7) === 0 && (
                                        <span className="text-[8px] text-zinc-500">{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Geography & Technology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Globe size={16} className="text-green-400" /> Top Countries
                    </h3>
                    <div className="space-y-2">
                        {analytics?.topCountries?.map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                <span className="text-sm">{c.country || "Unknown"}</span>
                                <span className="text-xs font-bold text-green-400">{c.visits}</span>
                            </div>
                        ))}
                        {(!analytics?.topCountries || analytics.topCountries.length === 0) && (
                            <p className="text-zinc-500 text-sm text-center py-4">No location data yet</p>
                        )}
                    </div>
                </div>

                {/* Top Cities */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MapPin size={16} className="text-purple-400" /> Top Cities
                    </h3>
                    <div className="space-y-2">
                        {analytics?.topCities?.map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                <div>
                                    <span className="text-sm">{c.city || "Unknown"}</span>
                                    <span className="text-[10px] text-zinc-500 ml-2">{c.region}, {c.country}</span>
                                </div>
                                <span className="text-xs font-bold text-purple-400">{c.visits}</span>
                            </div>
                        ))}
                        {(!analytics?.topCities || analytics.topCities.length === 0) && (
                            <p className="text-zinc-500 text-sm text-center py-4">No city data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Device & Browser & Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Devices */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Laptop size={16} className="text-blue-400" /> Devices
                    </h3>
                    <div className="space-y-3">
                        {analytics?.deviceBreakdown?.map((d: any, i: number) => {
                            const total = analytics.deviceBreakdown.reduce((s: number, v: any) => s + v.visits, 0);
                            const pct = total > 0 ? ((d.visits / total) * 100).toFixed(1) : "0";
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm flex items-center gap-2">
                                            <DeviceIcon device={d.device || "Desktop"} />
                                            {d.device || "Unknown"}
                                        </span>
                                        <span className="text-xs text-zinc-500">{pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        {(!analytics?.deviceBreakdown || analytics.deviceBreakdown.length === 0) && (
                            <p className="text-zinc-500 text-sm text-center py-4">No device data yet</p>
                        )}
                    </div>
                </div>

                {/* Browsers */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Globe size={16} className="text-amber-400" /> Browsers
                    </h3>
                    <div className="space-y-3">
                        {analytics?.browserBreakdown?.map((b: any, i: number) => {
                            const total = analytics.browserBreakdown.reduce((s: number, v: any) => s + v.visits, 0);
                            const pct = total > 0 ? ((b.visits / total) * 100).toFixed(1) : "0";
                            return (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                                    <span className="text-sm">{b.browser || "Unknown"}</span>
                                    <span className="text-xs text-zinc-500">{pct}% ({b.visits})</span>
                                </div>
                            );
                        })}
                        {(!analytics?.browserBreakdown || analytics.browserBreakdown.length === 0) && (
                            <p className="text-zinc-500 text-sm text-center py-4">No browser data yet</p>
                        )}
                    </div>
                </div>

                {/* Top Referrers */}
                <div className={cardClass}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ArrowRight size={16} className="text-green-400" /> Top Referrers
                    </h3>
                    <div className="space-y-2">
                        {analytics?.topReferrers?.map((r: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                                <span className="text-xs truncate max-w-[180px]">{r.referrer || "Direct"}</span>
                                <span className="text-xs font-bold text-green-400">{r.visits}</span>
                            </div>
                        ))}
                        {(!analytics?.topReferrers || analytics.topReferrers.length === 0) && (
                            <p className="text-zinc-500 text-sm text-center py-4">No referrer data yet</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Pages */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Eye size={16} className="text-green-400" /> Top Entry Pages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analytics?.topPages?.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg">
                            <span className="text-xs font-mono truncate max-w-[200px]">{p.page}</span>
                            <span className="text-xs font-bold text-green-400 ml-2">{p.visits}</span>
                        </div>
                    ))}
                    {(!analytics?.topPages || analytics.topPages.length === 0) && (
                        <p className="text-zinc-500 text-sm text-center py-4 col-span-2">No page data yet</p>
                    )}
                </div>
            </div>

            {/* Visitor Sessions List */}
            <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                    <h3
                        className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                        onClick={() => setShowVisitorList(!showVisitorList)}
                    >
                        <Users size={16} className="text-blue-400" />
                        Recent Visitor Sessions
                        {showVisitorList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </h3>
                    {showVisitorList && (
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search IP, city..."
                                className="bg-white/5 border border-white/10 rounded-lg text-sm pl-8 pr-3 py-1.5 w-48 placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50"
                            />
                        </div>
                    )}
                </div>
                {showVisitorList && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-zinc-500 text-[10px] uppercase tracking-wider border-b border-white/5">
                                    <th className="text-left py-2 px-2">IP Address</th>
                                    <th className="text-left py-2 px-2">Location</th>
                                    <th className="text-left py-2 px-2">Device</th>
                                    <th className="text-left py-2 px-2">Pages</th>
                                    <th className="text-left py-2 px-2">Duration</th>
                                    <th className="text-left py-2 px-2">Entry Page</th>
                                    <th className="text-left py-2 px-2">When</th>
                                    <th className="text-left py-2 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitors?.sessions?.map((v: any) => (
                                    <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="py-2 px-2 font-mono text-xs">{v.ipAddress || "--"}</td>
                                        <td className="py-2 px-2 text-xs text-zinc-400">
                                            {v.city ? `${v.city}, ${v.region || ""}` : v.country || "Unknown"}
                                        </td>
                                        <td className="py-2 px-2 text-xs text-zinc-400 flex items-center gap-1">
                                            <DeviceIcon device={v.device || "Desktop"} />
                                            {v.browser || "--"}
                                        </td>
                                        <td className="py-2 px-2 text-xs font-bold">{v.pageCount}</td>
                                        <td className="py-2 px-2 text-xs text-zinc-400">{formatDuration(v.duration)}</td>
                                        <td className="py-2 px-2 text-xs text-zinc-400 font-mono truncate max-w-[120px]">{v.entryPage || "/"}</td>
                                        <td className="py-2 px-2 text-xs text-zinc-400">{formatTimeAgo(v.startedAt)}</td>
                                        <td className="py-2 px-2">
                                            {v.converted ? (
                                                <span className={`${badgeClass} text-green-400 border-green-500/30 bg-green-500/10`}>Converted</span>
                                            ) : v.addedToCart ? (
                                                <span className={`${badgeClass} text-amber-400 border-amber-500/30 bg-amber-500/10`}>Cart</span>
                                            ) : (
                                                <span className={`${badgeClass} text-zinc-400 border-zinc-500/30 bg-zinc-500/10`}>Browse</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!visitors?.sessions || visitors.sessions.length === 0) && (
                                    <tr><td colSpan={8} className="p-8 text-center text-zinc-500">No visitor sessions recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Analytics Section */}
            <div className={cardClass}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users size={16} className="text-purple-400" />
                    Customer Analytics
                </h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Search customers by name, email..."
                            className="bg-white/5 border border-white/10 rounded-lg text-sm pl-8 pr-3 py-2 w-full placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-zinc-500 text-[10px] uppercase tracking-wider border-b border-white/5">
                                <th className="text-left py-2 px-2">Customer</th>
                                <th className="text-left py-2 px-2">Orders</th>
                                <th className="text-left py-2 px-2">Total Spent</th>
                                <th className="text-left py-2 px-2">Member Since</th>
                                <th className="text-left py-2 px-2">Last Active</th>
                                <th className="text-left py-2 px-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers?.customers?.map((c: any) => (
                                <tr
                                    key={c.id}
                                    className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer ${
                                        selectedCustomerId === c.id ? "bg-white/[0.03]" : ""
                                    }`}
                                    onClick={() => setSelectedCustomerId(selectedCustomerId === c.id ? null : c.id)}
                                >
                                    <td className="py-2 px-2">
                                        <p className="text-sm font-medium">{c.name || "Unnamed"}</p>
                                        <p className="text-[10px] text-zinc-500">{c.email || "No email"}</p>
                                    </td>
                                    <td className="py-2 px-2 text-xs font-bold">{c.ordersCount || 0}</td>
                                    <td className="py-2 px-2 text-xs font-bold text-green-400">${Number(c.totalSpent || 0).toFixed(2)}</td>
                                    <td className="py-2 px-2 text-[10px] text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-2 text-[10px] text-zinc-500">{c.lastLogin ? formatTimeAgo(c.lastLogin) : "--"}</td>
                                    <td className="py-2 px-2">
                                        <ArrowRight size={14} className={`text-zinc-500 transition-transform ${selectedCustomerId === c.id ? "rotate-90" : ""}`} />
                                    </td>
                                </tr>
                            ))}
                            {(!customers?.customers || customers.customers.length === 0) && (
                                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No customers yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail Panel */}
            {selectedCustomerId && customerDetail && (
                <div className={`${cardClass} border-green-500/20`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Users size={16} className="text-green-400" />
                            {customerDetail.user?.name || "Customer"} -- Detailed Analytics
                        </h3>
                        <button onClick={() => setSelectedCustomerId(null)} className="text-zinc-500 hover:text-zinc-300">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Customer Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        <div className="bg-white/[0.03] rounded-lg p-3">
                            <p className="text-[10px] text-zinc-500 uppercase">Member For</p>
                            <p className="text-lg font-black">{customerDetail.memberDays}d</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-3">
                            <p className="text-[10px] text-zinc-500 uppercase">Total Orders</p>
                            <p className="text-lg font-black text-blue-400">{customerDetail.orderStats?.totalOrders || 0}</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-3">
                            <p className="text-[10px] text-zinc-500 uppercase">Total Spent</p>
                            <p className="text-lg font-black text-green-400">${customerDetail.orderStats?.totalSpent || "0.00"}</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-3">
                            <p className="text-[10px] text-zinc-500 uppercase">Avg Order</p>
                            <p className="text-lg font-black text-amber-400">${customerDetail.orderStats?.avgOrderValue || "0.00"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white/[0.03] rounded-lg p-3">
                            <p className="text-[10px] text-zinc-500 uppercase">Total Visits</p>
                            <p className="text-lg font-black text-purple-400">{customerDetail.visitStats?.totalVisits || 0}</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-lg p-3">
                            <p className="text-[10px] text-zinc-500 uppercase">Avg Visit Duration</p>
                            <p className="text-lg font-black">{formatDuration(customerDetail.visitStats?.avgDuration || 0)}</p>
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    {customerDetail.recentSessions && customerDetail.recentSessions.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recent Sessions</h4>
                            <div className="space-y-1">
                                {customerDetail.recentSessions.map((s: any) => (
                                    <div key={s.id} className="flex items-center justify-between py-1.5 px-3 bg-white/[0.02] rounded text-xs">
                                        <span className="font-mono text-zinc-500">{s.ipAddress || "--"}</span>
                                        <span className="text-zinc-500">{s.city ? `${s.city}, ${s.country}` : "--"}</span>
                                        <span className="text-zinc-500">{s.pageCount} pages</span>
                                        <span className="text-zinc-500">{formatDuration(s.duration)}</span>
                                        <span className="text-zinc-500">{formatTimeAgo(s.startedAt)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Orders */}
                    {customerDetail.recentOrders && customerDetail.recentOrders.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recent Orders</h4>
                            <div className="space-y-1">
                                {customerDetail.recentOrders.map((o: any) => (
                                    <div key={o.id} className="flex items-center justify-between py-1.5 px-3 bg-white/[0.02] rounded text-xs">
                                        <span className="font-medium">{o.orderNumber}</span>
                                        <span className="text-zinc-500">{o.status}</span>
                                        <span className="font-bold text-green-400">${Number(o.total).toFixed(2)}</span>
                                        <span className="text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
