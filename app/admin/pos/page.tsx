"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function PosTerminalPage() {
  const employees = trpc.pos.listEmployees.useQuery(undefined, {
    retry: false,
  });
  const dailySummary = trpc.pos.dailySummary.useQuery({}, {
    retry: false,
  });

  const [activeShift, setActiveShift] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">POS Terminal</h1>
            <p className="text-white/60 mt-1">
              Point of sale management and transactions
            </p>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            onClick={() => setActiveShift("new")}
          >
            Start New Transaction
          </button>
        </div>

        {/* Daily Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {dailySummary.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-24 mb-3" />
                <div className="h-8 bg-white/10 rounded w-16" />
              </div>
            ))
          ) : dailySummary.isError ? (
            <div className="col-span-4 bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
              Failed to load daily summary. tRPC router may not be connected
              yet.
            </div>
          ) : (
            <>
              <SummaryCard
                label="Total Sales"
                value={`$${(dailySummary.data?.totalRevenue ?? 0).toLocaleString()}`}
              />
              <SummaryCard
                label="Transactions"
                value={String(dailySummary.data?.totalTransactions ?? 0)}
              />
              <SummaryCard
                label="Avg. Transaction"
                value={`$${(dailySummary.data?.avgTransactionValue ?? 0).toFixed(2)}`}
              />
              <SummaryCard
                label="Payment Methods"
                value={String(Object.keys(dailySummary.data?.byPaymentMethod ?? {}).length)}
              />
            </>
          )}
        </div>

        {/* Active Shift Info */}
        {activeShift && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-400">
                  Active Shift
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  Started at {new Date().toLocaleTimeString()}
                </p>
              </div>
              <button
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
                onClick={() => setActiveShift(null)}
              >
                End Shift
              </button>
            </div>
          </div>
        )}

        {/* Employee Grid */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Employees on Duty</h2>
          {employees.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 animate-pulse"
                >
                  <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-20" />
                </div>
              ))}
            </div>
          ) : employees.isError ? (
            <p className="text-white/40">
              Unable to load employees. Connect the tRPC pos router to enable
              this feature.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(employees.data ?? []).map((emp: any) => (
                <div
                  key={emp.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-white/50 text-sm">{emp.role ?? "Staff"}</p>
                  <span
                    className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                      emp.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {emp.active ? "On Duty" : "Off Duty"}
                  </span>
                </div>
              ))}
              {(employees.data ?? []).length === 0 && (
                <p className="text-white/40 col-span-3">
                  No employees found. Add employees in the Employees tab.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <a
            href="/admin/pos/transactions"
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
          >
            <h3 className="font-semibold mb-1">Transaction History</h3>
            <p className="text-white/50 text-sm">
              View all past POS transactions
            </p>
          </a>
          <a
            href="/admin/pos/employees"
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
          >
            <h3 className="font-semibold mb-1">Manage Employees</h3>
            <p className="text-white/50 text-sm">
              Add, edit, and manage POS employees
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <p className="text-white/50 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
