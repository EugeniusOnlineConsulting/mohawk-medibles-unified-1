"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Smartphone, Users, Send, CheckCircle, XCircle, Clock,
    RefreshCw, MessageSquare, Search, ChevronLeft, ChevronRight,
    AlertTriangle, Info, Loader2,
} from "lucide-react";

const cardClass =
    "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5";

export default function SmsNotificationsPage() {
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any>(null);
    const [historyPage, setHistoryPage] = useState(0);
    const [searchUserId, setSearchUserId] = useState("");
    const [showHelp, setShowHelp] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        const res = await fetch("/api/admin/sms/?action=stats");
        setStats(await res.json());
    }, []);

    const fetchHistory = useCallback(async () => {
        const params = new URLSearchParams({
            action: "history",
            limit: "20",
            offset: String(historyPage * 20),
        });
        if (searchUserId) params.set("userId", searchUserId);
        const res = await fetch(`/api/admin/sms/?${params}`);
        setHistory(await res.json());
    }, [historyPage, searchUserId]);

    useEffect(() => {
        Promise.all([fetchStats(), fetchHistory()]).finally(() => setLoading(false));
    }, [fetchStats, fetchHistory]);

    const statCards = useMemo(() => {
        if (!stats) return [];
        return [
            { label: "Total Opted In", value: stats.totalOptedIn, icon: Users, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
            { label: "Total Sent", value: stats.totalSent, icon: Send, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
            { label: "Delivered", value: stats.totalDelivered, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
            { label: "Failed", value: stats.totalFailed, icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
            { label: "Pending", value: stats.totalPending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
        ];
    }, [stats]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            sent: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-300",
            delivered: "bg-green-100 dark:bg-green-900/30 text-green-600 border-green-300",
            failed: "bg-red-100 dark:bg-red-900/30 text-red-600 border-red-300",
            pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-300",
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${styles[status] || "bg-gray-100 text-gray-500 border-gray-300"}`}>
                {status}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const label = type.replace("order_", "").replace(/_/g, " ");
        return (
            <span className="px-2 py-0.5 text-[10px] font-medium uppercase rounded bg-violet-100 dark:bg-violet-900/30 text-violet-600 border border-violet-300">
                {label}
            </span>
        );
    };

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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Smartphone size={20} className="text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">SMS Notifications</h1>
                        <p className="text-xs text-gray-500">Manage customer SMS opt-ins and view notification history</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { fetchStats(); fetchHistory(); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <RefreshCw size={12} /> Refresh
                    </button>
                    <button onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Info size={12} /> {showHelp ? "Hide" : "How It Works"}
                    </button>
                </div>
            </div>

            {/* How It Works */}
            {showHelp && (
                <div className={`${cardClass} border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/10`}>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <Info size={14} className="text-violet-600" /> How SMS Notifications Work
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div>
                            <p className="font-semibold mb-1">Customer Opt-In</p>
                            <p>Customers can opt in during checkout or in Account Settings. They must explicitly provide a phone number.</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Automatic Triggers</p>
                            <p>When you update an order status (shipped, delivered, cancelled, etc.), SMS is automatically sent to opted-in customers.</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Twilio Integration</p>
                            <p>SMS is sent via Twilio. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment secrets.</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Opt-Out</p>
                            <p>Customers can opt out at any time from their Account Settings. Their preference is immediately respected.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Twilio Warning */}
            {stats && !stats.twilioConfigured && (
                <div className={`${cardClass} border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10`}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold">Twilio Not Configured</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">SMS notifications require Twilio credentials. Add these environment secrets:</p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
                                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">TWILIO_ACCOUNT_SID</code></li>
                                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">TWILIO_AUTH_TOKEN</code></li>
                                <li><code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">TWILIO_PHONE_NUMBER</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {statCards.map((card) => (
                    <div key={card.label} className={cardClass}>
                        <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                            <card.icon size={16} className={card.color} />
                        </div>
                        <p className="text-2xl font-black">{card.value}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* SMS History */}
            <div className={cardClass}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <MessageSquare size={14} className="text-violet-600" /> SMS History
                    </h3>
                    <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchUserId}
                            onChange={(e) => { setSearchUserId(e.target.value); setHistoryPage(0); }}
                            placeholder="Filter by User ID..."
                            className="pl-7 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:border-violet-500 w-40"
                        />
                    </div>
                </div>

                {history && history.notifications?.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
                                        <th className="text-left py-2 px-2 font-medium">Date</th>
                                        <th className="text-left py-2 px-2 font-medium">User</th>
                                        <th className="text-left py-2 px-2 font-medium">Phone</th>
                                        <th className="text-left py-2 px-2 font-medium">Order</th>
                                        <th className="text-left py-2 px-2 font-medium">Type</th>
                                        <th className="text-left py-2 px-2 font-medium">Status</th>
                                        <th className="text-left py-2 px-2 font-medium">Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.notifications.map((n: any) => (
                                        <tr key={n.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-2 px-2 text-gray-500 whitespace-nowrap">{new Date(n.sentAt).toLocaleString()}</td>
                                            <td className="py-2 px-2">#{n.userId}</td>
                                            <td className="py-2 px-2 text-gray-500 font-mono">{n.phone}</td>
                                            <td className="py-2 px-2">{n.orderId ? `#${n.orderId}` : "--"}</td>
                                            <td className="py-2 px-2">{getTypeBadge(n.type)}</td>
                                            <td className="py-2 px-2">{getStatusBadge(n.status)}</td>
                                            <td className="py-2 px-2 text-red-500 text-[10px] max-w-[150px] truncate" title={n.errorMessage}>{n.errorMessage || "--"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-[10px] text-gray-500">
                                Showing {historyPage * 20 + 1}--{Math.min((historyPage + 1) * 20, history.total)} of {history.total}
                            </p>
                            <div className="flex gap-1">
                                <button onClick={() => setHistoryPage(Math.max(0, historyPage - 1))} disabled={historyPage === 0}
                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                                    <ChevronLeft size={12} />
                                </button>
                                <button onClick={() => setHistoryPage(historyPage + 1)} disabled={(historyPage + 1) * 20 >= (history?.total || 0)}
                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">No SMS notifications sent yet</p>
                        <p className="text-xs text-gray-400 mt-1">SMS notifications appear here when order statuses are updated for opted-in customers</p>
                    </div>
                )}
            </div>
        </div>
    );
}
