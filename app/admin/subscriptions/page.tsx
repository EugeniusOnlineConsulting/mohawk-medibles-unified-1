"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  bimonthly: "Bi-Monthly",
  quarterly: "Quarterly",
};

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");

  const { data: subsData, refetch } = trpc.subscriptions.adminList.useQuery({}, { refetchOnWindowFocus: false });
  const { data: stats } = trpc.subscriptions.adminStats.useQuery(undefined, { refetchOnWindowFocus: false });

  const subscriptions = subsData?.subscriptions || [];
  const filteredSubs = subscriptions.filter((s: any) =>
    s.userName?.toLowerCase().includes(search.toLowerCase()) ||
    s.productName?.toLowerCase().includes(search.toLowerCase()) ||
    s.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-white/60 mt-1">Auto-reorder subscription management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Subscriptions", value: stats?.active || 0, color: "text-violet-400" },
            { label: "Total Subscriptions", value: stats?.total || 0, color: "text-blue-400" },
            { label: "Paused", value: stats?.paused || 0, color: "text-amber-400" },
            { label: "Total Orders Created", value: stats?.totalOrders || 0, color: "text-green-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <span className="text-white/50 text-xs uppercase tracking-wider">{stat.label}</span>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <input
            className="flex-1 max-w-sm px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-all"
            placeholder="Search by customer, product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all"
          >
            Refresh
          </button>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Customer</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Product</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Qty</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Frequency</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Price</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Next Order</th>
                  <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-white/30">No subscriptions found</td></tr>
                ) : filteredSubs.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <div>
                        <span className="text-white text-xs font-bold">{sub.userName || "Unknown"}</span>
                        {sub.userEmail && <span className="text-white/40 text-xs block">{sub.userEmail}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-white/70 text-xs">{sub.productName || `Product #${sub.productId}`}</td>
                    <td className="p-3 text-white/70 text-xs">{sub.quantity}</td>
                    <td className="p-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border text-blue-400 border-blue-500/30 bg-blue-500/10">
                        {FREQ_LABELS[sub.frequency] || sub.frequency}
                      </span>
                    </td>
                    <td className="p-3 text-violet-400 font-bold text-xs">${Number(sub.price || 0).toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                        sub.status === "active" ? "text-green-400 border-green-500/30 bg-green-500/10" :
                        sub.status === "paused" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                        "text-red-400 border-red-500/30 bg-red-500/10"
                      }`}>{sub.status}</span>
                    </td>
                    <td className="p-3 text-white/40 text-xs">
                      {sub.nextOrderAt ? new Date(sub.nextOrderAt).toLocaleDateString() : "--"}
                    </td>
                    <td className="p-3 text-white/40 text-xs">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">How Subscriptions Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Customer Signs Up", desc: "Customers choose a product, quantity, and delivery frequency from the product page." },
              { title: "Auto-Reorder", desc: "When the next order date arrives, the system creates a new order automatically with a 10% subscription discount." },
              { title: "Process Due Orders", desc: "Click 'Process Due Orders' to trigger all pending subscription orders. Run this daily for best results." },
            ].map((step, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-white text-sm font-bold">{step.title}</p>
                </div>
                <p className="text-white/40 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
