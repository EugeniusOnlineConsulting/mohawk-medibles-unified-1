"use client";

import { useState } from "react";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function ReviewModerationPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filters: FilterStatus[] = ["all", "pending", "approved", "rejected"];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Review Moderation</h1>
            <p className="text-white/60 mt-1">
              Approve, reject, and manage customer reviews
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
              0 Pending
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Total Reviews</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Avg. Rating</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">This Month</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Response Rate</p>
            <p className="text-2xl font-bold">--%</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === f
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Reviews Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Product
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Review
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Date
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No reviews to moderate. Reviews will appear here once
                    customers submit them.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
