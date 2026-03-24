"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Building2, CheckCircle, XCircle, Clock, Crown,
  Package, Pencil, Save, Users, DollarSign,
} from "lucide-react";

type Tab = "applications" | "accounts" | "orders";

const TIER_OPTIONS = ["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const;
const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_OPTIONS = ["UNPAID", "PAID", "OVERDUE"] as const;

export default function AdminWholesalePage() {
  const [tab, setTab] = useState<Tab>("applications");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Building2 className="h-7 w-7 text-green-400" /> Wholesale Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Manage B2B applications, accounts, and orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["applications", "accounts", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-white/5 text-zinc-400 border border-transparent hover:text-white hover:bg-white/10"
            }`}
          >
            {t === "applications" ? "Applications" : t === "accounts" ? "Accounts" : "Orders"}
          </button>
        ))}
      </div>

      {tab === "applications" && <ApplicationsTab />}
      {tab === "accounts" && <AccountsTab />}
      {tab === "orders" && <OrdersTab />}
    </div>
  );
}

function ApplicationsTab() {
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>(undefined);
  const apps = trpc.wholesale.listApplications.useQuery(filter ? { status: filter } : undefined);
  const utils = trpc.useUtils();

  const approve = trpc.wholesale.approveApplication.useMutation({
    onSuccess: () => utils.wholesale.listApplications.invalidate(),
  });
  const reject = trpc.wholesale.rejectApplication.useMutation({
    onSuccess: () => utils.wholesale.listApplications.invalidate(),
  });

  const [approveForm, setApproveForm] = useState<{
    id: string;
    tier: typeof TIER_OPTIONS[number];
    discountPercent: number;
    creditLimit: number;
    netTerms: number;
  } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[undefined, "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => setFilter(s as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s
                ? "bg-green-500/10 text-green-400"
                : "bg-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            {s ?? "All"}
          </button>
        ))}
      </div>

      {apps.isLoading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : !apps.data?.length ? (
        <p className="text-zinc-500 text-sm">No applications found.</p>
      ) : (
        <div className="space-y-3">
          {apps.data.map((app) => (
            <div key={app.id} className="bg-white/5 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold">{app.businessName}</h3>
                  <p className="text-sm text-zinc-400">{app.user.name} &middot; {app.email}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-400">
                    <span>Type: <span className="text-white">{app.businessType}</span></span>
                    {app.taxId && <span>Tax ID: <span className="text-white">{app.taxId}</span></span>}
                    {app.phone && <span>Phone: <span className="text-white">{app.phone}</span></span>}
                    {app.website && <span>Web: <span className="text-white">{app.website}</span></span>}
                    {app.estimatedMonthlyVolume && <span>Volume: <span className="text-white">{app.estimatedMonthlyVolume}</span></span>}
                  </div>
                  {app.message && <p className="text-sm text-zinc-400 mt-2 italic">&ldquo;{app.message}&rdquo;</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    app.status === "PENDING" ? "bg-amber-500/10 text-amber-400" :
                    app.status === "APPROVED" ? "bg-green-500/10 text-green-400" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {app.status === "PENDING" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  {approveForm?.id === app.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-zinc-400">Tier</label>
                          <select
                            value={approveForm.tier}
                            onChange={(e) => setApproveForm({ ...approveForm, tier: e.target.value as typeof TIER_OPTIONS[number] })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                          >
                            {TIER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Discount %</label>
                          <input
                            type="number"
                            value={approveForm.discountPercent}
                            onChange={(e) => setApproveForm({ ...approveForm, discountPercent: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Credit Limit</label>
                          <input
                            type="number"
                            value={approveForm.creditLimit}
                            onChange={(e) => setApproveForm({ ...approveForm, creditLimit: parseFloat(e.target.value) || 0 })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Net Terms (days)</label>
                          <input
                            type="number"
                            value={approveForm.netTerms}
                            onChange={(e) => setApproveForm({ ...approveForm, netTerms: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve.mutate({
                            applicationId: approveForm.id,
                            tier: approveForm.tier,
                            discountPercent: approveForm.discountPercent,
                            creditLimit: approveForm.creditLimit,
                            netTerms: approveForm.netTerms,
                          })}
                          disabled={approve.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 text-sm font-medium"
                        >
                          <CheckCircle className="h-4 w-4" /> {approve.isPending ? "Approving..." : "Confirm Approve"}
                        </button>
                        <button
                          onClick={() => setApproveForm(null)}
                          className="px-4 py-2 bg-white/5 text-zinc-400 rounded-lg hover:text-white text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveForm({
                          id: app.id,
                          tier: "BRONZE",
                          discountPercent: 10,
                          creditLimit: 0,
                          netTerms: 0,
                        })}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Reject this application?")) {
                            reject.mutate({ applicationId: app.id });
                          }
                        }}
                        disabled={reject.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm font-medium"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountsTab() {
  const accounts = trpc.wholesale.listAccounts.useQuery();
  const utils = trpc.useUtils();
  const update = trpc.wholesale.updateAccount.useMutation({
    onSuccess: () => {
      utils.wholesale.listAccounts.invalidate();
      setEditing(null);
    },
  });

  const [editing, setEditing] = useState<{
    accountId: string;
    tier: typeof TIER_OPTIONS[number];
    discountPercent: number;
    creditLimit: number;
    netTerms: number;
  } | null>(null);

  if (accounts.isLoading) return <p className="text-zinc-500 text-sm">Loading...</p>;
  if (!accounts.data?.length) return <p className="text-zinc-500 text-sm">No wholesale accounts yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400 border-b border-white/5">
            <th className="text-left py-3 pr-4">Business</th>
            <th className="text-left py-3 pr-4">Contact</th>
            <th className="text-left py-3 pr-4">Tier</th>
            <th className="text-left py-3 pr-4">Discount</th>
            <th className="text-left py-3 pr-4">Credit Limit</th>
            <th className="text-left py-3 pr-4">Net Terms</th>
            <th className="text-left py-3 pr-4">Orders</th>
            <th className="text-left py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.data.map((acc) => (
            <tr key={acc.id} className="border-b border-white/5">
              <td className="py-3 pr-4">
                <span className="text-white font-medium">{acc.businessName}</span>
                {acc.taxId && <span className="text-zinc-500 text-xs block">Tax: {acc.taxId}</span>}
              </td>
              <td className="py-3 pr-4 text-zinc-400">{acc.user.name}<br /><span className="text-xs">{acc.user.email}</span></td>
              {editing?.accountId === acc.id ? (
                <>
                  <td className="py-3 pr-4">
                    <select
                      value={editing.tier}
                      onChange={(e) => setEditing({ ...editing, tier: e.target.value as typeof TIER_OPTIONS[number] })}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                    >
                      {TIER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      value={editing.discountPercent}
                      onChange={(e) => setEditing({ ...editing, discountPercent: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                    />%
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      value={editing.creditLimit}
                      onChange={(e) => setEditing({ ...editing, creditLimit: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      value={editing.netTerms}
                      onChange={(e) => setEditing({ ...editing, netTerms: parseInt(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                    /> days
                  </td>
                </>
              ) : (
                <>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      acc.tier === "PLATINUM" ? "bg-purple-500/10 text-purple-400" :
                      acc.tier === "GOLD" ? "bg-yellow-500/10 text-yellow-400" :
                      acc.tier === "SILVER" ? "bg-gray-500/10 text-gray-300" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>{acc.tier}</span>
                  </td>
                  <td className="py-3 pr-4 text-green-400 font-medium">{acc.discountPercent}%</td>
                  <td className="py-3 pr-4 text-white">${acc.creditLimit.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-white">{acc.netTerms > 0 ? `Net ${acc.netTerms}` : "-"}</td>
                </>
              )}
              <td className="py-3 pr-4 text-zinc-400">{acc._count.orders}</td>
              <td className="py-3">
                {editing?.accountId === acc.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => update.mutate(editing)}
                      disabled={update.isPending}
                      className="p-1.5 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20"
                    >
                      <Save className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="p-1.5 bg-white/5 text-zinc-400 rounded hover:bg-white/10"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditing({
                      accountId: acc.id,
                      tier: acc.tier as typeof TIER_OPTIONS[number],
                      discountPercent: acc.discountPercent,
                      creditLimit: acc.creditLimit,
                      netTerms: acc.netTerms,
                    })}
                    className="p-1.5 bg-white/5 text-zinc-400 rounded hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTab() {
  const orders = trpc.wholesale.listOrders.useQuery();
  const utils = trpc.useUtils();
  const updateStatus = trpc.wholesale.updateOrderStatus.useMutation({
    onSuccess: () => utils.wholesale.listOrders.invalidate(),
  });

  if (orders.isLoading) return <p className="text-zinc-500 text-sm">Loading...</p>;
  if (!orders.data?.length) return <p className="text-zinc-500 text-sm">No wholesale orders yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400 border-b border-white/5">
            <th className="text-left py-3 pr-4">Order #</th>
            <th className="text-left py-3 pr-4">Business</th>
            <th className="text-left py-3 pr-4">Date</th>
            <th className="text-left py-3 pr-4">Total</th>
            <th className="text-left py-3 pr-4">Status</th>
            <th className="text-left py-3 pr-4">Payment</th>
            <th className="text-left py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.data.map((order) => (
            <tr key={order.id} className="border-b border-white/5">
              <td className="py-3 pr-4 text-white font-mono text-xs">{order.orderNumber}</td>
              <td className="py-3 pr-4 text-white">{order.wholesaleAccount.businessName}</td>
              <td className="py-3 pr-4 text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="py-3 pr-4 text-white font-semibold">${order.total.toFixed(2)}</td>
              <td className="py-3 pr-4">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus.mutate({ orderId: order.id, status: e.target.value as typeof STATUS_OPTIONS[number] })}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="py-3 pr-4">
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updateStatus.mutate({ orderId: order.id, paymentStatus: e.target.value as typeof PAYMENT_OPTIONS[number] })}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white"
                >
                  {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="py-3">
                {order.notes && (
                  <span className="text-zinc-500 text-xs" title={order.notes}>Notes</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
