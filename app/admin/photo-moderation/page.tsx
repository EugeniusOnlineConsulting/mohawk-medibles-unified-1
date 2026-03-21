"use client";

/**
 * Photo Moderation — Manual review queue + AI auto-moderation + auto-tagging.
 * Ported from mohawk-medibles2 PhotoModerationTab, AiPhotoModerationTab, PhotoAutoTagTab.
 */
import { useState, useEffect, useCallback } from "react";

// ---- Types ------------------------------------------------------------------

interface ModerationItem {
  reviewId: number;
  productId: number;
  rating: number;
  title: string;
  content: string;
  photos: string[];
  photoStatus: "pending" | "approved" | "rejected";
  photoRejectionReason?: string;
  createdAt: string;
}

interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface AiSettings {
  enabled: boolean;
  autoApproveEnabled: boolean;
  autoRejectEnabled: boolean;
  confidenceThreshold: number;
}

interface AiStats {
  totalProcessed: number;
  autoApproved: number;
  autoRejected: number;
  flaggedForReview: number;
  avgConfidence: number;
}

interface TagSettings {
  enabled: boolean;
  tagOnUpload: boolean;
  minConfidence: number;
  predefinedTags: string[];
}

interface TagStats {
  totalTagged: number;
  avgTagsPerPhoto: number;
  topTags: string[];
  tagDistribution: { tag: string; count: number; percentage: number }[];
  lastProcessedAt: string | null;
}

// ---- API helpers ------------------------------------------------------------

async function apiGet(action: string, params?: Record<string, string>) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`/api/admin/photo-moderation?${qs}`);
  return res.json();
}

async function apiPost(body: any) {
  const res = await fetch("/api/admin/photo-moderation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ---- Main Page --------------------------------------------------------------

export default function PhotoModerationPage() {
  const [tab, setTab] = useState<"moderation" | "ai" | "tagging">("moderation");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [lightboxPhoto, setLightboxPhoto] = useState<{ photos: string[]; index: number } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // AI state
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);
  const [aiStats, setAiStats] = useState<AiStats | null>(null);
  const [aiLog, setAiLog] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Tagging state
  const [tagSettings, setTagSettings] = useState<TagSettings | null>(null);
  const [tagStats, setTagStats] = useState<TagStats | null>(null);
  const [newTag, setNewTag] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const card = "bg-white/5 border border-white/10 rounded-xl";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [queueData, statsData, aiSettingsData, aiStatsData, aiLogData, tagSettingsData, tagStatsData] = await Promise.all([
        apiGet("moderationQueue", { status: filter }),
        apiGet("moderationStats"),
        apiGet("aiModerationSettings"),
        apiGet("aiModerationStats"),
        apiGet("aiModerationLog"),
        apiGet("autoTagSettings"),
        apiGet("tagStats"),
      ]);
      setQueue(queueData || []);
      setStats(statsData);
      setAiSettings(aiSettingsData);
      setAiStats(aiStatsData);
      setAiLog(aiLogData || []);
      setTagSettings(tagSettingsData);
      setTagStats(tagStatsData);
    } catch (err) {
      console.error("Failed to load moderation data:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const approve = async (reviewId: number) => {
    await apiPost({ action: "approvePhotos", reviewId });
    refresh();
  };

  const reject = async (reviewId: number, reason?: string) => {
    await apiPost({ action: "rejectPhotos", reviewId, reason });
    setRejectingId(null);
    setRejectReason("");
    refresh();
  };

  const bulkApprove = async () => {
    await apiPost({ action: "bulkApprovePhotos", reviewIds: Array.from(selectedIds) });
    setSelectedIds(new Set());
    refresh();
  };

  const bulkReject = async () => {
    await apiPost({ action: "bulkRejectPhotos", reviewIds: Array.from(selectedIds) });
    setSelectedIds(new Set());
    refresh();
  };

  const updateAiSettings = async (updates: Partial<AiSettings>) => {
    const result = await apiPost({ action: "updateAiModerationSettings", settings: updates });
    setAiSettings(result);
  };

  const aiProcessPending = async () => {
    const result = await apiPost({ action: "aiProcessPending", limit: 10 });
    refresh();
  };

  const updateTagSettings = async (updates: Partial<TagSettings>) => {
    const result = await apiPost({ action: "updateAutoTagSettings", settings: updates });
    setTagSettings(result);
  };

  const processUntagged = async () => {
    await apiPost({ action: "processUntagged" });
    refresh();
  };

  const tabs = [
    { id: "moderation" as const, label: "Photo Moderation", count: stats.pending },
    { id: "ai" as const, label: "AI Moderation" },
    { id: "tagging" as const, label: "Auto-Tagging" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
          </div>
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
            <h1 className="text-3xl font-bold">Photo Moderation</h1>
            <p className="text-white/60 mt-1">Review, moderate, and auto-tag customer-submitted photos</p>
          </div>
          <button onClick={refresh}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
            Refresh
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id ? "bg-white/15 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}>
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className="ml-2 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TAB: Photo Moderation */}
        {/* ================================================================= */}
        {tab === "moderation" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {([
                { label: "Pending", value: stats.pending, color: "text-amber-400", filterVal: "pending" as const },
                { label: "Approved", value: stats.approved, color: "text-green-400", filterVal: "approved" as const },
                { label: "Rejected", value: stats.rejected, color: "text-red-400", filterVal: "rejected" as const },
                { label: "Total", value: stats.total, color: "text-violet-400", filterVal: undefined },
              ] as const).map(s => (
                <div key={s.label}
                  onClick={() => s.filterVal && setFilter(s.filterVal)}
                  className={`${card} p-4 ${s.filterVal ? "cursor-pointer" : ""} transition-all ${
                    s.filterVal && filter === s.filterVal ? "ring-2 ring-white/20" : "hover:bg-white/5"
                  }`}>
                  <span className={`text-xs font-bold uppercase ${s.color}`}>{s.label}</span>
                  <p className="text-2xl font-black mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && filter === "pending" && (
              <div className={`${card} p-4 flex items-center gap-3 bg-violet-500/10 border-violet-500/20`}>
                <span className="text-sm font-semibold text-violet-400">{selectedIds.size} selected</span>
                <div className="flex-1" />
                <button onClick={bulkApprove}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Approve All
                </button>
                <button onClick={bulkReject}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Reject All
                </button>
              </div>
            )}

            {/* Queue */}
            {queue.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3 opacity-20">&#128247;</div>
                <p className="text-sm text-white/30">No {filter} photo reviews found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filter === "pending" && queue.length > 1 && (
                  <button onClick={() => {
                    if (selectedIds.size === queue.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(queue.map(q => q.reviewId)));
                  }} className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                    {selectedIds.size === queue.length ? "Deselect All" : "Select All"}
                  </button>
                )}

                {queue.map(item => (
                  <div key={item.reviewId} className={`${card} overflow-hidden transition-all ${
                    selectedIds.has(item.reviewId) ? "ring-2 ring-violet-500/50" : ""
                  }`}>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {filter === "pending" && (
                          <input type="checkbox" checked={selectedIds.has(item.reviewId)}
                            onChange={() => toggleSelect(item.reviewId)}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500" />
                        )}

                        {/* Photo thumbnails */}
                        <div className="flex gap-2 flex-wrap">
                          {item.photos.map((photo, i) => (
                            <button key={i} onClick={() => setLightboxPhoto({ photos: item.photos, index: i })}
                              className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white/10 hover:border-violet-500/50 transition-colors group">
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                            </button>
                          ))}
                        </div>

                        {/* Review info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white/30">Review #{item.reviewId}</span>
                            <span className="text-xs text-white/30">|</span>
                            <span className="text-xs text-white/30">Product #{item.productId}</span>
                            <span className="text-xs text-white/30">|</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`text-xs ${i < item.rating ? "text-amber-400" : "text-white/10"}`}>
                                  &#9733;
                                </span>
                              ))}
                            </div>
                          </div>
                          {item.title && <p className="text-sm font-semibold">{item.title}</p>}
                          {item.content && <p className="text-xs text-white/40 mt-1 line-clamp-2">{item.content}</p>}
                          <p className="text-[10px] text-white/20 mt-1">
                            {item.photos.length} photo{item.photos.length !== 1 ? "s" : ""} | Submitted {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                          {item.photoStatus === "rejected" && item.photoRejectionReason && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
                              Rejected: {item.photoRejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          {item.photoStatus === "pending" && (
                            <>
                              <button onClick={() => approve(item.reviewId)}
                                className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button onClick={() => setRejectingId(item.reviewId)}
                                className="px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          {item.photoStatus === "approved" && (
                            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full text-green-400 bg-green-500/10 border border-green-500/20">
                              Approved
                            </span>
                          )}
                          {item.photoStatus === "rejected" && (
                            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full text-red-400 bg-red-500/10 border border-red-500/20">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reject reason input */}
                      {rejectingId === item.reviewId && (
                        <div className="mt-3 border-t border-white/10 pt-3">
                          <label className="text-xs text-white/40 block mb-1">Rejection reason (optional)</label>
                          <div className="flex gap-2">
                            <input type="text" value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="e.g., Inappropriate content, low quality..."
                              className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50" />
                            <button onClick={() => reject(item.reviewId, rejectReason || undefined)}
                              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              Confirm Reject
                            </button>
                            <button onClick={() => { setRejectingId(null); setRejectReason(""); }}
                              className="px-3 py-2 text-sm text-white/50 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: AI Moderation */}
        {/* ================================================================= */}
        {tab === "ai" && (
          <div className="space-y-4">
            {/* AI Stats */}
            {aiStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Total Processed", value: aiStats.totalProcessed, color: "" },
                  { label: "Auto-Approved", value: aiStats.autoApproved, color: "text-green-400" },
                  { label: "Auto-Rejected", value: aiStats.autoRejected, color: "text-red-400" },
                  { label: "Flagged for Review", value: aiStats.flaggedForReview, color: "text-yellow-400" },
                  { label: "Avg Confidence", value: `${aiStats.avgConfidence}%`, color: "text-blue-400" },
                ].map(s => (
                  <div key={s.label} className={`${card} p-4 text-center`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-white/40">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* AI Settings */}
            {aiSettings && (
              <div className={`${card} p-5`}>
                <h2 className="text-base font-semibold mb-1">AI Moderation Settings</h2>
                <p className="text-xs text-white/40 mb-4">Configure automatic photo screening behavior</p>
                <div className="space-y-5">
                  {[
                    { label: "Enable AI Moderation", desc: "Automatically analyze new review photos", key: "enabled" as const },
                    { label: "Auto-Approve Safe Photos", desc: "Automatically approve photos above confidence threshold", key: "autoApproveEnabled" as const },
                    { label: "Auto-Reject Unsafe Photos", desc: "Automatically reject photos flagged as inappropriate", key: "autoRejectEnabled" as const },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-white/40">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => updateAiSettings({ [item.key]: !aiSettings[item.key] })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          aiSettings[item.key] ? "bg-violet-600" : "bg-white/10"
                        }`}>
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          aiSettings[item.key] ? "translate-x-6" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Confidence Threshold</p>
                      <span className="text-sm font-mono bg-white/5 px-2 py-0.5 rounded">{aiSettings.confidenceThreshold}%</span>
                    </div>
                    <p className="text-sm text-white/40">Minimum AI confidence to auto-approve/reject (higher = more conservative)</p>
                    <input type="range" min={50} max={99} step={5}
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => updateAiSettings({ confidenceThreshold: parseInt(e.target.value) })}
                      className="w-full accent-violet-500" />
                    <div className="flex justify-between text-xs text-white/30">
                      <span>50% (Lenient)</span>
                      <span>99% (Strict)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Process Pending button */}
            <button onClick={aiProcessPending} disabled={!aiSettings?.enabled}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
              Process Pending Photos
            </button>

            {/* AI Log */}
            <div className={`${card} p-5`}>
              <h2 className="text-base font-semibold mb-1">AI Moderation Log</h2>
              <p className="text-xs text-white/40 mb-4">Recent AI analysis results</p>
              {aiLog.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">No AI moderation activity yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {aiLog.map((entry: any) => (
                    <div key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => setSelectedLog(entry)}>
                      <div className="w-10 h-10 rounded bg-white/5 overflow-hidden shrink-0">
                        {entry.photoUrl && <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Review #{entry.reviewId}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            entry.result?.action === "auto_approved" ? "bg-green-500/20 text-green-400" :
                            entry.result?.action === "auto_rejected" ? "bg-red-500/20 text-red-400" :
                            "bg-white/10 text-white/50"
                          }`}>{entry.result?.action?.replace(/_/g, " ") || "unknown"}</span>
                        </div>
                        <p className="text-xs text-white/40 truncate">{entry.result?.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono font-bold" style={{
                          color: (entry.result?.confidence ?? 0) >= 80 ? "#22c55e" : (entry.result?.confidence ?? 0) >= 50 ? "#eab308" : "#ef4444"
                        }}>{entry.result?.confidence}%</p>
                        <p className="text-xs text-white/30">{entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: Auto-Tagging */}
        {/* ================================================================= */}
        {tab === "tagging" && (
          <div className="space-y-4">
            {/* Tag Stats */}
            {tagStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Photos Tagged", value: tagStats.totalTagged, color: "text-indigo-400" },
                  { label: "Avg Tags/Photo", value: tagStats.avgTagsPerPhoto, color: "text-green-400" },
                  { label: "Unique Tags", value: tagStats.tagDistribution.length, color: "text-blue-400" },
                  { label: "Last Processed", value: tagStats.lastProcessedAt ? new Date(tagStats.lastProcessedAt).toLocaleDateString() : "Never", color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className={`${card} p-4 text-center`}>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-white/40">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tag Settings */}
            {tagSettings && (
              <div className={`${card} p-5`}>
                <h2 className="text-base font-semibold mb-4">Auto-Tag Settings</h2>
                <div className="space-y-4">
                  {[
                    { label: "Enable Auto-Tagging", desc: "Use AI to automatically tag review photos", key: "enabled" as const },
                    { label: "Tag on Upload", desc: "Automatically tag photos when reviews are submitted", key: "tagOnUpload" as const },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-white/40">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => updateTagSettings({ [item.key]: !tagSettings[item.key] })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          tagSettings[item.key] ? "bg-violet-600" : "bg-white/10"
                        }`}>
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          tagSettings[item.key] ? "translate-x-6" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  ))}

                  <div>
                    <label className="text-sm font-medium text-white/70 block mb-1">Minimum Confidence (%)</label>
                    <input type="number" min="0" max="100"
                      value={tagSettings.minConfidence}
                      onChange={(e) => updateTagSettings({ minConfidence: parseInt(e.target.value) || 60 })}
                      className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
                  </div>

                  {/* Predefined Tags */}
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-2 block">Predefined Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tagSettings.predefinedTags.map((tag) => (
                        <span key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            selectedTag === tag
                              ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
                              : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          }`}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                          {tag.replace(/_/g, " ")}
                          <button className="hover:text-red-400" onClick={(e) => {
                            e.stopPropagation();
                            updateTagSettings({ predefinedTags: tagSettings.predefinedTags.filter(t => t !== tag) });
                          }}>
                            &#10005;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input placeholder="Add new tag..." value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newTag.trim()) {
                            const formatted = newTag.trim().toLowerCase().replace(/\s+/g, "_");
                            if (!tagSettings.predefinedTags.includes(formatted)) {
                              updateTagSettings({ predefinedTags: [...tagSettings.predefinedTags, formatted] });
                              setNewTag("");
                            }
                          }
                        }}
                        className="w-48 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" />
                      <button onClick={() => {
                        const formatted = newTag.trim().toLowerCase().replace(/\s+/g, "_");
                        if (formatted && !tagSettings.predefinedTags.includes(formatted)) {
                          updateTagSettings({ predefinedTags: [...tagSettings.predefinedTags, formatted] });
                          setNewTag("");
                        }
                      }} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Process Untagged button */}
            <button onClick={processUntagged} disabled={!tagSettings?.enabled}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
              Process Untagged Photos
            </button>

            {/* Tag Distribution */}
            {tagStats && tagStats.tagDistribution.length > 0 && (
              <div className={`${card} p-5`}>
                <h2 className="text-base font-semibold mb-4">Tag Distribution</h2>
                <div className="space-y-2">
                  {tagStats.tagDistribution.map((item) => (
                    <div key={item.tag}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTag === item.tag ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-white/5"
                      }`}
                      onClick={() => setSelectedTag(selectedTag === item.tag ? null : item.tag)}>
                      <span className="text-sm font-medium w-32 truncate">{item.tag.replace(/_/g, " ")}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.max(item.percentage, 2)}%` }} />
                      </div>
                      <span className="text-xs text-white/40 w-16 text-right">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* Lightbox */}
        {/* ================================================================= */}
        {lightboxPhoto && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxPhoto(null)}>
            <button onClick={e => { e.stopPropagation(); setLightboxPhoto(null); }}
              className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold z-10">
              &#10005;
            </button>

            {lightboxPhoto.photos.length > 1 && (
              <>
                <button onClick={e => {
                  e.stopPropagation();
                  setLightboxPhoto(prev => prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null);
                }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                  &#8592;
                </button>
                <button onClick={e => {
                  e.stopPropagation();
                  setLightboxPhoto(prev => prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null);
                }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                  &#8594;
                </button>
              </>
            )}

            <img src={lightboxPhoto.photos[lightboxPhoto.index]} alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={e => e.stopPropagation()} />

            {lightboxPhoto.photos.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {lightboxPhoto.photos.map((_, i) => (
                  <button key={i}
                    onClick={e => { e.stopPropagation(); setLightboxPhoto(prev => prev ? { ...prev, index: i } : null); }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === lightboxPhoto.index ? "bg-white" : "bg-white/30 hover:bg-white/50"
                    }`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
            <div className={`${card} max-w-lg w-full p-5 space-y-4`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">AI Analysis Detail</h3>
                <button onClick={() => setSelectedLog(null)} className="text-white/40 hover:text-white text-lg">&#10005;</button>
              </div>

              {selectedLog.photoUrl && (
                <div className="rounded-lg overflow-hidden bg-white/5 max-h-48 flex items-center justify-center">
                  <img src={selectedLog.photoUrl} alt="Review photo" className="max-h-48 object-contain" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className={`text-lg ${selectedLog.result?.isSafe ? "text-green-400" : "text-red-400"}`}>
                  {selectedLog.result?.isSafe ? "\u2713" : "\u2717"}
                </span>
                <div>
                  <p className="font-semibold">{selectedLog.result?.isSafe ? "Safe" : "Unsafe"}</p>
                  <p className="text-sm text-white/40">{selectedLog.result?.reason}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  selectedLog.result?.action === "auto_approved" ? "bg-green-500/20 text-green-400" :
                  selectedLog.result?.action === "auto_rejected" ? "bg-red-500/20 text-red-400" :
                  "bg-white/10 text-white/50"
                }`}>{selectedLog.result?.action?.replace(/_/g, " ")}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Confidence</span>
                  <span className="font-mono font-bold">{selectedLog.result?.confidence}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${selectedLog.result?.confidence || 0}%`,
                    backgroundColor: (selectedLog.result?.confidence ?? 0) >= 80 ? "#22c55e" : (selectedLog.result?.confidence ?? 0) >= 50 ? "#eab308" : "#ef4444",
                  }} />
                </div>
              </div>

              {selectedLog.result?.categories?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Category Analysis</p>
                  {selectedLog.result.categories.map((cat: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={cat.detected ? "text-red-400" : "text-green-400"}>
                        {cat.detected ? "\u2717" : "\u2713"}
                      </span>
                      <span className="flex-1">{cat.category.replace(/_/g, " ")}</span>
                      <span className="font-mono text-xs text-white/40">{cat.confidence}%</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-white/30">
                Analyzed: {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
