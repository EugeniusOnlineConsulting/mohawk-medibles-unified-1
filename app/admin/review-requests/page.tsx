"use client";

import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ReviewRequestsPage() {
  const settingsQuery = trpc.reviewRequests.getSettings.useQuery();
  const statsQuery = trpc.reviewRequests.stats.useQuery();
  const listQuery = trpc.reviewRequests.list.useQuery({ limit: 20 });
  const updateMutation = trpc.reviewRequests.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated");
      settingsQuery.refetch();
      statsQuery.refetch();
    },
  });
  const triggerMutation = trpc.reviewRequests.triggerNow.useMutation({
    onSuccess: (data) => {
      toast.success(`Sent ${data.sent} review requests (${data.errors} errors)`);
      listQuery.refetch();
      statsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const settings = settingsQuery.data;
  const stats = statsQuery.data;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Requests</h1>
            <p className="text-white/60 mt-1">
              Automatically send review request emails after delivery to collect customer feedback.
            </p>
          </div>
          <button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
            className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50"
          >
            {triggerMutation.isPending ? "Sending..." : "Send Now"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Sent", value: stats?.totalSent ?? 0, color: "text-white" },
            { label: "This Week", value: stats?.sentThisWeek ?? 0, color: "text-blue-400" },
            { label: "This Month", value: stats?.sentThisMonth ?? 0, color: "text-green-400" },
            { label: "Pending Orders", value: stats?.pendingOrders ?? 0, color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Enabled</label>
                <button
                  onClick={() => updateMutation.mutate({ enabled: !(settings?.enabled ?? true) })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings?.enabled !== false ? "bg-green-500" : "bg-white/20"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings?.enabled !== false ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Delay After Delivery (days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings?.delayDays ?? 7}
                  onChange={e => updateMutation.mutate({ delayDays: parseInt(e.target.value) || 7 })}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider">Max Requests Per Order</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={settings?.maxRequestsPerOrder ?? 1}
                  onChange={e => updateMutation.mutate({ maxRequestsPerOrder: parseInt(e.target.value) || 1 })}
                  className="w-full mt-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <p className="text-[10px] text-white/30 pt-2">Scheduler checks every 6 hours for eligible orders.</p>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Review Requests</h3>
              <p className="text-white/40 text-xs mt-1">Last 20 review request emails sent</p>
            </div>

            {listQuery.isLoading ? (
              <div className="p-6 text-sm text-white/40">Loading...</div>
            ) : listQuery.data && listQuery.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-white/50 text-xs font-medium">Customer</th>
                      <th className="px-4 py-3 text-white/50 text-xs font-medium">Order</th>
                      <th className="px-4 py-3 text-white/50 text-xs font-medium">Products</th>
                      <th className="px-4 py-3 text-white/50 text-xs font-medium">Sent</th>
                      <th className="px-4 py-3 text-white/50 text-xs font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listQuery.data.map((req: any, i: number) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3">
                          <div className="font-medium text-xs text-white">{req.customerName}</div>
                          <div className="text-xs text-white/40">{req.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/60">#{req.orderId?.slice(0, 8)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {req.productNames?.slice(0, 2).map((p: string, j: number) => (
                              <span key={j} className="bg-white/10 text-white/70 px-2 py-0.5 rounded text-xs">
                                {p.length > 20 ? p.slice(0, 20) + "..." : p}
                              </span>
                            ))}
                            {(req.productNames?.length || 0) > 2 && (
                              <span className="bg-white/5 text-white/40 px-2 py-0.5 rounded text-xs">+{req.productNames.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/40">
                          {req.sentAt ? new Date(req.sentAt).toLocaleDateString() : "--"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${req.status === "sent" ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/50"}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <p className="text-sm">No review requests sent yet.</p>
                <p className="text-xs mt-1">Click &quot;Send Now&quot; to check for eligible orders.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
