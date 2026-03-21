"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SegmentRule {
  type: string;
  operator: string;
  value: number | string | number[] | string[];
}

function formatRule(rule: SegmentRule): string {
  const typeLabels: Record<string, string> = {
    totalSpend: "Spend",
    orderCount: "Orders",
    avgOrderValue: "Avg Order",
    recency: "Days Inactive",
    category: "Category",
    language: "Language",
  };
  const opLabels: Record<string, string> = {
    gte: "\u2265",
    lte: "\u2264",
    eq: "=",
    between: "between",
    in: "in",
  };
  const label = typeLabels[rule.type] || rule.type;
  const op = opLabels[rule.operator] || rule.operator;
  const val = rule.type === "totalSpend" || rule.type === "avgOrderValue"
    ? `$${rule.value}`
    : rule.type === "recency"
    ? `${rule.value}d`
    : String(rule.value);
  return `${label} ${op} ${val}`;
}

export default function SegmentationPage() {
  const segmentsQuery = trpc.customerSegments.list.useQuery();
  const seedMutation = trpc.customerSegments.seedPresets.useMutation({
    onSuccess: (data) => {
      toast.success(`Created ${data.created} preset segments`);
      segmentsQuery.refetch();
    },
  });
  const deleteMutation = trpc.customerSegments.delete.useMutation({
    onSuccess: () => {
      toast.success("Segment deleted");
      segmentsQuery.refetch();
    },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Segmentation</h1>
            <p className="text-white/60 mt-1">
              Group customers by purchase behavior to send targeted marketing campaigns.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="px-4 py-2.5 bg-white/10 text-white font-semibold text-sm rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {seedMutation.isPending ? "Seeding..." : "Seed Presets"}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all"
            >
              Create Segment
            </button>
          </div>
        </div>

        {/* Segments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segmentsQuery.data?.map((segment: any) => (
            <div
              key={segment.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 cursor-pointer hover:border-violet-500/50 transition-colors"
              onClick={() => setSelectedSegment(segment.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{segment.name}</h3>
                <div className="flex items-center gap-1">
                  {segment.isPreset && (
                    <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Preset</span>
                  )}
                  <span className="bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded text-[10px] font-bold">
                    {segment.customerCount ?? 0} customers
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/40 mb-3">{segment.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {segment.rules.map((rule: SegmentRule, i: number) => (
                  <span key={i} className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-xs">
                    {formatRule(rule)}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedSegment(segment.id); }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  View Details
                </button>
                {!segment.isPreset && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: segment.id }); }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {segmentsQuery.data?.length === 0 && (
            <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <p className="text-white/40">No segments yet. Click &quot;Seed Presets&quot; to create common segments.</p>
            </div>
          )}
        </div>

        {/* Segment Detail Modal */}
        {selectedSegment && (
          <SegmentDetail segmentId={selectedSegment} onClose={() => setSelectedSegment(null)} />
        )}

        {/* Create Dialog */}
        {showCreate && (
          <CreateSegmentDialog
            open={showCreate}
            onClose={() => { setShowCreate(false); segmentsQuery.refetch(); }}
          />
        )}
      </div>
    </div>
  );
}

function SegmentDetail({ segmentId, onClose }: { segmentId: number; onClose: () => void }) {
  const segmentQuery = trpc.customerSegments.get.useQuery({ id: segmentId });
  const customersQuery = trpc.customerSegments.customers.useQuery({ id: segmentId, limit: 20 });

  if (!segmentQuery.data) return null;
  const segment = segmentQuery.data;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{segment.name}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">x</button>
        </div>
        <p className="text-sm text-white/50 mb-3">{segment.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {segment.rules.map((rule: any, i: number) => (
            <span key={i} className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-xs">
              {formatRule(rule)}
            </span>
          ))}
        </div>

        <h4 className="text-sm font-semibold text-white mb-2">Matching Customers ({segment.customerCount})</h4>
        {customersQuery.isLoading ? (
          <p className="text-sm text-white/40">Loading...</p>
        ) : (
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-2 text-white/50 text-xs font-medium">Name</th>
                  <th className="p-2 text-white/50 text-xs font-medium">Email</th>
                  <th className="p-2 text-right text-white/50 text-xs font-medium">Orders</th>
                  <th className="p-2 text-right text-white/50 text-xs font-medium">Total Spend</th>
                  <th className="p-2 text-right text-white/50 text-xs font-medium">Avg Order</th>
                  <th className="p-2 text-right text-white/50 text-xs font-medium">Days Since Last</th>
                </tr>
              </thead>
              <tbody>
                {customersQuery.data?.map((c: any) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="p-2 text-white">{c.name || "--"}</td>
                    <td className="p-2 text-white/50">{c.email || "--"}</td>
                    <td className="p-2 text-right text-white">{c.orderCount}</td>
                    <td className="p-2 text-right text-white">${c.totalSpend.toFixed(2)}</td>
                    <td className="p-2 text-right text-white">${c.avgOrderValue.toFixed(2)}</td>
                    <td className="p-2 text-right text-white/50">{c.daysSinceLastOrder === 9999 ? "Never" : c.daysSinceLastOrder}</td>
                  </tr>
                ))}
                {customersQuery.data?.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-white/30">No matching customers</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateSegmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([{ type: "totalSpend", operator: "gte", value: 100 }]);

  const createMutation = trpc.customerSegments.create.useMutation({
    onSuccess: () => { toast.success("Segment created"); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const previewQuery = trpc.customerSegments.preview.useQuery(
    { rules },
    { enabled: rules.length > 0 }
  );

  const addRule = () => setRules([...rules, { type: "orderCount", operator: "gte", value: 1 }]);
  const updateRule = (index: number, field: string, value: any) => {
    const updated = [...rules];
    (updated[index] as any)[field] = value;
    setRules(updated);
  };
  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index));

  const inputClass = "px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Create Segment</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">x</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., VIP Customers" className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-1">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className={`${inputClass} w-full`} />
          </div>
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Rules (all must match)</label>
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <select value={rule.type} onChange={e => updateRule(i, "type", e.target.value)} className={`${inputClass} w-[140px]`}>
                  <option value="totalSpend">Total Spend</option>
                  <option value="orderCount">Order Count</option>
                  <option value="avgOrderValue">Avg Order</option>
                  <option value="recency">Days Since Last</option>
                  <option value="language">Language</option>
                </select>
                <select value={rule.operator} onChange={e => updateRule(i, "operator", e.target.value)} className={`${inputClass} w-[80px]`}>
                  <option value="gte">&ge;</option>
                  <option value="lte">&le;</option>
                  <option value="eq">=</option>
                </select>
                {rule.type === "language" ? (
                  <select value={String(rule.value)} onChange={e => updateRule(i, "value", e.target.value)} className={`${inputClass} flex-1`}>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                  </select>
                ) : (
                  <input type="number" value={String(rule.value)} onChange={e => updateRule(i, "value", parseFloat(e.target.value) || 0)} className={`${inputClass} flex-1`} />
                )}
                <button onClick={() => removeRule(i)} disabled={rules.length <= 1} className="text-red-400 hover:text-red-300 disabled:opacity-30 text-xs px-2 py-1">
                  X
                </button>
              </div>
            ))}
            <button onClick={addRule} className="text-xs text-violet-400 hover:text-violet-300 mt-1">
              + Add Rule
            </button>
          </div>
          {previewQuery.data && (
            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <span className="font-medium text-white">{previewQuery.data.count}</span>
              <span className="text-white/50"> customers match these rules</span>
              {previewQuery.data.sample.length > 0 && (
                <div className="mt-1 text-xs text-white/30">
                  Sample: {previewQuery.data.sample.map((s: any) => s.name || s.email).join(", ")}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={() => createMutation.mutate({ name, description, rules })}
            disabled={!name || createMutation.isPending}
            className="px-4 py-2.5 bg-violet-600 text-white font-semibold text-sm rounded-lg hover:bg-violet-700 transition-all disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Segment"}
          </button>
        </div>
      </div>
    </div>
  );
}
