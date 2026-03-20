"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

const STATUS_OPTIONS = ["all", "draft", "submitted", "received", "cancelled"] as const;

export default function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const purchaseOrders = trpc.inventory.listPurchaseOrders.useQuery(
    statusFilter !== "all" ? { status: statusFilter } : {},
    { retry: false }
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Purchase Orders</h1>
            <p className="text-white/60 mt-1">
              Track and manage supplier purchase orders
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/inventory"
              className="text-white/50 hover:text-white text-sm transition-colors px-3 py-2"
            >
              &larr; Back to Inventory
            </a>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              + New Purchase Order
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                statusFilter === status
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* PO Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    PO #
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Items
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Total
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Expected
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : purchaseOrders.isError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      Unable to load purchase orders. The tRPC inventory router
                      may not be connected yet.
                    </td>
                  </tr>
                ) : (purchaseOrders.data ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  (purchaseOrders.data ?? []).map((po: any) => (
                    <tr
                      key={po.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm">
                        {po.poNumber ?? `PO-${po.id?.toString().slice(-6)}`}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {po.vendor?.name ?? po.vendorName ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {po.itemCount ?? po.items?.length ?? 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ${(po.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-white/50">
                        {po.expectedDate
                          ? new Date(po.expectedDate).toLocaleDateString()
                          : "TBD"}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-white/40 hover:text-white text-sm transition-colors">
                          View
                        </button>
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

function StatusBadge({ status }: { status?: string }) {
  const styles: Record<string, string> = {
    draft: "bg-white/10 text-white/50",
    submitted: "bg-blue-500/20 text-blue-400",
    received: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };
  const s = status ?? "draft";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs capitalize ${styles[s] ?? styles.draft}`}
    >
      {s}
    </span>
  );
}
