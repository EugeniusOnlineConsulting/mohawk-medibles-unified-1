"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Monitor, MousePointerClick, AlertTriangle, Clock,
    Eye, RefreshCw, Loader2,
} from "lucide-react";

const cardClass =
    "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800";
const badgeClass =
    "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border";

interface SessionRecord {
    id: string;
    sessionId: string;
    userId?: string;
    device?: string;
    browser?: string;
    entryPage?: string;
    duration: number;
    pageCount: number;
    rageClicks: number;
    errorsCount: number;
    converted: boolean;
    startedAt: string;
}

export default function SessionReplayPage() {
    const [sessions, setSessions] = useState<SessionRecord[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [detail, setDetail] = useState<any>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filter === "hasErrors") params.set("hasErrors", "true");
            if (filter === "hasRageClicks") params.set("hasRageClicks", "true");
            if (filter === "converted") params.set("converted", "true");

            const [sessRes, statsRes, analyticsRes] = await Promise.all([
                fetch(`/api/admin/session-replay/?action=list&${params}`),
                fetch("/api/admin/session-replay/?action=stats"),
                fetch(`/api/admin/session-replay/?action=analytics&days=${days}`),
            ]);
            const sessData = await sessRes.json();
            const statsData = await statsRes.json();
            const analyticsData = await analyticsRes.json();
            setSessions(sessData.sessions || []);
            setStats(statsData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error("Failed to fetch session data:", err);
        } finally {
            setLoading(false);
        }
    }, [filter, days]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!selectedSession) { setDetail(null); return; }
        fetch(`/api/admin/session-replay/?action=detail&sessionId=${selectedSession}`)
            .then((r) => r.json())
            .then(setDetail)
            .catch(console.error);
    }, [selectedSession]);

    function formatDuration(ms: number) {
        if (!ms) return "0s";
        const secs = Math.floor(ms / 1000);
        if (secs < 60) return `${secs}s`;
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        return `${mins}m ${remSecs}s`;
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Monitor size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Session Replay</h1>
                        <p className="text-xs text-gray-500">Review user sessions, detect issues, and analyze behavior</p>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RefreshCw size={12} /> Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Sessions", value: stats.totalSessions, icon: Monitor, color: "text-violet-600" },
                        { label: "Avg Duration", value: formatDuration(stats.avgDuration), icon: Clock, color: "text-blue-500" },
                        { label: "Today's Sessions", value: stats.todaySessions, icon: MousePointerClick, color: "text-green-500" },
                        { label: "Error Sessions", value: stats.errorSessions, icon: AlertTriangle, color: "text-amber-500" },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className={`${cardClass} p-4`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon size={14} className={stat.color} />
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <p className="text-xl font-black">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Analytics Overview */}
            {analytics && (
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider">Analytics Overview</h3>
                        <select className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                            <option value={7}>Last 7 days</option>
                            <option value={14}>Last 14 days</option>
                            <option value={30}>Last 30 days</option>
                            <option value={90}>Last 90 days</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Sessions</p>
                            <p className="text-lg font-bold">{analytics.overview?.totalSessions || 0}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Avg Pages/Session</p>
                            <p className="text-lg font-bold">{(analytics.overview?.avgPageCount || 0).toFixed(1)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Conversion Rate</p>
                            <p className="text-lg font-bold text-violet-600">{(analytics.overview?.conversionRate || 0).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Bounce Rate</p>
                            <p className="text-lg font-bold text-amber-500">{(analytics.overview?.bounceRate || 0).toFixed(1)}%</p>
                        </div>
                    </div>

                    {analytics.topPages?.length > 0 && (
                        <div className="mt-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Top Pages</p>
                            <div className="space-y-1">
                                {analytics.topPages.slice(0, 5).map((page: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-mono">{page.page}</span>
                                        <span className="text-gray-500">{page.views} views</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {analytics.errorPages?.length > 0 && (
                        <div className="mt-4">
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Pages with Errors</p>
                            <div className="space-y-1">
                                {analytics.errorPages.slice(0, 5).map((page: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                                        <span className="text-gray-600 dark:text-gray-300 font-mono">{page.page}</span>
                                        <span className="text-red-500">{page.errors} errors</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-sm font-bold uppercase tracking-wider mr-2">Sessions</h3>
                {[
                    { label: "All", key: "all" },
                    { label: "With Errors", key: "hasErrors" },
                    { label: "Rage Clicks", key: "hasRageClicks" },
                    { label: "Converted", key: "converted" },
                ].map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                            filter === f.key
                                ? "bg-violet-100 dark:bg-violet-900/30 border-violet-400 text-violet-600"
                                : "border-gray-300 dark:border-gray-700 text-gray-500 hover:border-gray-400"
                        }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Sessions Table */}
            <div className={cardClass}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Session</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Pages</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Device</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Flags</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Entry</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Started</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No sessions recorded yet.</td></tr>
                            ) : sessions.map((s) => (
                                <tr key={s.sessionId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                    onClick={() => setSelectedSession(s.sessionId)}>
                                    <td className="p-3">
                                        <span className="text-xs font-mono">{s.sessionId?.slice(0, 12)}...</span>
                                        {s.userId && <p className="text-gray-500 text-xs">User #{s.userId}</p>}
                                    </td>
                                    <td className="p-3 text-gray-500 text-xs">{formatDuration(s.duration)}</td>
                                    <td className="p-3 text-gray-500 text-xs">{s.pageCount}</td>
                                    <td className="p-3 text-gray-500 text-xs">{s.device || "--"}</td>
                                    <td className="p-3">
                                        <div className="flex gap-1">
                                            {s.rageClicks > 0 && <span className={`${badgeClass} text-red-500 border-red-300 bg-red-50 dark:bg-red-900/20`}>rage</span>}
                                            {s.errorsCount > 0 && <span className={`${badgeClass} text-amber-500 border-amber-300 bg-amber-50 dark:bg-amber-900/20`}>errors</span>}
                                            {s.converted && <span className={`${badgeClass} text-green-500 border-green-300 bg-green-50 dark:bg-green-900/20`}>converted</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-500 text-xs font-mono max-w-[150px] truncate">{s.entryPage || "--"}</td>
                                    <td className="p-3 text-gray-500 text-xs">{s.startedAt ? new Date(s.startedAt).toLocaleString() : "--"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Session Detail */}
            {selectedSession && detail && (
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider">Session Detail</h3>
                        <button className="text-gray-500 text-xs hover:text-gray-700" onClick={() => setSelectedSession(null)}>Close</button>
                    </div>

                    {detail.summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                                <p className="text-gray-500 text-xs">Duration</p>
                                <p className="text-sm font-bold">{formatDuration(detail.summary.duration || 0)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                                <p className="text-gray-500 text-xs">Pages Viewed</p>
                                <p className="text-sm font-bold">{detail.summary.pageCount || 0}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                                <p className="text-gray-500 text-xs">Events</p>
                                <p className="text-sm font-bold">{detail.summary.eventCount || 0}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                                <p className="text-gray-500 text-xs">Browser</p>
                                <p className="text-sm font-bold">{detail.summary.browser || "Unknown"}</p>
                            </div>
                        </div>
                    )}

                    {detail.events?.length > 0 && (
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Event Timeline</p>
                            <div className="max-h-[300px] overflow-y-auto space-y-1">
                                {detail.events.map((event: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-xs bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                                        <span className="text-gray-500 w-[60px] flex-shrink-0">{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ""}</span>
                                        <span className={`${badgeClass} ${
                                            event.eventType === "click" ? "text-blue-500 border-blue-300" :
                                            event.eventType === "error" ? "text-red-500 border-red-300" :
                                            event.eventType === "pageview" ? "text-green-500 border-green-300" :
                                            "text-gray-500 border-gray-300"
                                        }`}>{event.eventType}</span>
                                        <span className="text-gray-500 font-mono truncate">{event.page}</span>
                                        {event.elementText && <span className="text-gray-400 truncate">&quot;{event.elementText}&quot;</span>}
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
