"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, XCircle,
  Eye, Loader2, RefreshCw, ChevronDown, ChevronUp,
  User, ShoppingCart, DollarSign, Clock, Filter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────

interface FraudAlert {
  id: string;
  orderId: string;
  score: number;
  flags: string[];
  status: "CLEAN" | "SUSPICIOUS" | "BLOCKED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    paymentMethod: string | null;
    paymentMethodTitle: string | null;
    ipAddress: string | null;
    billingData: string | null;
    shippingData: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
    items: {
      name: string;
      quantity: number;
      price: number;
      total: number;
    }[];
  };
}

interface FraudStats {
  pendingReview: number;
  suspicious: number;
  totalBlocked: number;
}

// ─── Helpers ──────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 61) return "text-red-400";
  if (score >= 31) return "text-amber-400";
  return "text-green-400";
}

function getScoreBg(score: number): string {
  if (score >= 61) return "bg-red-500/10";
  if (score >= 31) return "bg-amber-500/10";
  return "bg-green-500/10";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "BLOCKED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400">
          <XCircle className="h-3 w-3" /> Blocked
        </span>
      );
    case "SUSPICIOUS":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400">
          <AlertTriangle className="h-3 w-3" /> Suspicious
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/15 text-green-400">
          <CheckCircle className="h-3 w-3" /> Clean
        </span>
      );
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────

export default function FraudReviewPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      const res = await fetch(`/api/admin/fraud?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setStats(data.stats || null);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleReview(fraudCheckId: string, action: "APPROVE" | "BLOCK") {
    setActionLoading(fraudCheckId);
    try {
      const res = await fetch("/api/admin/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fraudCheckId, action }),
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch {
      // silent
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            Fraud Review
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Monitor and review flagged orders for suspicious activity.
          </p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/5 text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-2xl p-5 bg-[#0f0f18]"
            style={{ boxShadow: "0 4px 24px rgba(239, 68, 68, 0.06)" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-sm text-zinc-400">Pending Review</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.pendingReview}</div>
          </div>

          <div
            className="rounded-2xl p-5 bg-[#0f0f18]"
            style={{ boxShadow: "0 4px 24px rgba(245, 158, 11, 0.06)" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Eye className="h-5 w-5 text-amber-400" />
              </div>
              <span className="text-sm text-zinc-400">Suspicious</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{stats.suspicious}</div>
          </div>

          <div
            className="rounded-2xl p-5 bg-[#0f0f18]"
            style={{ boxShadow: "0 4px 24px rgba(239, 68, 68, 0.06)" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <span className="text-sm text-zinc-400">Total Blocked</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.totalBlocked}</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <span className="text-sm text-zinc-400">Filter:</span>
        {["ALL", "BLOCKED", "SUSPICIOUS", "CLEAN"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              statusFilter === f
                ? "bg-amber-500/15 text-amber-400"
                : "bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400">No Fraud Alerts</h3>
          <p className="text-sm text-zinc-600 mt-1">
            {statusFilter === "ALL"
              ? "All orders are looking clean. No suspicious activity detected."
              : `No ${statusFilter.toLowerCase()} alerts found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert) => {
              const isExpanded = expandedId === alert.id;
              const isReviewed = !!alert.reviewedAt;
              let billing: Record<string, string> = {};
              let shipping: Record<string, string> = {};
              try {
                if (alert.order.billingData) billing = JSON.parse(alert.order.billingData);
                if (alert.order.shippingData) shipping = JSON.parse(alert.order.shippingData);
              } catch { /* ignore */ }

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#0f0f18] rounded-2xl overflow-hidden"
                  style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.2)" }}
                >
                  {/* Summary Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Score Circle */}
                    <div className={`w-14 h-14 rounded-xl ${getScoreBg(alert.score)} flex flex-col items-center justify-center flex-shrink-0`}>
                      <span className={`text-lg font-black ${getScoreColor(alert.score)}`}>
                        {alert.score}
                      </span>
                      <span className="text-[8px] text-zinc-500 uppercase tracking-wider">Score</span>
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{alert.order.orderNumber}</span>
                        {getStatusBadge(alert.status)}
                        {isReviewed && (
                          <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {alert.order.user.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> ${alert.order.total.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDate(alert.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Flags Preview */}
                    <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                      {(alert.flags as string[]).slice(0, 2).map((flag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-medium rounded-full"
                        >
                          {flag}
                        </span>
                      ))}
                      {(alert.flags as string[]).length > 2 && (
                        <span className="text-[10px] text-zinc-500">
                          +{(alert.flags as string[]).length - 2} more
                        </span>
                      )}
                    </div>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
                          {/* Flags Grid */}
                          <div>
                            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                              Fraud Flags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(alert.flags as string[]).map((flag, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg flex items-center gap-1.5"
                                >
                                  <AlertTriangle className="h-3 w-3" /> {flag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Customer */}
                            <div className="bg-white/[0.03] rounded-xl p-4">
                              <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                                Customer
                              </h5>
                              <p className="text-sm font-medium">{alert.order.user.name}</p>
                              <p className="text-xs text-zinc-400">{alert.order.user.email}</p>
                              <p className="text-xs text-zinc-500 mt-1">
                                Account created: {formatDate(alert.order.user.createdAt)}
                              </p>
                            </div>

                            {/* Billing */}
                            <div className="bg-white/[0.03] rounded-xl p-4">
                              <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                                Billing Address
                              </h5>
                              <p className="text-sm">
                                {billing.first_name} {billing.last_name}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {billing.address_1}
                                {billing.address_2 ? `, ${billing.address_2}` : ""}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {billing.city}, {billing.state} {billing.postcode}
                              </p>
                            </div>

                            {/* Shipping */}
                            <div className="bg-white/[0.03] rounded-xl p-4">
                              <h5 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                                Shipping Address
                              </h5>
                              <p className="text-sm">
                                {shipping.first_name} {shipping.last_name}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {shipping.address_1}
                                {shipping.address_2 ? `, ${shipping.address_2}` : ""}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {shipping.city}, {shipping.state} {shipping.postcode}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
                              Order Items
                            </h4>
                            <div className="bg-white/[0.03] rounded-xl overflow-hidden">
                              {alert.order.items.map((item, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                                    i < alert.order.items.length - 1 ? "border-b border-white/5" : ""
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <ShoppingCart className="h-3 w-3 text-zinc-600" />
                                    <span>{item.name}</span>
                                    <span className="text-zinc-600">x{item.quantity}</span>
                                  </span>
                                  <span className="font-medium">${item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span>Payment: {alert.order.paymentMethodTitle || alert.order.paymentMethod || "N/A"}</span>
                            <span>IP: {alert.order.ipAddress || "N/A"}</span>
                            <span>Order Status: {alert.order.status}</span>
                          </div>

                          {/* Actions */}
                          {!isReviewed && alert.status !== "CLEAN" && (
                            <div className="flex items-center gap-3 pt-2">
                              <button
                                onClick={() => handleReview(alert.id, "APPROVE")}
                                disabled={actionLoading === alert.id}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/15 text-green-400 text-sm font-bold hover:bg-green-500/25 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === alert.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                                Approve Order
                              </button>
                              <button
                                onClick={() => handleReview(alert.id, "BLOCK")}
                                disabled={actionLoading === alert.id}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/15 text-red-400 text-sm font-bold hover:bg-red-500/25 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === alert.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                Block Order
                              </button>
                            </div>
                          )}

                          {isReviewed && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              Reviewed on {formatDate(alert.reviewedAt!)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
