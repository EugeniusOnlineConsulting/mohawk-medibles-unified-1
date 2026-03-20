"use client";

import { useState } from "react";

type EmailFilter = "all" | "sent" | "failed" | "bounced";

export default function EmailLogsPage() {
  const [filter, setFilter] = useState<EmailFilter>("all");
  const [search, setSearch] = useState("");

  const filters: EmailFilter[] = ["all", "sent", "failed", "bounced"];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Email Logs</h1>
            <p className="text-white/60 mt-1">
              View sent emails, delivery status, and bounce tracking
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Total Sent</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-400">--</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-400">--</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/50 text-sm mb-1">Bounce Rate</p>
            <p className="text-2xl font-bold">--%</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex gap-2">
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
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, subject, or template..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Email Logs Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Recipient
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Template
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Sent At
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Provider
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No email logs found. Emails sent via Resend will appear here
                    once the logging integration is configured.
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
