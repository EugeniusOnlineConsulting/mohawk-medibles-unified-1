"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Activity, Search, Filter, User, Package, ShoppingCart,
    Tag, Settings, FileText, ChevronLeft, ChevronRight, Clock, Shield,
    RefreshCw, Layers, Users, Loader2,
} from "lucide-react";

const RESOURCE_OPTIONS = [
    { value: "", label: "All Resources" },
    { value: "product", label: "Products" },
    { value: "order", label: "Orders" },
    { value: "category", label: "Categories" },
    { value: "coupon", label: "Coupons" },
    { value: "settings", label: "Settings" },
    { value: "user", label: "Users" },
    { value: "blog", label: "Blog" },
    { value: "auth", label: "Authentication" },
];

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
    product: <Package className="w-4 h-4" />,
    order: <ShoppingCart className="w-4 h-4" />,
    category: <Layers className="w-4 h-4" />,
    coupon: <Tag className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
    user: <Users className="w-4 h-4" />,
    blog: <FileText className="w-4 h-4" />,
    auth: <Shield className="w-4 h-4" />,
};

const RESOURCE_COLORS: Record<string, string> = {
    product: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200",
    order: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200",
    category: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200",
    coupon: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200",
    settings: "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200",
    user: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200",
    blog: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-200",
    auth: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200",
};

const ACTION_LABELS: Record<string, string> = {
    product_created: "Product Created",
    product_updated: "Product Updated",
    product_deleted: "Product Deleted",
    products_bulk_updated: "Bulk Product Update",
    order_status_updated: "Order Status Changed",
    order_payment_updated: "Payment Updated",
    category_created: "Category Created",
    category_updated: "Category Updated",
    category_deleted: "Category Deleted",
    coupon_created: "Coupon Created",
    coupon_updated: "Coupon Updated",
    coupon_deleted: "Coupon Deleted",
    setting_updated: "Setting Changed",
    user_role_updated: "User Role Changed",
    inventory_adjusted: "Inventory Adjusted",
    blog_post_created: "Blog Post Created",
    blog_post_updated: "Blog Post Updated",
    blog_post_deleted: "Blog Post Deleted",
    admin_login: "Admin Login",
    admin_login_failed: "Failed Login Attempt",
    admin_logout: "Admin Logout",
    password_changed: "Password Changed",
};

function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function formatFullDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString("en-CA", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
}

export default function ActivityLogPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [resource, setResource] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);
    const limit = 25;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: String(limit),
                offset: String(page * limit),
            });
            if (resource) params.set("resource", resource);
            if (search) params.set("search", search);

            const res = await fetch(`/api/admin/audit-log/?${params}`);
            const data = await res.json();
            setEntries(data.entries || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error("Failed to fetch audit log:", err);
        } finally {
            setLoading(false);
        }
    }, [page, resource, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const totalPages = Math.ceil(total / limit);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(0);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Activity Log</h1>
                        <p className="text-xs text-gray-500">Track all admin actions and changes across the system</p>
                    </div>
                </div>
                <button onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select value={resource} onChange={(e) => { setResource(e.target.value); setPage(0); }}
                            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                            {RESOURCE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search activity details..."
                                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">Search</button>
                        {search && (
                            <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">Clear</button>
                        )}
                    </form>
                </div>
                {(resource || search) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500">Active filters:</span>
                        {resource && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full">
                                {RESOURCE_OPTIONS.find((o) => o.value === resource)?.label}
                                <button onClick={() => { setResource(""); setPage(0); }} className="hover:text-violet-900">&times;</button>
                            </span>
                        )}
                        {search && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-full">
                                &ldquo;{search}&rdquo;
                                <button onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }} className="hover:text-violet-900">&times;</button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto" />
                        <p className="text-sm text-gray-500 mt-3">Loading activity log...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
                        <p className="text-gray-500 mt-3 font-medium">No activity found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {resource || search ? "Try adjusting your filters" : "Admin actions will appear here as they happen"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {entries.map((entry, i) => {
                            const resourceType = entry.resource || "unknown";
                            const colorClass = RESOURCE_COLORS[resourceType] || "bg-gray-50 text-gray-700 border-gray-200";
                            const icon = RESOURCE_ICONS[resourceType] || <Activity className="w-4 h-4" />;
                            const actionLabel = ACTION_LABELS[entry.action] || entry.action;
                            return (
                                <div key={entry.id || i} className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${colorClass}`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm">{actionLabel}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${colorClass}`}>
                                                {resourceType}
                                            </span>
                                        </div>
                                        {entry.details && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{entry.details}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span title={formatFullDate(entry.createdAt)}>{formatTimeAgo(entry.createdAt)}</span>
                                            </span>
                                            {entry.userId && (
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    User #{entry.userId}
                                                </span>
                                            )}
                                            {entry.resourceId && (
                                                <span className="text-gray-400">ID: {entry.resourceId}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right hidden sm:block">
                                        <span className="text-xs text-gray-500">{formatFullDate(entry.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-sm text-gray-500">
                            Showing {page * limit + 1}--{Math.min((page + 1) * limit, total)} of {total} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>
                            <span className="text-sm text-gray-600 px-2">Page {page + 1} of {totalPages}</span>
                            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center text-xs text-gray-500">
                <p>Activity log records all admin actions for audit and compliance purposes.</p>
            </div>
        </div>
    );
}
