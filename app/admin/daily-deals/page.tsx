"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Star,
  StarOff,
  Clock,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import CountdownTimer from "@/components/CountdownTimer";

export default function AdminDailyDealsPage() {
  const utils = trpc.useUtils();
  const { data: deals, isLoading } = trpc.dailyDeals.list.useQuery();

  const createDeal = trpc.dailyDeals.create.useMutation({
    onSuccess: () => {
      utils.dailyDeals.list.invalidate();
      setShowForm(false);
      resetForm();
    },
  });

  const updateDeal = trpc.dailyDeals.update.useMutation({
    onSuccess: () => {
      utils.dailyDeals.list.invalidate();
      setEditingId(null);
      resetForm();
    },
  });

  const deleteDeal = trpc.dailyDeals.delete.useMutation({
    onSuccess: () => utils.dailyDeals.list.invalidate(),
  });

  const setFeatured = trpc.dailyDeals.setFeatured.useMutation({
    onSuccess: () => utils.dailyDeals.list.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    productSlug: "",
    originalPrice: "",
    dealPrice: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    featured: false,
    active: true,
  });

  function resetForm() {
    setForm({
      productSlug: "",
      originalPrice: "",
      dealPrice: "",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      featured: false,
      active: true,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      productSlug: form.productSlug,
      originalPrice: parseFloat(form.originalPrice),
      dealPrice: parseFloat(form.dealPrice),
      title: form.title,
      description: form.description || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      featured: form.featured,
      active: form.active,
    };

    if (editingId) {
      updateDeal.mutate({ id: editingId, data: payload });
    } else {
      createDeal.mutate(payload);
    }
  }

  function startEditing(deal: NonNullable<typeof deals>[0]) {
    setEditingId(deal.id);
    setShowForm(true);
    setForm({
      productSlug: deal.productSlug,
      originalPrice: String(deal.originalPrice),
      dealPrice: String(deal.dealPrice),
      title: deal.title,
      description: deal.description || "",
      startDate: new Date(deal.startDate).toISOString().slice(0, 16),
      endDate: new Date(deal.endDate).toISOString().slice(0, 16),
      featured: deal.featured,
      active: deal.active,
    });
  }

  function handleDelete(id: number) {
    if (confirm("Delete this deal permanently?")) {
      deleteDeal.mutate({ id });
    }
  }

  function toggleActive(deal: NonNullable<typeof deals>[0]) {
    updateDeal.mutate({
      id: deal.id,
      data: { active: !deal.active },
    });
  }

  const now = new Date();
  const activeDeals =
    deals?.filter(
      (d) => d.active && new Date(d.startDate) <= now && new Date(d.endDate) >= now
    ) || [];
  const scheduledDeals =
    deals?.filter((d) => d.active && new Date(d.startDate) > now) || [];
  const expiredDeals =
    deals?.filter(
      (d) => !d.active || new Date(d.endDate) < now
    ) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Deals</h1>
          <p className="text-zinc-400 mt-1">
            Create and manage time-limited deal promotions with countdown timers
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            resetForm();
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "New Deal"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm mb-1">Active Deals</p>
          <p className="text-3xl font-bold text-green-400">{activeDeals.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm mb-1">Scheduled</p>
          <p className="text-3xl font-bold text-blue-400">{scheduledDeals.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm mb-1">Expired/Inactive</p>
          <p className="text-3xl font-bold text-zinc-500">{expiredDeals.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm mb-1">Total Deals</p>
          <p className="text-3xl font-bold">{deals?.length ?? 0}</p>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 space-y-4"
        >
          <h2 className="text-lg font-bold mb-2">
            {editingId ? "Edit Deal" : "Create New Deal"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Deal Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. $40 Ounce Special"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Product Slug *
              </label>
              <input
                type="text"
                value={form.productSlug}
                onChange={(e) => setForm({ ...form, productSlug: e.target.value })}
                placeholder="e.g. blue-dream-ounce"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Original Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="80.00"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Deal Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.dealPrice}
                onChange={(e) => setForm({ ...form, dealPrice: e.target.value })}
                placeholder="40.00"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the deal..."
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Featured (Deal of the Day)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          {form.originalPrice && form.dealPrice && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm">
              <span className="text-green-400 font-bold">
                {Math.round(
                  ((parseFloat(form.originalPrice) - parseFloat(form.dealPrice)) /
                    parseFloat(form.originalPrice)) *
                    100
                )}
                % OFF
              </span>{" "}
              — Customer saves $
              {(
                parseFloat(form.originalPrice) - parseFloat(form.dealPrice)
              ).toFixed(2)}
            </div>
          )}

          <Button
            type="submit"
            disabled={createDeal.isPending || updateDeal.isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {createDeal.isPending || updateDeal.isPending
              ? "Saving..."
              : editingId
              ? "Update Deal"
              : "Create Deal"}
          </Button>
        </form>
      )}

      {/* Deals List */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="h-8 w-8 border-3 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-500">Loading deals...</p>
        </div>
      ) : !deals || deals.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Tag className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-lg font-medium mb-2">
            No deals created yet
          </p>
          <p className="text-zinc-500 text-sm">
            Create your first daily deal to show countdown timers on the deals
            page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Deals */}
          {activeDeals.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mt-4 mb-2">
                Active ({activeDeals.length})
              </h3>
              {activeDeals.map((deal) => (
                <DealRow
                  key={deal.id}
                  deal={deal}
                  status="active"
                  onEdit={() => startEditing(deal)}
                  onDelete={() => handleDelete(deal.id)}
                  onToggleActive={() => toggleActive(deal)}
                  onSetFeatured={() => setFeatured.mutate({ id: deal.id })}
                />
              ))}
            </>
          )}

          {/* Scheduled */}
          {scheduledDeals.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mt-6 mb-2">
                Scheduled ({scheduledDeals.length})
              </h3>
              {scheduledDeals.map((deal) => (
                <DealRow
                  key={deal.id}
                  deal={deal}
                  status="scheduled"
                  onEdit={() => startEditing(deal)}
                  onDelete={() => handleDelete(deal.id)}
                  onToggleActive={() => toggleActive(deal)}
                  onSetFeatured={() => setFeatured.mutate({ id: deal.id })}
                />
              ))}
            </>
          )}

          {/* Expired / Inactive */}
          {expiredDeals.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mt-6 mb-2">
                Expired / Inactive ({expiredDeals.length})
              </h3>
              {expiredDeals.map((deal) => (
                <DealRow
                  key={deal.id}
                  deal={deal}
                  status="expired"
                  onEdit={() => startEditing(deal)}
                  onDelete={() => handleDelete(deal.id)}
                  onToggleActive={() => toggleActive(deal)}
                  onSetFeatured={() => setFeatured.mutate({ id: deal.id })}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DealRow({
  deal,
  status,
  onEdit,
  onDelete,
  onToggleActive,
  onSetFeatured,
}: {
  deal: {
    id: number;
    title: string;
    productSlug: string;
    originalPrice: number;
    dealPrice: number;
    startDate: Date;
    endDate: Date;
    featured: boolean;
    active: boolean;
  };
  status: "active" | "scheduled" | "expired";
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onSetFeatured: () => void;
}) {
  const savings = Math.round(
    ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100
  );

  const statusColors = {
    active: "border-green-500/20 bg-green-500/5",
    scheduled: "border-blue-500/20 bg-blue-500/5",
    expired: "border-white/5 bg-white/[2%] opacity-60",
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border ${statusColors[status]} transition-colors`}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-sm truncate">{deal.title}</h4>
          {deal.featured && (
            <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
              FEATURED
            </span>
          )}
          <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
            -{savings}%
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          {deal.productSlug} — ${deal.dealPrice.toFixed(2)}{" "}
          <span className="line-through">${deal.originalPrice.toFixed(2)}</span>
        </p>
      </div>

      {/* Countdown (only for active) */}
      {status === "active" && (
        <div className="hidden md:block shrink-0">
          <CountdownTimer
            endDate={new Date(deal.endDate).toISOString()}
            size="sm"
            showLabels={false}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onSetFeatured}
          title={deal.featured ? "Remove featured" : "Set as featured"}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {deal.featured ? (
            <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
          ) : (
            <StarOff className="h-4 w-4 text-zinc-500" />
          )}
        </button>
        <button
          onClick={onToggleActive}
          title={deal.active ? "Deactivate" : "Activate"}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {deal.active ? (
            <ToggleRight className="h-4 w-4 text-green-400" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-zinc-500" />
          )}
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Edit2 className="h-4 w-4 text-zinc-400" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
