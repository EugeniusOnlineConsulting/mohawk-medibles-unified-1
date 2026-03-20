"use client";

import { trpc } from "@/lib/trpc";

export default function SitesPage() {
  const sites = trpc.reporting.listSites.useQuery(undefined, { retry: false });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Site Monitor</h1>
            <p className="text-white/60 mt-1">
              Uptime and performance monitoring for all sites
            </p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + Add Site
          </button>
        </div>

        {sites.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse"
              >
                <div className="h-5 bg-white/10 rounded w-48 mb-3" />
                <div className="h-4 bg-white/10 rounded w-64" />
              </div>
            ))}
          </div>
        ) : sites.isError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
            Unable to load sites. Connect the tRPC reporting router.
          </div>
        ) : (sites.data ?? []).length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-white/40 mb-4">
              No sites configured for monitoring.
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
              Add Your First Site
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {(sites.data ?? []).map((site: any) => {
              const isUp =
                site.status === "up" || site.status === "healthy";
              const isDegraded = site.status === "degraded";
              return (
                <div
                  key={site.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          isUp
                            ? "bg-green-400"
                            : isDegraded
                              ? "bg-yellow-400"
                              : "bg-red-400"
                        }`}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{site.name}</h3>
                        <p className="text-white/40 text-sm">{site.url}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isUp
                          ? "bg-green-500/20 text-green-400"
                          : isDegraded
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {(site.status ?? "unknown").toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-white/40 text-xs">Response Time</p>
                      <p className="font-medium">
                        {site.responseTime != null
                          ? `${site.responseTime}ms`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Uptime (30d)</p>
                      <p className="font-medium">
                        {site.uptime != null ? `${site.uptime}%` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">SSL Expires</p>
                      <p className="font-medium">
                        {site.sslExpiry
                          ? new Date(site.sslExpiry).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Last Checked</p>
                      <p className="font-medium">
                        {site.lastChecked
                          ? new Date(site.lastChecked).toLocaleTimeString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
