"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function WarehouseTransfersPage() {
  const warehouses = trpc.inventory.listWarehouses.useQuery(undefined, {
    retry: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const warehouseList = warehouses.data ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Transfers</h1>
            <p className="text-white/60 mt-1">
              Move inventory between warehouse locations
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/inventory"
              className="text-white/50 hover:text-white text-sm transition-colors px-3 py-2"
            >
              &larr; Back to Inventory
            </a>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {showForm ? "Cancel" : "+ New Transfer"}
            </button>
          </div>
        </div>

        {/* Transfer Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create Transfer</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Transfer mutation would go here
                alert(
                  `Transfer: ${quantity}x ${sku} from ${fromWarehouse} to ${toWarehouse}`
                );
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">
                    From Warehouse
                  </label>
                  <select
                    value={fromWarehouse}
                    onChange={(e) => setFromWarehouse(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  >
                    <option value="">Select source...</option>
                    {warehouseList.map((wh: any) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">
                    To Warehouse
                  </label>
                  <select
                    value={toWarehouse}
                    onChange={(e) => setToWarehouse(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  >
                    <option value="">Select destination...</option>
                    {warehouseList
                      .filter((wh: any) => wh.id !== fromWarehouse)
                      .map((wh: any) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">
                    SKU / Product
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Enter SKU or product name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional transfer notes..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Submit Transfer
              </button>
            </form>
            {warehouses.isError && (
              <p className="text-yellow-400 text-sm mt-3">
                Warehouse list unavailable. Connect the tRPC inventory router.
              </p>
            )}
          </div>
        )}

        {/* Transfer History Placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Transfer History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Transfer #
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    From
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    To
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Items
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No transfers recorded yet. Create a new transfer to get
                    started.
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
