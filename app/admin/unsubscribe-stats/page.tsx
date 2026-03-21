"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Mail } from "lucide-react";

interface Stats {
    totalUsers: number;
    withEmail: number;
    anyOptIn: number;
    allOptedOut: number;
    emailPromotionsOptIn: number;
    emailOrderUpdatesOptIn: number;
    emailRestockAlertsOptIn: number;
    emailNewsletterOptIn: number;
    cartRecoveryOptOut: number;
}

export default function UnsubscribeStatsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/unsubscribe-stats/")
            .then(r => r.json())
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-7 h-7 text-green-400" /> Subscriber Management
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-24 mb-3" />
                            <div className="h-8 bg-white/10 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const categories = [
        { key: "promotions", label: "Promotions", field: "emailPromotionsOptIn" as keyof Stats },
        { key: "orderUpdates", label: "Order Updates", field: "emailOrderUpdatesOptIn" as keyof Stats },
        { key: "restockAlerts", label: "Restock Alerts", field: "emailRestockAlertsOptIn" as keyof Stats },
        { key: "newsletter", label: "Newsletter", field: "emailNewsletterOptIn" as keyof Stats },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-7 h-7 text-green-400" /> Subscriber Management
                </h1>
                <p className="text-white/60 mt-1">Email subscription statistics and opt-in rates</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500">Total Users</p>
                            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500">With Email</p>
                            <p className="text-2xl font-bold text-green-400 mt-1">{stats.withEmail}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500">Opted In (Any)</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.anyOptIn}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <UserCheck className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-500">All Opted Out</p>
                            <p className="text-2xl font-bold text-red-400 mt-1">{stats.allOptedOut}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                            <UserX className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Opt-In Rates by Category */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <h2 className="font-semibold mb-1">Opt-In Rates by Category</h2>
                <p className="text-xs text-zinc-500 mb-6">Percentage of users subscribed to each email type</p>
                <div className="space-y-5">
                    {categories.map(cat => {
                        const count = Number(stats[cat.field]) || 0;
                        const pct = stats.totalUsers > 0 ? (count / stats.totalUsers * 100) : 0;
                        return (
                            <div key={cat.key} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{cat.label}</span>
                                    <span className="text-zinc-500">{count} users ({pct.toFixed(1)}%)</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Cart Recovery Opt-Out */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <h2 className="font-semibold mb-1">Cart Recovery Opt-Out</h2>
                <p className="text-xs text-zinc-500 mb-6">Users who opted out of abandoned cart recovery emails</p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Cart Recovery Opt-Out</span>
                        <span className="text-zinc-500">{stats.cartRecoveryOptOut || 0} users ({stats.totalUsers > 0 ? ((stats.cartRecoveryOptOut || 0) / stats.totalUsers * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all" style={{ width: `${stats.totalUsers > 0 ? ((stats.cartRecoveryOptOut || 0) / stats.totalUsers * 100) : 0}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
