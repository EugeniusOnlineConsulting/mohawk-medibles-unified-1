"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, ExternalLink,
  ChevronDown, Image as ImageIcon, DollarSign, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceMatchRequest {
  id: number;
  email: string;
  productName: string;
  competitorUrl: string;
  competitorPrice: number;
  screenshotUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  adminNote: string | null;
  matchedPrice: number | null;
  createdAt: string;
  user?: { name: string; email: string } | null;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}

const STATUS_CONFIG = {
  PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400", icon: Clock, label: "Pending" },
  APPROVED: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400", icon: CheckCircle2, label: "Approved" },
  REJECTED: { color: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400", icon: XCircle, label: "Rejected" },
  EXPIRED: { color: "bg-gray-100 text-gray-800 dark:bg-gray-500/15 dark:text-gray-400", icon: Clock, label: "Expired" },
};

export default function AdminPriceMatchPage() {
  const [requests, setRequests] = useState<PriceMatchRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED">("ALL");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [matchedPrice, setMatchedPrice] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    setLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.all([
        fetch(`/api/trpc/priceMatch.list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: { status: filter } }),
        }),
        fetch(`/api/trpc/priceMatch.stats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json: undefined }),
        }),
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data?.result?.data?.json?.requests ?? []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data?.result?.data?.json ?? null);
      }
    } catch {
      // Silent fail
    }
    setLoading(false);
  }

  async function handleReview(id: number, status: "APPROVED" | "REJECTED") {
    try {
      await fetch(`/api/trpc/priceMatch.review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            id,
            status,
            matchedPrice: matchedPrice ? parseFloat(matchedPrice) : undefined,
            adminNote: adminNote || undefined,
          },
        }),
      });
      setReviewingId(null);
      setMatchedPrice("");
      setAdminNote("");
      fetchData();
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
            Price Match Requests
          </h1>
          <p className="text-sm text-white/60 mt-1">Review and manage customer price match claims</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Requests", value: stats.total, icon: ShieldCheck, color: "text-white" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-400" },
            { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-400" },
            { label: "Approval Rate", value: `${stats.approvalRate}%`, icon: TrendingUp, color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED", "EXPIRED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === f
                ? "bg-emerald-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12 text-white/50">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <ShieldCheck className="h-12 w-12 text-white/20 mx-auto" />
          <p className="text-white/50">No price match requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusConf = STATUS_CONFIG[req.status];
            const StatusIcon = statusConf.icon;
            const isReviewing = reviewingId === req.id;

            return (
              <div key={req.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{req.productName}</h3>
                    <p className="text-sm text-white/50 mt-0.5">{req.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <a
                        href={req.competitorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Competitor Link
                      </a>
                      {req.screenshotUrl && (
                        <a
                          href={req.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ImageIcon className="h-3 w-3" />
                          Screenshot
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Competitor Price</p>
                    <p className="text-xl font-black text-amber-400">${req.competitorPrice.toFixed(2)}</p>
                    {req.matchedPrice && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        Matched: ${req.matchedPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConf.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConf.label}
                    </span>
                    {req.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white"
                        onClick={() => setReviewingId(isReviewing ? null : req.id)}
                      >
                        Review
                        <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isReviewing ? "rotate-180" : ""}`} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Review Panel */}
                {isReviewing && (
                  <div className="border-t border-white/5 p-5 bg-white/[0.02] space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-white/50 font-bold uppercase tracking-wider mb-1.5">
                          Matched Price (after 5% discount)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <input
                            type="number"
                            step="0.01"
                            value={matchedPrice}
                            onChange={(e) => setMatchedPrice(e.target.value)}
                            placeholder={`Suggested: ${(req.competitorPrice * 0.95).toFixed(2)}`}
                            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 font-bold uppercase tracking-wider mb-1.5">
                          Admin Note (optional)
                        </label>
                        <input
                          type="text"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Internal note..."
                          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReview(req.id, "APPROVED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReview(req.id, "REJECTED")}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => { setReviewingId(null); setMatchedPrice(""); setAdminNote(""); }}
                        className="text-white/50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Admin note display */}
                {req.adminNote && (
                  <div className="border-t border-white/5 px-5 py-3 bg-white/[0.01]">
                    <p className="text-xs text-white/40">
                      <span className="font-bold">Note:</span> {req.adminNote}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
