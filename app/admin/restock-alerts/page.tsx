"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    out_of_stock: "bg-red-500/20 text-red-400 border-red-500/30",
    critical: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  const labels: Record<string, string> = {
    out_of_stock: "Out of Stock",
    critical: "Critical",
    warning: "Warning",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${styles[severity] || "bg-white/10 text-white/50 border-white/20"}`}>
      {labels[severity] || severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-red-500/20 text-red-400 border-red-500/30",
    acknowledged: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    resolved: "bg-green-500/20 text-green-400 border-green-500/30",
    snoozed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${styles[status] || "bg-white/10 text-white/50 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function RestockAlertsPage() {
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState("active");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [restockModal, setRestockModal] = useState<{ productId: number; productName: string; variantId?: number | null } | null>(null);
  const [restockQty, setRestockQty] = useState("50");
  const [snoozeModal, setSnoozeModal] = useState<number | null>(null);
  const [snoozeHours, setSnoozeHours] = useState("24");
  const [bulkThresholdModal, setBulkThresholdModal] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState("10");
  const [selectedAlerts, setSelectedAlerts] = useState<Set<number>>(new Set());
  const [showHistory, setShowHistory] = useState(false);
  const [showDigestSettings, setShowDigestSettings] = useState(false);
  const [showDigestHistory, setShowDigestHistory] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.restockAlerts.stats.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: listData, isLoading: listLoading } = trpc.restockAlerts.list.useQuery(
    { status: statusFilter, severity: severityFilter, page, limit: 25, search: search || undefined },
    { refetchOnWindowFocus: false }
  );
  const { data: history } = trpc.restockAlerts.history.useQuery({ limit: 20 }, { refetchOnWindowFocus: false, enabled: showHistory });
  const { data: digestData } = trpc.restockAlerts.digestSettings.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: digestHistory } = trpc.restockAlerts.digestHistory.useQuery({ limit: 10 }, { refetchOnWindowFocus: false, enabled: showDigestHistory });

  const scanMutation = trpc.restockAlerts.scan.useMutation({
    onSuccess: (data) => {
      toast.success(`Scan complete: ${data.created} new alerts, ${data.resolved} resolved`);
      utils.restockAlerts.stats.invalidate();
      utils.restockAlerts.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const acknowledgeMutation = trpc.restockAlerts.acknowledge.useMutation({
    onSuccess: () => { toast.success("Alert acknowledged"); utils.restockAlerts.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const resolveMutation = trpc.restockAlerts.resolve.useMutation({
    onSuccess: () => { toast.success("Alert resolved"); utils.restockAlerts.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const snoozeMutation = trpc.restockAlerts.snooze.useMutation({
    onSuccess: () => { toast.success("Alert snoozed"); setSnoozeModal(null); utils.restockAlerts.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const restockMutation = trpc.restockAlerts.restock.useMutation({
    onSuccess: () => { toast.success("Product restocked!"); setRestockModal(null); setRestockQty("50"); utils.restockAlerts.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const bulkThresholdMutation = trpc.restockAlerts.bulkUpdateThresholds.useMutation({
    onSuccess: () => { toast.success(`Threshold updated for ${selectedAlerts.size} products`); setBulkThresholdModal(false); setSelectedAlerts(new Set()); utils.restockAlerts.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const digestMutation = trpc.restockAlerts.sendDigest.useMutation({
    onSuccess: (data) => { data.sent ? toast.success(`Digest sent with ${data.alertCount} alerts`) : toast.info("No active alerts to send"); },
    onError: (e) => toast.error(e.message),
  });

  const updateDigestMutation = trpc.restockAlerts.updateDigestSettings.useMutation({
    onSuccess: () => { toast.success("Digest settings updated"); utils.restockAlerts.digestSettings.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const totalPages = Math.ceil((listData?.total || 0) / 25);
  const alerts = listData?.alerts || [];

  const toggleSelect = (alertId: number) => {
    setSelectedAlerts(prev => { const next = new Set(prev); if (next.has(alertId)) next.delete(alertId); else next.add(alertId); return next; });
  };
  const toggleSelectAll = () => {
    selectedAlerts.size === alerts.length ? setSelectedAlerts(new Set()) : setSelectedAlerts(new Set(alerts.map((a: any) => a.id)));
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Restock Alerts</h1>
            <p className="text-white/60 mt-1">Low stock management and automated notifications</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {scanMutation.isPending ? "Scanning..." : "Scan Inventory"}
          </button>
          <button
            onClick={() => digestMutation.mutate()}
            disabled={digestMutation.isPending}
            className="px-4 py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {digestMutation.isPending ? "Sending..." : "Send Alert Digest"}
          </button>
          {selectedAlerts.size > 0 && (
            <button
              onClick={() => setBulkThresholdModal(true)}
              className="px-4 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              Update Threshold ({selectedAlerts.size})
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Active", value: stats?.active || 0, color: "text-red-400" },
            { label: "Out of Stock", value: stats?.outOfStock || 0, color: "text-red-500" },
            { label: "Critical", value: stats?.critical || 0, color: "text-orange-400" },
            { label: "Warning", value: stats?.warning || 0, color: "text-amber-400" },
            { label: "Acknowledged", value: stats?.acknowledged || 0, color: "text-blue-400" },
            { label: "Resolved Today", value: stats?.resolvedToday || 0, color: "text-green-400" },
            { label: "Snoozed", value: stats?.snoozed || 0, color: "text-purple-400" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">{s.label}</span>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="flex-1 min-w-[200px] px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-all"
            />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="snoozed">Snoozed</option>
            </select>
            <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500">
              <option value="all">All Severities</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Restock Alerts ({listData?.total || 0})
            </h3>
          </div>

          {listLoading ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/60 font-medium">No alerts found</p>
              <p className="text-white/30 text-xs mt-1">Click &quot;Scan Inventory&quot; to check for low stock products</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 w-8">
                        <input type="checkbox" checked={selectedAlerts.size === alerts.length && alerts.length > 0} onChange={toggleSelectAll} className="rounded border-white/20" />
                      </th>
                      <th className="p-3 text-white/50 text-xs font-bold uppercase">Product</th>
                      <th className="p-3 text-center text-white/50 text-xs font-bold uppercase">Stock</th>
                      <th className="p-3 text-center text-white/50 text-xs font-bold uppercase">Threshold</th>
                      <th className="p-3 text-center text-white/50 text-xs font-bold uppercase">Severity</th>
                      <th className="p-3 text-center text-white/50 text-xs font-bold uppercase">Status</th>
                      <th className="p-3 text-center text-white/50 text-xs font-bold uppercase">Created</th>
                      <th className="p-3 text-right text-white/50 text-xs font-bold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {alerts.map((alert: any) => (
                      <tr key={alert.id} className="hover:bg-white/5">
                        <td className="p-3">
                          <input type="checkbox" checked={selectedAlerts.has(alert.id)} onChange={() => toggleSelect(alert.id)} className="rounded border-white/20" />
                        </td>
                        <td className="p-3">
                          <p className="text-white font-medium truncate max-w-[250px]">{alert.productName}</p>
                          <p className="text-[10px] text-white/40">ID: {alert.productId}</p>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-lg font-black ${alert.currentStock === 0 ? 'text-red-500' : alert.severity === 'critical' ? 'text-orange-400' : 'text-amber-400'}`}>
                            {alert.currentStock}
                          </span>
                        </td>
                        <td className="p-3 text-center text-white/50">{alert.threshold}</td>
                        <td className="p-3 text-center"><SeverityBadge severity={alert.severity} /></td>
                        <td className="p-3 text-center"><StatusBadge status={alert.status} /></td>
                        <td className="p-3 text-center text-xs text-white/40">{new Date(alert.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            {alert.status === "active" && (
                              <>
                                <button onClick={() => setRestockModal({ productId: alert.productId, productName: alert.productName, variantId: alert.variantId })} className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">Restock</button>
                                <button onClick={() => acknowledgeMutation.mutate({ alertId: alert.id })} className="px-2 py-1 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">Ack</button>
                                <button onClick={() => setSnoozeModal(alert.id)} className="px-2 py-1 text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors">Snooze</button>
                              </>
                            )}
                            {alert.status === "acknowledged" && (
                              <>
                                <button onClick={() => setRestockModal({ productId: alert.productId, productName: alert.productName, variantId: alert.variantId })} className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">Restock</button>
                                <button onClick={() => resolveMutation.mutate({ alertId: alert.id })} className="px-2 py-1 text-[10px] font-bold bg-white/10 text-white/60 rounded hover:bg-white/20 transition-colors">Resolve</button>
                              </>
                            )}
                            {alert.status === "snoozed" && (
                              <span className="text-[10px] text-purple-400">Until {alert.snoozedUntil ? new Date(alert.snoozedUntil).toLocaleString() : "--"}</span>
                            )}
                            {alert.status === "resolved" && (
                              <span className="text-[10px] text-green-400">{alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleDateString() : "--"}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                  <p className="text-xs text-white/40">{listData?.total} total alerts</p>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-white/10 rounded text-white/50 hover:text-white disabled:opacity-30">Prev</button>
                    <span className="px-3 py-1.5 text-xs text-white/40">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-white/10 rounded text-white/50 hover:text-white disabled:opacity-30">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          {showHistory ? "Hide" : "Show"} Recently Resolved Alerts
        </button>

        {showHistory && history && history.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recently Resolved</h3>
            </div>
            <div className="divide-y divide-white/5">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-white">{h.productName}</p>
                    <p className="text-[10px] text-white/40">
                      Was at {h.currentStock} / {h.threshold} threshold
                      {h.notes && ` -- ${h.notes}`}
                    </p>
                  </div>
                  <span className="text-xs text-green-400">
                    {h.resolvedAt ? new Date(h.resolvedAt).toLocaleDateString() : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Digest Scheduler Settings */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDigestSettings(!showDigestSettings)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="text-left">
              <h4 className="text-sm font-bold text-white">Automated Digest Scheduler</h4>
              <p className="text-[10px] text-white/40">
                {digestData?.settings?.enabled
                  ? `Active -- ${digestData.settings.frequency === "daily" ? "Daily" : "Weekly"} at ${String(digestData.settings.hour).padStart(2, "0")}:${String(digestData.settings.minute).padStart(2, "0")} UTC`
                  : "Disabled -- Enable to receive automatic inventory digests"}
              </p>
            </div>
            <span className="text-white/40 text-xs">{showDigestSettings ? "Hide" : "Show"}</span>
          </button>

          {showDigestSettings && (
            <div className="border-t border-white/10 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white/80">Enable Automated Digest</label>
                  <p className="text-[10px] text-white/40">Auto-scan inventory and email a digest at the scheduled time</p>
                </div>
                <button
                  onClick={() => updateDigestMutation.mutate({ enabled: !digestData?.settings?.enabled })}
                  disabled={updateDigestMutation.isPending}
                  className={`relative w-11 h-6 rounded-full transition-colors ${digestData?.settings?.enabled ? "bg-green-500" : "bg-white/20"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${digestData?.settings?.enabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Frequency</label>
                  <select
                    value={digestData?.settings?.frequency || "daily"}
                    onChange={(e) => updateDigestMutation.mutate({ frequency: e.target.value as "daily" | "weekly" })}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    disabled={updateDigestMutation.isPending}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Hour (UTC)</label>
                  <select
                    value={digestData?.settings?.hour ?? 9}
                    onChange={(e) => updateDigestMutation.mutate({ hour: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    disabled={updateDigestMutation.isPending}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, "0")}:00 -- {i < 12 ? `${i || 12} AM` : `${i === 12 ? 12 : i - 12} PM`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Minute</label>
                  <select
                    value={digestData?.settings?.minute ?? 0}
                    onChange={(e) => updateDigestMutation.mutate({ minute: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                    disabled={updateDigestMutation.isPending}
                  >
                    {[0, 15, 30, 45].map(m => (
                      <option key={m} value={m}>:{String(m).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Minimum Severity</label>
                <select
                  value={digestData?.settings?.minSeverity || "warning"}
                  onChange={(e) => updateDigestMutation.mutate({ minSeverity: e.target.value as any })}
                  className="w-full mt-1 max-w-xs px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                  disabled={updateDigestMutation.isPending}
                >
                  <option value="warning">Warning and above (all alerts)</option>
                  <option value="critical">Critical and above</option>
                  <option value="out_of_stock">Out of Stock only</option>
                </select>
              </div>

              {digestData?.status && (
                <div className="bg-white/5 rounded-lg p-3 space-y-2">
                  <h5 className="text-xs font-bold text-white/60 uppercase tracking-wider">Scheduler Status</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-white/40">Status</span>
                      <p className={`font-bold ${digestData.status.isRunning ? "text-green-400" : "text-white/30"}`}>
                        {digestData.status.isRunning ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/40">Last Run</span>
                      <p className="font-bold text-white/70">{digestData.status.lastRunAt ? new Date(digestData.status.lastRunAt).toLocaleString() : "Never"}</p>
                    </div>
                    <div>
                      <span className="text-white/40">Next Run</span>
                      <p className="font-bold text-white/70">{digestData.status.nextRunAt ? new Date(digestData.status.nextRunAt).toLocaleString() : "--"}</p>
                    </div>
                    <div>
                      <span className="text-white/40">Total Runs</span>
                      <p className="font-bold text-white/70">{digestData.status.totalRuns}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDigestHistory(!showDigestHistory)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                {showDigestHistory ? "Hide" : "Show"} Digest History
              </button>

              {showDigestHistory && digestHistory && digestHistory.length > 0 && (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left px-3 py-2 text-white/50 font-bold uppercase tracking-wider">Time</th>
                        <th className="text-left px-3 py-2 text-white/50 font-bold uppercase tracking-wider">Trigger</th>
                        <th className="text-left px-3 py-2 text-white/50 font-bold uppercase tracking-wider">Status</th>
                        <th className="text-left px-3 py-2 text-white/50 font-bold uppercase tracking-wider">Alerts</th>
                        <th className="text-left px-3 py-2 text-white/50 font-bold uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {digestHistory.map((run: any, i: number) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="px-3 py-2 text-white/70">{new Date(run.startedAt).toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${run.triggeredBy === "scheduler" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/50"}`}>{run.triggeredBy}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${run.status === "success" ? "bg-green-500/20 text-green-400" : run.status === "skipped" ? "bg-white/10 text-white/40" : "bg-red-500/20 text-red-400"}`}>{run.status}</span>
                          </td>
                          <td className="px-3 py-2 text-white/70">{run.alertCount > 0 ? <span>{run.outOfStock} OOS, {run.critical} crit, {run.warning} warn</span> : "--"}</td>
                          <td className="px-3 py-2 text-white/40">{run.durationMs}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showDigestHistory && (!digestHistory || digestHistory.length === 0) && (
                <p className="text-xs text-white/30 text-center py-3">No digest history yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-2">How Restock Alerts Work</h4>
          <div className="space-y-2 text-xs text-white/50">
            <p>1. <strong className="text-white/80">Scan Inventory</strong> checks all active products against their low stock threshold.</p>
            <p>2. Alerts are categorized: <strong className="text-red-400">Out of Stock</strong> (0 units), <strong className="text-orange-400">Critical</strong> (below half threshold), <strong className="text-amber-400">Warning</strong>.</p>
            <p>3. <strong className="text-white/80">One-Click Restock</strong> adds inventory directly and auto-resolves the alert.</p>
            <p>4. <strong className="text-white/80">Send Alert Digest</strong> emails a summary of all active alerts.</p>
            <p>5. <strong className="text-white/80">Automated Digest Scheduler</strong> runs daily/weekly at your configured time.</p>
            <p>6. <strong className="text-white/80">Snooze</strong> temporarily hides an alert. Snoozed alerts reactivate when the period expires.</p>
            <p>7. <strong className="text-white/80">Bulk Threshold Update</strong> adjusts thresholds for multiple products at once.</p>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setRestockModal(null)}>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">Restock Product</h3>
            <p className="text-sm text-white/50 mb-4">{restockModal.productName}</p>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Add Quantity</label>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              min="1"
              className="w-full mt-1 mb-4 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              placeholder="Enter quantity to add"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRestockModal(null)} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={() => restockMutation.mutate({ productId: restockModal.productId, variantId: restockModal.variantId || null, addQuantity: Number(restockQty) })}
                disabled={restockMutation.isPending || !restockQty || Number(restockQty) < 1}
                className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50"
              >
                {restockMutation.isPending ? "Restocking..." : `Add ${restockQty} Units`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snooze Modal */}
      {snoozeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSnoozeModal(null)}>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Snooze Alert</h3>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Snooze Duration</label>
            <select value={snoozeHours} onChange={(e) => setSnoozeHours(e.target.value)} className="w-full mt-1 mb-4 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500">
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours (1 day)</option>
              <option value="48">48 hours (2 days)</option>
              <option value="72">72 hours (3 days)</option>
              <option value="168">168 hours (1 week)</option>
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSnoozeModal(null)} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={() => snoozeMutation.mutate({ alertId: snoozeModal, hours: Number(snoozeHours) })}
                disabled={snoozeMutation.isPending}
                className="px-4 py-2.5 bg-purple-600 text-white font-semibold text-sm rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {snoozeMutation.isPending ? "Snoozing..." : "Snooze"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Threshold Modal */}
      {bulkThresholdModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setBulkThresholdModal(false)}>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">Update Low Stock Threshold</h3>
            <p className="text-sm text-white/50 mb-4">
              Set new threshold for {selectedAlerts.size} selected product{selectedAlerts.size > 1 ? "s" : ""}
            </p>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider">New Threshold</label>
            <input
              type="number"
              value={bulkThreshold}
              onChange={(e) => setBulkThreshold(e.target.value)}
              min="0"
              className="w-full mt-1 mb-4 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
              placeholder="Enter new threshold"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setBulkThresholdModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={() => {
                  const productIds = alerts.filter((a: any) => selectedAlerts.has(a.id)).map((a: any) => a.productId);
                  bulkThresholdMutation.mutate({ productIds, threshold: Number(bulkThreshold) });
                }}
                disabled={bulkThresholdMutation.isPending}
                className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50"
              >
                {bulkThresholdMutation.isPending ? "Updating..." : "Update Threshold"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
