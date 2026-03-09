"use client";

import { motion } from "framer-motion";
import {
    ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";

// ─── Types (shared across admin pages) ─────────────────────

export interface DashboardStats {
    revenue: { current: number; previous: number; change: number };
    orders: { current: number; previous: number; change: number; pending: number };
    customers: { newCurrent: number; newPrevious: number; change: number };
    averageOrderValue: number;
    statusBreakdown: { status: string; count: number }[];
}

export interface Order {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    trackingNumber?: string;
    user?: { name: string; email: string };
    items: { name: string; quantity: number; price?: number }[];
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    category: string;
    price: number;
    salePrice?: number | null;
    status: string;
    image: string;
    featured: boolean;
    inventory?: { quantity: number; lowStockAt: number } | null;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    lastLogin?: string;
    _count: { orders: number };
}

export interface Coupon {
    id: number;
    code: string;
    description?: string;
    type: string;
    value: number;
    minOrderTotal?: number;
    maxUses?: number;
    usedCount: number;
    active: boolean;
    validFrom: string;
    validUntil?: string;
}

// ─── Status Colors ──────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PROCESSING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PAYMENT_CONFIRMED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    LABEL_PRINTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    SHIPPED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    IN_TRANSIT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
    COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
    REFUNDED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    DRAFT: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    OUT_OF_STOCK: "bg-red-500/20 text-red-400 border-red-500/30",
    DISCONTINUED: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ─── Utility Components ─────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${STATUS_COLORS[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

export function StatCard({ label, value, icon: Icon, color, change, prefix = "" }: {
    label: string; value: string; icon: React.ElementType; color: string; change?: number; prefix?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                </div>
                {change !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${change >= 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                        {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold">{prefix}{value}</div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
        </motion.div>
    );
}

export function EmptyState({ icon: Icon, title, description, action }: {
    icon: React.ElementType; title: string; description: string; action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-300">{title}</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-md">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
    );
}

export function OrderTable({ orders, showTracking = false }: { orders: Order[]; showTracking?: boolean }) {
    if (orders.length === 0) return null;
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                        <th className="text-left pb-3 pl-4">Order</th>
                        <th className="text-left pb-3">Customer</th>
                        <th className="text-left pb-3">Items</th>
                        <th className="text-left pb-3">Status</th>
                        {showTracking && <th className="text-left pb-3">Tracking</th>}
                        <th className="text-right pb-3 pr-4">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 pl-4">
                                <div className="font-mono text-sm font-medium text-green-400">{order.orderNumber}</div>
                                <div className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="py-3">
                                <div className="text-sm">{order.user?.name || "Guest"}</div>
                                <div className="text-xs text-zinc-500">{order.user?.email || "—"}</div>
                            </td>
                            <td className="py-3">
                                <div className="text-sm text-zinc-300">
                                    {order.items.slice(0, 2).map(i => `${i.name} ×${i.quantity}`).join(", ")}
                                    {order.items.length > 2 && ` +${order.items.length - 2} more`}
                                </div>
                            </td>
                            <td className="py-3"><StatusBadge status={order.status} /></td>
                            {showTracking && (
                                <td className="py-3">
                                    <span className="text-xs font-mono text-zinc-400">{order.trackingNumber || "—"}</span>
                                </td>
                            )}
                            <td className="py-3 pr-4 text-right font-mono font-medium">${order.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
