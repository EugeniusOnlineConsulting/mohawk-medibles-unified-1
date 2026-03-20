"use client";

import { useState } from "react";

export default function AbandonedCartsPage() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Abandoned Carts</h1>
            <p className="text-white/60 mt-1">
              Track and recover abandoned shopping carts
            </p>
          </div>
          <div className="flex gap-2">
            {["24h", "7d", "30d", "90d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm uppercase transition-colors ${
                  period === p
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Recovery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Active Carts</p>
            <p className="text-2xl font-bold">--</p>
            <p className="text-white/30 text-xs mt-1">
              Carts with items, no checkout
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Abandoned Value</p>
            <p className="text-2xl font-bold text-yellow-400">$--</p>
            <p className="text-white/30 text-xs mt-1">
              Potential revenue at risk
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Recovery Rate</p>
            <p className="text-2xl font-bold text-green-400">--%</p>
            <p className="text-white/30 text-xs mt-1">
              Carts recovered via email
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Recovered Revenue</p>
            <p className="text-2xl font-bold text-green-400">$--</p>
            <p className="text-white/30 text-xs mt-1">
              Revenue from recovered carts
            </p>
          </div>
        </div>

        {/* Abandoned Carts Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold">Abandoned Carts</h2>
            <button className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-1.5 rounded-lg text-sm transition-colors">
              Send Recovery Emails
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Email
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Items
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Cart Value
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Abandoned At
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Recovery Status
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
                    No abandoned carts detected in the selected period. Cart
                    tracking data will appear here once configured.
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
