"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Pencil, Trash2, Save, X, GripVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface GiftTier {
  id: number;
  threshold: number;
  giftName: string;
  giftDescription: string;
  giftImage: string | null;
  active: boolean;
  sortOrder: number;
}

const EMPTY_TIER: Omit<GiftTier, "id"> = {
  threshold: 0,
  giftName: "",
  giftDescription: "",
  giftImage: null,
  active: true,
  sortOrder: 0,
};

export default function GiftTiersAdminPage() {
  const utils = trpc.useUtils();
  const { data: tiers = [], isLoading } = trpc.giftTiers.list.useQuery();
  const createMutation = trpc.giftTiers.create.useMutation({
    onSuccess: () => { utils.giftTiers.list.invalidate(); setEditing(null); },
  });
  const updateMutation = trpc.giftTiers.update.useMutation({
    onSuccess: () => { utils.giftTiers.list.invalidate(); setEditing(null); },
  });
  const deleteMutation = trpc.giftTiers.delete.useMutation({
    onSuccess: () => utils.giftTiers.list.invalidate(),
  });

  const [editing, setEditing] = useState<(Omit<GiftTier, "id"> & { id?: number }) | null>(null);

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      updateMutation.mutate(editing as GiftTier);
    } else {
      createMutation.mutate(editing);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this gift tier?")) return;
    deleteMutation.mutate({ id });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Gift className="h-6 w-6 text-amber-400" />
            </div>
            Free Gift Tiers
          </h1>
          <p className="text-zinc-400 mt-1">
            Reward customers with free gifts based on their cart total. Higher spending = better gifts.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_TIER, sortOrder: tiers.length + 1 })}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Tier
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 mb-6 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">
            {editing.id ? "Edit Gift Tier" : "New Gift Tier"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Threshold ($)</label>
              <input
                type="number"
                step="0.01"
                value={editing.threshold}
                onChange={(e) => setEditing({ ...editing, threshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50"
                placeholder="e.g. 250"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Gift Name</label>
              <input
                type="text"
                value={editing.giftName}
                onChange={(e) => setEditing({ ...editing, giftName: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50"
                placeholder="e.g. Free Pre-Roll (1g)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <input
                type="text"
                value={editing.giftDescription}
                onChange={(e) => setEditing({ ...editing, giftDescription: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50"
                placeholder="Short description shown to customers"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Image URL (optional)</label>
              <input
                type="text"
                value={editing.giftImage ?? ""}
                onChange={(e) => setEditing({ ...editing, giftImage: e.target.value || null })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50"
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-6">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-20 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-zinc-300">Active</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              onClick={() => setEditing(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-sm transition-colors"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tiers Table */}
      {isLoading ? (
        <div className="text-center py-20 text-zinc-500">Loading gift tiers...</div>
      ) : tiers.length === 0 ? (
        <div className="text-center py-20">
          <Gift className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No gift tiers yet</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Create spending thresholds to reward customers with free gifts.
          </p>
        </div>
      ) : (
        <div className="bg-[#0f0f18] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left w-10">#</th>
                <th className="px-4 py-3 text-left">Threshold</th>
                <th className="px-4 py-3 text-left">Gift</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier: GiftTier) => (
                <tr
                  key={tier.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <GripVertical className="h-4 w-4 text-zinc-600" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-amber-400">${tier.threshold.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{tier.giftName}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 max-w-xs truncate">
                    {tier.giftDescription}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        tier.active
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}
                    >
                      {tier.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(tier)}
                        className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tier.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
