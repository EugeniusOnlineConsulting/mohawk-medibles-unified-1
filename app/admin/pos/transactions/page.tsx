"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function PosTransactionsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const transactions = trpc.pos.listTransactions.useQuery(
    {
      ...(dateFrom ? { startDate: dateFrom } : {}),
      ...(dateTo ? { endDate: dateTo } : {}),
    },
    { retry: false }
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-white/60 mt-1">
              POS transaction records and details
            </p>
          </div>
          <a
            href="/admin/pos"
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            &larr; Back to POS
          </a>
        </div>

        {/* Date Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-white/50 text-sm mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
            }}
            className="text-white/40 hover:text-white text-sm transition-colors px-3 py-2"
          >
            Clear Filters
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    ID
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Date
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Items
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Total
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : transactions.isError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      Unable to load transactions. The tRPC pos router may not
                      be connected yet.
                    </td>
                  </tr>
                ) : (transactions.data?.transactions ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      No transactions found for the selected date range.
                    </td>
                  </tr>
                ) : (
                  (transactions.data?.transactions ?? []).map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm">
                        #{tx.id?.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {tx.employee?.name ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {tx.itemCount ?? tx.items?.length ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ${(tx.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                          {tx.paymentMethod ?? "Cash"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            tx.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : tx.status === "refunded"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {tx.status ?? "completed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
