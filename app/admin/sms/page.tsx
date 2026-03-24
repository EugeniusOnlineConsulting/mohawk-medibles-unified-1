"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Smartphone, Users, Send, CheckCircle, XCircle, Clock,
    RefreshCw, MessageSquare, Search, ChevronLeft, ChevronRight,
    AlertTriangle, Info, Loader2, Megaphone, BarChart3,
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

    // Promo blast state
    const [promoMessage, setPromoMessage] = useState("");
    const [promoSending, setPromoSending] = useState(false);
    const [promoResult, setPromoResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"dashboard" | "blast" | "logs">("dashboard");

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
            { label: "Opted-In Subscribers", value: stats.totalOptedIn, icon: Users, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
            { label: "Total Sent", value: stats.totalSent, icon: Send, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
            { label: "Delivered", value: stats.totalDelivered, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
            { label: "Failed", value: stats.totalFailed, icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
            { label: "Pending", value: stats.totalPending, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
        ];
    }, [stats]);

    const deliveryRate = useMemo(() => {
        if (!stats) return 0;
        const total = (stats.totalSent || 0) + (stats.totalFailed || 0);
        return total > 0 ? Math.round((stats.totalSent / total) * 100) : 0;
    }, [stats]);

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        const styles: Record<string, string> = {
            sent: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-300",
            delivered: "bg-green-100 dark:bg-green-900/30 text-green-600 border-green-300",
            failed: "bg-red-100 dark:bg-red-900/30 text-red-600 border-red-300",
            pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-300",
            queued: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 border-yellow-300",
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${styles[s] || "bg-gray-100 text-gray-500 border-gray-300"}`}>
                {status}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const label = type.replace("ORDER_", "").replace(/_/g, " ");
        const colors: Record<string, string> = {
            ORDER_CONFIRMATION: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 border-blue-300",
            SHIPPING_UPDATE: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 border-orange-300",
            DELIVERY: "bg-green-100 dark:bg-green-900/30 text-green-600 border-green-300",
            PROMO: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 border-purple-300",
            CUSTOM: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 border-gray-300",
        };
        return (
            <span className={`px-2 py-0.5 text-[10px] font-medium uppercase rounded border ${colors[type] || "bg-violet-100 dark:bg-violet-900/30 text-violet-600 border-violet-300"}`}>
                {label}
            </span>
        );
    };

    async function handleSendBlast() {
        if (!promoMessage.trim() || promoMessage.length > 160) return;
        if (!window.confirm(`Send this promo SMS to all ${stats?.totalOptedIn || 0} opted-in subscribers?`)) return;

        setPromoSending(true);
        setPromoResult(null);

        try {
            const res = await fetch("/api/admin/sms/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "blast", message: promoMessage.trim() }),
            });
            const data = await res.json();
            setPromoResult(data);
            if (data.sent > 0) {
                setPromoMessage("");
                fetchStats();
            }
        } catch {
            setPromoResult({ error: "Failed to send blast" });
        }

        setPromoSending(false);
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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Smartphone size={20} className="text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">SMS Notifications</h1>
                        <p className="text-xs text-gray-500">Manage SMS opt-ins, send promos, and view notification history</p>
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
                            <p>Order confirmation, shipping updates, and delivery notifications are sent automatically to opted-in customers.</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Twilio Integration</p>
                            <p>SMS is sent via Twilio. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment secrets.</p>
                        </div>
                        <div>
                            <p className="font-semibold mb-1">Promo Blasts</p>
                            <p>Send promotional messages to all opted-in subscribers. Messages are capped at 160 characters. Users can reply STOP to unsubscribe.</p>
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

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
                {(["dashboard", "blast", "logs"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
                            activeTab === tab
                                ? "border-violet-500 text-violet-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                    >
                        {tab === "dashboard" && <BarChart3 size={12} className="inline mr-1.5 -mt-0.5" />}
                        {tab === "blast" && <Megaphone size={12} className="inline mr-1.5 -mt-0.5" />}
                        {tab === "logs" && <MessageSquare size={12} className="inline mr-1.5 -mt-0.5" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {statCards.map((card) => (
                            <div key={card.label} className={cardClass}>
                                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                                    <card.icon size={16} className={card.color} />
                                </div>
                                <p className="text-2xl font-black">{card.value ?? 0}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Delivery Rate */}
                    <div className={cardClass}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold">Delivery Rate</h3>
                            <span className="text-2xl font-black text-violet-600">{deliveryRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-violet-500 to-violet-600 h-3 rounded-full transition-all"
                                style={{ width: `${Math.min(deliveryRate, 100)}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">
                            {stats?.totalSent || 0} sent / {(stats?.totalSent || 0) + (stats?.totalFailed || 0)} total attempts
                        </p>
                    </div>
                </>
            )}

            {/* Promo Blast Tab */}
            {activeTab === "blast" && (
                <div className={cardClass}>
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Megaphone size={14} className="text-violet-600" /> Compose Promo SMS
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Message ({promoMessage.length}/160 characters)
                            </label>
                            <textarea
                                value={promoMessage}
                                onChange={(e) => setPromoMessage(e.target.value.slice(0, 160))}
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-violet-500 resize-none"
                                placeholder="e.g., Flash Sale! 20% off all edibles today only. Use code FLASH20 at mohawkmedibles.co"
                            />
                            <div className={`mt-1 h-1 rounded-full ${promoMessage.length > 140 ? "bg-yellow-400" : promoMessage.length > 0 ? "bg-green-400" : "bg-gray-200"}`}
                                style={{ width: `${(promoMessage.length / 160) * 100}%` }} />
                        </div>

                        {/* Preview */}
                        {promoMessage.trim() && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Preview</p>
                                <div className="bg-green-100 dark:bg-green-900/30 rounded-2xl rounded-bl-sm px-3 py-2 text-sm max-w-sm">
                                    {promoMessage}
                                    <br />
                                    <span className="text-[10px] text-gray-500 block mt-1">Reply STOP to unsubscribe. Mohawk Medibles</span>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Will send to <strong>{stats?.totalOptedIn || 0}</strong> opted-in subscribers
                            </p>
                            <button
                                onClick={handleSendBlast}
                                disabled={!promoMessage.trim() || promoMessage.length > 160 || promoSending || (stats?.totalOptedIn || 0) === 0}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {promoSending ? (
                                    <><Loader2 size={14} className="animate-spin" /> Sending...</>
                                ) : (
                                    <><Send size={14} /> Send Blast</>
                                )}
                            </button>
                        </div>

                        {promoResult && (
                            <div className={`p-3 rounded-lg text-sm ${promoResult.error ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-green-50 dark:bg-green-900/20 text-green-600"}`}>
                                {promoResult.error
                                    ? promoResult.error
                                    : `Blast complete: ${promoResult.sent} sent, ${promoResult.failed} failed out of ${promoResult.total} subscribers`}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === "logs" && (
                <div className={cardClass}>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <MessageSquare size={14} className="text-violet-600" /> SMS Log
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
                                            <th className="text-left py-2 px-2 font-medium">Phone</th>
                                            <th className="text-left py-2 px-2 font-medium">Message</th>
                                            <th className="text-left py-2 px-2 font-medium">Type</th>
                                            <th className="text-left py-2 px-2 font-medium">Status</th>
                                            <th className="text-left py-2 px-2 font-medium">Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.notifications.map((n: any) => (
                                            <tr key={n.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="py-2 px-2 text-gray-500 whitespace-nowrap">{new Date(n.sentAt || n.createdAt).toLocaleString()}</td>
                                                <td className="py-2 px-2 text-gray-500 font-mono">{n.phone}</td>
                                                <td className="py-2 px-2 max-w-[200px] truncate" title={n.messageBody || n.message}>{n.messageBody || n.message || "--"}</td>
                                                <td className="py-2 px-2">{getTypeBadge(n.messageType || n.type || "CUSTOM")}</td>
                                                <td className="py-2 px-2">{getStatusBadge(n.status)}</td>
                                                <td className="py-2 px-2 text-red-500 text-[10px] max-w-[150px] truncate" title={n.errorMessage || n.error}>{n.errorMessage || n.error || "--"}</td>
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
            )}
        </div>
    );
}
