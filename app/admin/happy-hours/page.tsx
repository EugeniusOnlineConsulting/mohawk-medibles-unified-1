"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Clock, Flame, Plus, Pencil, Trash2, X, Check } from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

interface HappyHourForm {
  name: string;
  discountPercent: number;
  categorySlug: string;
  startHour: number;
  endHour: number;
  daysOfWeek: number[];
  active: boolean;
}

const defaultForm: HappyHourForm = {
  name: "",
  discountPercent: 10,
  categorySlug: "",
  startHour: 16,
  endHour: 19,
  daysOfWeek: [1, 2, 3, 4, 5],
  active: true,
};

export default function HappyHoursAdminPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HappyHourForm>(defaultForm);

  const utils = trpc.useUtils();
  const { data: happyHours, isLoading } = trpc.happyHour.list.useQuery();

  const createMutation = trpc.happyHour.create.useMutation({
    onSuccess: () => {
      utils.happyHour.list.invalidate();
      resetForm();
    },
  });

  const updateMutation = trpc.happyHour.update.useMutation({
    onSuccess: () => {
      utils.happyHour.list.invalidate();
      resetForm();
    },
  });

  const deleteMutation = trpc.happyHour.delete.useMutation({
    onSuccess: () => {
      utils.happyHour.list.invalidate();
    },
  });

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
  }

  function startEdit(hh: any) {
    setEditingId(hh.id);
    setForm({
      name: hh.name,
      discountPercent: hh.discountPercent,
      categorySlug: hh.categorySlug ?? "",
      startHour: hh.startHour,
      endHour: hh.endHour,
      daysOfWeek: Array.isArray(hh.daysOfWeek) ? hh.daysOfWeek : [],
      active: hh.active,
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      discountPercent: form.discountPercent,
      categorySlug: form.categorySlug || null,
      startHour: form.startHour,
      endHour: form.endHour,
      daysOfWeek: form.daysOfWeek,
      active: form.active,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="w-8 h-8 text-amber-400" />
              Happy Hours
            </h1>
            <p className="text-white/60 mt-1">
              Time-based flash promotions — automatic discounts during set hours
            </p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Create Happy Hour
              </>
            )}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Happy Hour" : "New Happy Hour"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-white/50 text-sm mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Edible Evening"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>

                {/* Discount % */}
                <div>
                  <label className="block text-white/50 text-sm mb-1">Discount %</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={form.discountPercent}
                    onChange={(e) =>
                      setForm({ ...form, discountPercent: parseInt(e.target.value) || 10 })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-white/50 text-sm mb-1">
                    Category Slug (blank = all products)
                  </label>
                  <input
                    type="text"
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    placeholder="e.g. edibles, flower, concentrates"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 pt-6">
                  <label className="text-white/50 text-sm">Active</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, active: !form.active })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      form.active ? "bg-green-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        form.active ? "left-6" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Start Hour</label>
                  <select
                    value={form.startHour}
                    onChange={(e) =>
                      setForm({ ...form, startHour: parseInt(e.target.value) })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} className="bg-zinc-900">
                        {formatHour(i)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">End Hour</label>
                  <select
                    value={form.endHour}
                    onChange={(e) =>
                      setForm({ ...form, endHour: parseInt(e.target.value) })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500/50"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i} className="bg-zinc-900">
                        {formatHour(i)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Days of week */}
              <div>
                <label className="block text-white/50 text-sm mb-2">Days of Week</label>
                <div className="flex gap-2">
                  {DAY_NAMES.map((name, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.daysOfWeek.includes(i)
                          ? "bg-green-600 text-white"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-300">
                <strong>Preview:</strong> This happy hour runs{" "}
                {form.daysOfWeek.map((d) => DAY_NAMES[d]).join(", ") || "no days"}{" "}
                {formatHour(form.startHour)}–{formatHour(form.endHour)},{" "}
                {form.discountPercent}% off{" "}
                {form.categorySlug || "All Products"}
                {form.active ? "" : " (INACTIVE)"}
              </div>

              <button
                type="submit"
                disabled={saving || form.daysOfWeek.length === 0 || !form.name}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Happy Hour" : "Create Happy Hour"}
              </button>
            </form>
          </div>
        )}

        {/* Happy Hours List */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold">All Happy Hours</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-white/40">Loading...</div>
          ) : !happyHours?.length ? (
            <div className="p-12 text-center text-white/40">
              <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-2">No happy hours created yet.</p>
              <p className="text-sm">
                Create your first time-based promotion above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {happyHours.map((hh) => {
                const days = Array.isArray(hh.daysOfWeek) ? (hh.daysOfWeek as number[]) : [];
                return (
                  <div key={hh.id} className="px-6 py-4 flex items-center gap-4">
                    {/* Status indicator */}
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        hh.active ? "bg-green-500" : "bg-zinc-600"
                      }`}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-sm">{hh.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {hh.discountPercent}% OFF
                        </span>
                        {!hh.active && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {days.map((d) => DAY_NAMES[d]).join(", ")}{" "}
                        {formatHour(hh.startHour)}–{formatHour(hh.endHour)}
                        {" | "}
                        {hh.categorySlug || "All Products"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => startEdit(hh)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-white/60" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${hh.name}"?`)) {
                            deleteMutation.mutate({ id: hh.id });
                          }
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400/60" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
