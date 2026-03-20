"use client";

import { useState } from "react";

export default function GiftCardsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gift Cards</h1>
            <p className="text-white/60 mt-1">
              Issue, track, and manage gift cards
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showForm ? "Cancel" : "+ Issue Gift Card"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Issued" value="--" />
          <StatCard label="Active Cards" value="--" />
          <StatCard label="Total Value" value="$--" />
          <StatCard label="Redeemed" value="$--" />
        </div>

        {/* Issue Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Issue New Gift Card</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowForm(false);
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="50.00"
                  min="5"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Issue Card
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gift Cards Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Code
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Original Value
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Issued To
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Issued Date
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Expiry
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No gift cards issued yet. Click &quot;Issue Gift Card&quot;
                    to create one.
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-white/50 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
