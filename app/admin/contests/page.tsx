"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminShell from "@/components/admin/AdminShell";
import {
  Trophy, Plus, Pencil, Trash2, X, Gift, Users, Clock,
  Award, ChevronDown, ChevronUp,
} from "lucide-react";

interface ContestForm {
  title: string;
  description: string;
  prize: string;
  prizeImage: string;
  entryMethod: "FREE" | "PURCHASE" | "SIGNUP" | "POINTS";
  minPurchaseAmount: string;
  pointsCost: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "ENDED";
  maxEntries: string;
}

const defaultForm: ContestForm = {
  title: "",
  description: "",
  prize: "",
  prizeImage: "",
  entryMethod: "FREE",
  minPurchaseAmount: "",
  pointsCost: "100",
  startDate: "",
  endDate: "",
  status: "DRAFT",
  maxEntries: "",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400",
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  ENDED: "bg-red-500/20 text-red-400",
};

export default function AdminContestsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ContestForm>(defaultForm);
  const [expandedContest, setExpandedContest] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const listQuery = trpc.contest.list.useQuery();
  const entriesQuery = trpc.contest.getEntries.useQuery(
    { contestId: expandedContest ?? 0 },
    { enabled: !!expandedContest }
  );

  const createMutation = trpc.contest.create.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "Contest created" });
      resetForm();
      listQuery.refetch();
    },
    onError: (err) => setMessage({ type: "error", text: err.message }),
  });

  const updateMutation = trpc.contest.update.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "Contest updated" });
      resetForm();
      listQuery.refetch();
    },
    onError: (err) => setMessage({ type: "error", text: err.message }),
  });

  const deleteMutation = trpc.contest.delete.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "Contest deleted" });
      listQuery.refetch();
    },
    onError: (err) => setMessage({ type: "error", text: err.message }),
  });

  const drawMutation = trpc.contest.drawWinner.useMutation({
    onSuccess: (data) => {
      setMessage({
        type: "success",
        text: `Winner drawn: ${data.winner.name} (${data.winner.email}) from ${data.totalEntries} total entries!`,
      });
      listQuery.refetch();
    },
    onError: (err) => setMessage({ type: "error", text: err.message }),
  });

  function resetForm() {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(contest: any) {
    setForm({
      title: contest.title,
      description: contest.description,
      prize: contest.prize,
      prizeImage: contest.prizeImage || "",
      entryMethod: contest.entryMethod,
      minPurchaseAmount: contest.minPurchaseAmount?.toString() || "",
      pointsCost: contest.pointsCost?.toString() || "100",
      startDate: new Date(contest.startDate).toISOString().slice(0, 16),
      endDate: new Date(contest.endDate).toISOString().slice(0, 16),
      status: contest.status,
      maxEntries: contest.maxEntries?.toString() || "",
    });
    setEditingId(contest.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const payload = {
      title: form.title,
      description: form.description,
      prize: form.prize,
      prizeImage: form.prizeImage || null,
      entryMethod: form.entryMethod,
      minPurchaseAmount: form.minPurchaseAmount ? parseFloat(form.minPurchaseAmount) : null,
      pointsCost: form.pointsCost ? parseInt(form.pointsCost) : null,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      maxEntries: form.maxEntries ? parseInt(form.maxEntries) : null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const contests = listQuery.data ?? [];

  return (
    <AdminShell>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-bold text-white">Contests & Giveaways</h1>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Contest"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#141420] rounded-xl p-6 mb-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              {editingId ? "Edit Contest" : "Create Contest"}
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prize *</label>
                <input
                  value={form.prize}
                  onChange={(e) => setForm({ ...form, prize: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                  placeholder="e.g. $500 Gift Card"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prize Image URL</label>
                <input
                  value={form.prizeImage}
                  onChange={(e) => setForm({ ...form, prizeImage: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Entry Method *</label>
                <select
                  value={form.entryMethod}
                  onChange={(e) => setForm({ ...form, entryMethod: e.target.value as ContestForm["entryMethod"] })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="FREE">Free Entry</option>
                  <option value="PURCHASE">Purchase Required</option>
                  <option value="SIGNUP">New Signup</option>
                  <option value="POINTS">Spend Points</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {form.entryMethod === "PURCHASE" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.minPurchaseAmount}
                    onChange={(e) => setForm({ ...form, minPurchaseAmount: e.target.value })}
                    className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="50.00"
                  />
                </div>
              )}
              {form.entryMethod === "POINTS" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Points Cost</label>
                  <input
                    type="number"
                    value={form.pointsCost}
                    onChange={(e) => setForm({ ...form, pointsCost: e.target.value })}
                    className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="100"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Date *</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date *</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Entries</label>
                <input
                  type="number"
                  value={form.maxEntries}
                  onChange={(e) => setForm({ ...form, maxEntries: e.target.value })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ContestForm["status"] })}
                  className="w-full bg-black/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ENDED">Ended</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {editingId ? "Update" : "Create"} Contest
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Contests List */}
        {listQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141420] rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="text-center py-16 bg-[#141420] rounded-xl">
            <Gift className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No contests yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contests.map((contest: any) => (
              <div key={contest.id} className="bg-[#141420] rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  {contest.prizeImage && (
                    <img src={contest.prizeImage} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{contest.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[contest.status]}`}>
                        {contest.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{contest.prize}</span>
                      <span>{contest.entryMethod}</span>
                      <span>{contest._count.entries} entries</span>
                      <span>Ends {new Date(contest.endDate).toLocaleDateString()}</span>
                    </div>
                    {contest.winner && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-300">Winner: {contest.winner.name} ({contest.winner.email})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {contest.status === "ENDED" && !contest.winnerId && contest._count.entries > 0 && (
                      <button
                        onClick={() => { if (confirm("Draw a winner for this contest?")) drawMutation.mutate({ contestId: contest.id }); }}
                        disabled={drawMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 text-xs font-medium hover:bg-amber-600/30 transition-colors disabled:opacity-50"
                      >
                        Draw Winner
                      </button>
                    )}
                    {contest.status === "ACTIVE" && new Date(contest.endDate) < new Date() && !contest.winnerId && (
                      <button
                        onClick={() => { if (confirm("Draw a winner for this contest?")) drawMutation.mutate({ contestId: contest.id }); }}
                        disabled={drawMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 text-xs font-medium hover:bg-amber-600/30 transition-colors disabled:opacity-50"
                      >
                        Draw Winner
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedContest(expandedContest === contest.id ? null : contest.id)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      {expandedContest === contest.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(contest)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this contest?")) deleteMutation.mutate({ id: contest.id }); }}
                      className="p-2 rounded-lg bg-white/5 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded entries */}
                {expandedContest === contest.id && (
                  <div className="px-4 pb-4 border-t border-white/5">
                    <h4 className="text-sm font-medium text-gray-400 mt-3 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Entries ({contest._count.entries})
                    </h4>
                    {entriesQuery.isLoading ? (
                      <div className="text-xs text-gray-500">Loading entries...</div>
                    ) : entriesQuery.data && entriesQuery.data.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {entriesQuery.data.map((entry: any) => (
                          <div key={entry.id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-black/20">
                            <div>
                              <span className="text-white">{entry.user.name}</span>
                              <span className="text-gray-500 ml-2">{entry.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{entry.entries} {entry.entries === 1 ? "entry" : "entries"}</span>
                              <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 py-2">No entries yet</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
