"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Shield, Search, CheckCircle, XCircle, AlertTriangle, Clock,
    ChevronLeft, ChevronRight, Loader2, RefreshCw,
} from "lucide-react";

export default function LoginAuditPage() {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [emailFilter, setEmailFilter] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const limit = 25;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(page * limit),
            });
            if (searchEmail) params.set("email", searchEmail);

            const res = await fetch(`/api/admin/login-audit/?${params}`);
            const data = await res.json();
            setAttempts(data.attempts || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch login audit:", err);
        } finally {
            setLoading(false);
        }
    }, [page, searchEmail]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalPages = Math.ceil(total / limit);

    const handleSearch = () => {
        setSearchEmail(emailFilter);
        setPage(0);
    };

    const getStatusIcon = (success: boolean, failReason?: string | null) => {
        if (success) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (failReason === "account_locked") return <AlertTriangle className="h-4 w-4 text-red-500" />;
        return <XCircle className="h-4 w-4 text-red-400" />;
    };

    const getFailReasonLabel = (reason?: string | null) => {
        if (!reason) return "";
        switch (reason) {
            case "wrong_password": return "Wrong password";
            case "user_not_found": return "User not found";
            case "account_locked": return "Account locked";
            case "2fa_failed": return "2FA failed";
            default: return reason;
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Login Audit Log</h1>
                        <p className="text-xs text-gray-500">
                            Track all login attempts including successes, failures, lockouts, and 2FA events.
                            Total: {total} records.
                        </p>
                    </div>
                </div>
                <button onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-2">
                <input
                    placeholder="Filter by email..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="max-w-xs px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <button onClick={handleSearch}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Search className="h-4 w-4" /> Search
                </button>
                {searchEmail && (
                    <button onClick={() => { setSearchEmail(""); setEmailFilter(""); setPage(0); }}
                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                        Clear
                    </button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left p-3 text-gray-500 font-medium">Status</th>
                                <th className="text-left p-3 text-gray-500 font-medium">Email</th>
                                <th className="text-left p-3 text-gray-500 font-medium">Reason</th>
                                <th className="text-left p-3 text-gray-500 font-medium">IP Address</th>
                                <th className="text-left p-3 text-gray-500 font-medium">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400">
                                        No login attempts found
                                    </td>
                                </tr>
                            ) : attempts.map((attempt) => (
                                <tr key={attempt.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(attempt.success, attempt.failReason)}
                                            <span className={attempt.success ? "text-green-500" : "text-red-400"}>
                                                {attempt.success ? "Success" : "Failed"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3 font-mono text-xs">{attempt.email}</td>
                                    <td className="p-3">
                                        {attempt.failReason && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                attempt.failReason === "account_locked"
                                                    ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                                    : attempt.failReason === "2fa_failed"
                                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                            }`}>
                                                {getFailReasonLabel(attempt.failReason)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-500 font-mono text-xs">{attempt.ipAddress || "--"}</td>
                                    <td className="p-3 text-gray-500 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(attempt.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
