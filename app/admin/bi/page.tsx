"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function BiReportsPage() {
  const [period, setPeriod] = useState<string>("30d");

  const sites = trpc.reporting.listSites.useQuery(undefined, { retry: false });
  // Convert period label to date range
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = (() => {
    const d = new Date();
    if (period === "7d") d.setDate(d.getDate() - 7);
    else if (period === "30d") d.setDate(d.getDate() - 30);
    else if (period === "90d") d.setDate(d.getDate() - 90);
    else d.setMonth(0, 1); // ytd
    return d.toISOString().slice(0, 10);
  })();

  const report = trpc.reporting.getUnifiedReport.useQuery(
    { startDate, endDate },
    { retry: false }
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">BI Reports</h1>
            <p className="text-white/60 mt-1">
              Unified reporting across all channels
            </p>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "ytd"].map((p) => (
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

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {report.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-24 mb-3" />
                <div className="h-8 bg-white/10 rounded w-20" />
              </div>
            ))
          ) : report.isError ? (
            <div className="col-span-3 bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
              Unable to load unified report. Connect the tRPC reporting router.
            </div>
          ) : (
            <>
              <RevenueCard
                label="Total Revenue"
                value={report.data?.combined?.totalRevenue ?? 0}
              />
              <RevenueCard
                label="POS Revenue"
                value={report.data?.inStore?.revenue ?? 0}
                sublabel="In-store sales"
              />
              <RevenueCard
                label="Online Revenue"
                value={report.data?.online?.revenue ?? 0}
                sublabel="Website orders"
              />
            </>
          )}
        </div>

        {/* Key Metrics */}
        {!report.isError && !report.isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Total Transactions"
              value={String(report.data?.combined?.totalTransactions ?? 0)}
            />
            <MetricCard
              label="Avg. Order Value"
              value={`$${(report.data?.online?.avgOrderValue ?? 0).toFixed(2)}`}
            />
            <MetricCard
              label="Online Orders"
              value={String(report.data?.online?.orders ?? 0)}
            />
            <MetricCard
              label="In-Store Transactions"
              value={String(report.data?.inStore?.transactions ?? 0)}
            />
          </div>
        )}

        {/* Site Monitors */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Site Monitors</h2>
          {sites.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : sites.isError ? (
            <p className="text-white/40">
              Unable to load sites. Connect the tRPC reporting router.
            </p>
          ) : (sites.data ?? []).length === 0 ? (
            <p className="text-white/40">No sites configured for monitoring.</p>
          ) : (
            <div className="space-y-3">
              {(sites.data ?? []).map((site: any) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        site.status === "up" || site.status === "healthy"
                          ? "bg-green-400"
                          : site.status === "degraded"
                            ? "bg-yellow-400"
                            : "bg-red-400"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{site.name}</p>
                      <p className="text-white/40 text-sm">{site.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {site.responseTime ?? "N/A"}
                      {typeof site.responseTime === "number" ? "ms" : ""}
                    </p>
                    <p className="text-white/40 text-xs">
                      {site.uptime ? `${site.uptime}% uptime` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RevenueCard({
  label,
  value,
  change,
  sublabel,
}: {
  label: string;
  value: number;
  change?: number;
  sublabel?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <p className="text-white/50 text-sm mb-1">{label}</p>
      {sublabel && <p className="text-white/30 text-xs mb-2">{sublabel}</p>}
      <p className="text-2xl font-bold">${value.toLocaleString()}</p>
      {change !== undefined && (
        <p
          className={`text-sm mt-1 ${change >= 0 ? "text-green-400" : "text-red-400"}`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}% vs prev. period
        </p>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
