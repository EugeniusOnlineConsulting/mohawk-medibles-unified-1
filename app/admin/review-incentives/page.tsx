"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ReviewIncentivesPage() {
  const [tab, setTab] = useState<"settings" | "stats" | "history">("settings");

  const { data: settings, refetch: refetchSettings } = trpc.reviewIncentives.getSettings.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: stats } = trpc.reviewIncentives.stats.useQuery(undefined, { refetchOnWindowFocus: false });
  const { data: history } = trpc.reviewIncentives.history.useQuery({ limit: 50 }, { refetchOnWindowFocus: false });
  const { data: incentiveTextEn } = trpc.reviewIncentives.getIncentiveText.useQuery({ lang: "en" }, { refetchOnWindowFocus: false });
  const { data: incentiveTextFr } = trpc.reviewIncentives.getIncentiveText.useQuery({ lang: "fr" }, { refetchOnWindowFocus: false });

  const updateMut = trpc.reviewIncentives.updateSettings.useMutation({
    onSuccess: () => { toast.success("Settings updated"); refetchSettings(); },
    onError: (e: any) => toast.error(e.message),
  });

  const [form, setForm] = useState<any>(null);

  React.useEffect(() => {
    if (settings && !form) {
      setForm({ ...settings });
    }
  }, [settings, form]);

  function saveSettings() {
    if (!form) return;
    updateMut.mutate(form);
  }

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-all";

  const tabs = [
    { id: "settings" as const, label: "Settings" },
    { id: "stats" as const, label: "Statistics" },
    { id: "history" as const, label: "History" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Review Incentive Program</h1>
          <p className="text-white/60 mt-1">Reward customers for leaving reviews with loyalty points and discount codes</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                tab === t.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {tab === "settings" && form && (
          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Enable Review Incentives</h3>
                  <p className="text-xs text-white/40 mt-0.5">When enabled, customers receive rewards for submitting reviews</p>
                </div>
                <button
                  onClick={() => setForm((f: any) => ({ ...f, enabled: !f.enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.enabled ? "bg-green-500" : "bg-white/20"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Incentive Type */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Incentive Type</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "points", label: "Loyalty Points", desc: "Award bonus loyalty points" },
                  { value: "discount", label: "Discount Code", desc: "Generate a unique coupon" },
                  { value: "both", label: "Points + Discount", desc: "Award both rewards" },
                ].map(opt => (
                  <button key={opt.value}
                    onClick={() => setForm((f: any) => ({ ...f, incentiveType: opt.value }))}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      form.incentiveType === opt.value
                        ? "bg-violet-600/20 border-violet-500"
                        : "border-white/10 hover:border-white/20"
                    }`}>
                    <p className="text-sm font-bold text-white mt-2">{opt.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Points Settings */}
            {(form.incentiveType === "points" || form.incentiveType === "both") && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Points Settings</h3>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Points Per Review</label>
                  <input type="number" className={inputClass} value={form.pointsAmount}
                    onChange={e => setForm((f: any) => ({ ...f, pointsAmount: parseInt(e.target.value) || 0 }))} />
                  <p className="text-[10px] text-white/30 mt-1">Bonus points awarded on top of any base review points from the loyalty program</p>
                </div>
              </div>
            )}

            {/* Discount Settings */}
            {(form.incentiveType === "discount" || form.incentiveType === "both") && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Discount Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Discount Type</label>
                    <select className={inputClass} value={form.discountType}
                      onChange={e => setForm((f: any) => ({ ...f, discountType: e.target.value }))}>
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed Amount Off</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">
                      Discount Value {form.discountType === "percentage" ? "(%)" : "($)"}
                    </label>
                    <input type="number" className={inputClass} value={form.discountValue}
                      onChange={e => setForm((f: any) => ({ ...f, discountValue: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Min Order Amount ($)</label>
                    <input type="number" className={inputClass} value={form.discountMinOrder}
                      onChange={e => setForm((f: any) => ({ ...f, discountMinOrder: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Coupon Expiry (Days)</label>
                    <input type="number" className={inputClass} value={form.discountExpiryDays}
                      onChange={e => setForm((f: any) => ({ ...f, discountExpiryDays: parseInt(e.target.value) || 30 }))} />
                  </div>
                </div>
              </div>
            )}

            {/* Photo Bonus Settings */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Photo Review Bonus</h3>
                <button
                  onClick={() => setForm((f: any) => ({ ...f, photoBonusEnabled: !f.photoBonusEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.photoBonusEnabled ? "bg-blue-500" : "bg-white/20"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.photoBonusEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
              <p className="text-xs text-white/40 mb-4">Offer extra rewards to customers who include photos with their reviews</p>
              {form.photoBonusEnabled && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Points Multiplier</label>
                    <input type="number" step="0.1" min="1" className={inputClass} value={form.photoBonusMultiplier}
                      onChange={e => setForm((f: any) => ({ ...f, photoBonusMultiplier: parseFloat(e.target.value) || 1.5 }))} />
                    <p className="text-[10px] text-white/30 mt-1">e.g. 1.5 = 50% more points ({Math.round((form.pointsAmount || 50) * (form.photoBonusMultiplier || 1.5))} pts)</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Extra Discount {form.discountType === "percentage" ? "(%)" : "($)"}</label>
                    <input type="number" min="0" className={inputClass} value={form.photoBonusExtraDiscount}
                      onChange={e => setForm((f: any) => ({ ...f, photoBonusExtraDiscount: parseInt(e.target.value) || 0 }))} />
                    <p className="text-[10px] text-white/30 mt-1">Added on top of base discount ({(form.discountValue || 0) + (form.photoBonusExtraDiscount || 0)}{form.discountType === "percentage" ? "%" : "$"} total)</p>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Min Photos Required</label>
                    <input type="number" min="1" max="5" className={inputClass} value={form.photoMinCount}
                      onChange={e => setForm((f: any) => ({ ...f, photoMinCount: parseInt(e.target.value) || 1 }))} />
                    <p className="text-[10px] text-white/30 mt-1">Minimum number of photos to qualify for bonus</p>
                  </div>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Rules & Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Max Incentives Per User</label>
                  <input type="number" className={inputClass} value={form.maxIncentivesPerUser}
                    onChange={e => setForm((f: any) => ({ ...f, maxIncentivesPerUser: parseInt(e.target.value) || 5 }))} />
                </div>
                <div>
                  <label className="text-white/50 text-xs uppercase tracking-wider block mb-1">Min Review Length (chars)</label>
                  <input type="number" className={inputClass} value={form.requireMinLength}
                    onChange={e => setForm((f: any) => ({ ...f, requireMinLength: parseInt(e.target.value) || 0 }))} />
                  <p className="text-[10px] text-white/30 mt-1">0 = no minimum</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.mentionInReviewRequest}
                    onChange={e => setForm((f: any) => ({ ...f, mentionInReviewRequest: e.target.checked }))}
                    className="rounded border-white/20" />
                  <span className="text-sm text-white/70">Mention incentive in review request emails</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            {form.enabled && form.mentionInReviewRequest && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Email Preview Text</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">English</p>
                    <p className="text-sm text-green-300">{incentiveTextEn || "Enable the program to see preview"}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">French</p>
                    <p className="text-sm text-blue-300">{incentiveTextFr || "Activez le programme pour voir l'apercu"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                className="px-6 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50"
                onClick={saveSettings}
                disabled={updateMut.isPending}
              >
                {updateMut.isPending ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {tab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Total Incentives Awarded", value: stats?.totalAwarded || 0, color: "text-amber-400" },
                { label: "Total Points Awarded", value: stats?.totalPointsAwarded || 0, color: "text-violet-400" },
                { label: "Coupons Generated", value: stats?.totalCouponsGenerated || 0, color: "text-blue-400" },
                { label: "Coupons Redeemed", value: stats?.couponsRedeemed || 0, color: "text-green-400" },
                { label: "Avg Rating (Incentivized)", value: stats?.averageRating || "N/A", color: "text-yellow-400" },
                { label: "Incentivized Reviews", value: stats?.incentivizedReviewCount || 0, color: "text-purple-400" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-white/50 text-xs uppercase tracking-wider">{stat.label}</span>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {stats && stats.totalCouponsGenerated > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Coupon Redemption Rate</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((stats.couponsRedeemed / stats.totalCouponsGenerated) * 100))}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {Math.round((stats.couponsRedeemed / stats.totalCouponsGenerated) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Customer</th>
                    <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Type</th>
                    <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Points</th>
                    <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Coupon</th>
                    <th className="p-3 text-xs text-white/50 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(!history || history.length === 0) ? (
                    <tr><td colSpan={5} className="p-8 text-center text-white/30">No incentives awarded yet.</td></tr>
                  ) : history.map((record: any, i: number) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <div className="text-xs font-bold text-white">{record.userName || "Unknown"}</div>
                        <div className="text-[10px] text-white/40">{record.userEmail}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                          record.incentiveType === "both" ? "text-purple-400 border-purple-500/30 bg-purple-500/10" :
                          record.incentiveType === "points" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
                          "text-blue-400 border-blue-500/30 bg-blue-500/10"
                        }`}>{record.incentiveType}</span>
                      </td>
                      <td className="p-3 text-xs text-white font-medium">{record.pointsAwarded > 0 ? `+${record.pointsAwarded}` : "--"}</td>
                      <td className="p-3 text-xs font-mono text-white/60">{record.couponCode || "--"}</td>
                      <td className="p-3 text-xs text-white/40">{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
