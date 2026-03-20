"use client";

import { useState } from "react";

interface FlashSale {
  id: string;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  status: "scheduled" | "active" | "ended";
  productCount: number;
}

export default function FlashSalesPage() {
  const [showForm, setShowForm] = useState(false);
  const [sales] = useState<FlashSale[]>([]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Flash Sales</h1>
            <p className="text-white/60 mt-1">
              Create and manage time-limited promotions
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showForm ? "Cancel" : "+ Create Flash Sale"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">New Flash Sale</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowForm(false);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Sale Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekend Blitz"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Discount %
                </label>
                <input
                  type="number"
                  placeholder="20"
                  min="1"
                  max="100"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Create Sale
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sales Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Sale Name
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Start
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    End
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Products
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
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      No flash sales created yet. Click &quot;Create Flash
                      Sale&quot; to set up a promotion.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{sale.name}</td>
                      <td className="px-6 py-4 text-sm">{sale.discount}%</td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(sale.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(sale.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {sale.productCount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                            sale.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : sale.status === "scheduled"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-white/10 text-white/40"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-white/40 hover:text-white text-sm transition-colors">
                          Edit
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
