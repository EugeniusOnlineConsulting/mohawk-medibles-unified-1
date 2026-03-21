"use client";

/**
 * Email Warm-Up Guide — Step-by-step plan to build sender reputation.
 * Ported from mohawk-medibles2 WarmUpGuideTab.tsx
 */
import { useState, useEffect, useCallback } from "react";

// ---- Types ------------------------------------------------------------------

interface WarmUpPhase {
  phase: number;
  day: number;
  dailyVolume: number;
  description: string;
  milestone: string;
  completed?: boolean;
  actualSent?: number;
  healthScore?: number | null;
}

interface ActivePlan {
  name: string;
  listSize: number;
  status: "active" | "paused" | "completed" | "abandoned";
  currentPhase: number;
  totalPhases: number;
  startedAt: string;
  phases: WarmUpPhase[];
}

interface PlanPreview {
  phases: WarmUpPhase[];
  recommendedDuration: number;
  startingVolume: number;
  targetVolume: number;
}

interface ProgressData {
  daysElapsed: number;
  totalSent: number;
  avgHealthScore: number;
  isOnTrack: boolean;
  warnings: string[];
  currentPhaseDetail: WarmUpPhase & { tips: string[] };
}

interface BestPractice {
  category: string;
  title: string;
  content: string;
}

// ---- Helpers ----------------------------------------------------------------

async function api(action: string, params?: Record<string, string>) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`/api/admin/warmup-guide?${qs}`);
  return res.json();
}

async function postApi(body: any) {
  const res = await fetch("/api/admin/warmup-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ---- Main Page --------------------------------------------------------------

export default function WarmUpGuidePage() {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [preview, setPreview] = useState<PlanPreview | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [loading, setLoading] = useState(true);

  const [listSize, setListSize] = useState("");
  const [planName, setPlanName] = useState("");
  const [actualSent, setActualSent] = useState("");
  const [healthScore, setHealthScore] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [showBestPractices, setShowBestPractices] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const card = "bg-white/5 border border-white/10 rounded-xl";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [planData, historyData, bpData] = await Promise.all([
        api("activePlan"),
        api("history"),
        api("bestPractices"),
      ]);
      setPlan(planData);
      setHistory(historyData || []);
      setBestPractices(bpData || []);

      if (planData) {
        const prog = await api("progress");
        setProgress(prog);
      } else {
        setProgress(null);
      }
    } catch (err) {
      console.error("Failed to load warm-up data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Preview plan when list size changes
  useEffect(() => {
    if (showWizard && parseInt(listSize) > 0) {
      api("generatePlan", { listSize }).then(setPreview).catch(() => {});
    } else {
      setPreview(null);
    }
  }, [showWizard, listSize]);

  const doAction = async (body: any) => {
    setActionPending(true);
    try {
      await postApi(body);
      await refresh();
      setActualSent("");
      setHealthScore("");
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl" />)}
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
            <h1 className="text-3xl font-bold">Deliverability Warm-Up Guide</h1>
            <p className="text-white/60 mt-1">Gradually increase sending volume to build sender reputation</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBestPractices(!showBestPractices)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              Best Practices
            </button>
            {!plan && (
              <button
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Start New Plan
              </button>
            )}
          </div>
        </div>

        {/* Best Practices Panel */}
        {showBestPractices && bestPractices.length > 0 && (
          <div className={`${card} p-5`}>
            <h2 className="text-base font-semibold mb-4">Warm-Up Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestPractices.map((bp, i) => (
                <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase">
                    {bp.category.replace("_", " ")}
                  </span>
                  <h4 className="font-semibold text-sm mt-2">{bp.title}</h4>
                  <p className="text-xs text-white/60 mt-1">{bp.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard - New Plan */}
        {showWizard && !plan && (
          <div className={`${card} p-5 border-orange-500/30`}>
            <h2 className="text-base font-semibold mb-1">Create Warm-Up Plan</h2>
            <p className="text-xs text-white/40 mb-4">Enter your email list size to generate a customized warm-up schedule</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-white/70 block mb-1">Email List Size *</label>
                <input
                  type="number" min="1" placeholder="e.g., 2500"
                  value={listSize} onChange={(e) => setListSize(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/70 block mb-1">Plan Name (optional)</label>
                <input
                  placeholder="e.g., Q1 Newsletter Warm-Up"
                  value={planName} onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Preview */}
            {preview && parseInt(listSize) > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
                <h4 className="font-semibold text-sm mb-2">
                  Recommended Plan: {preview.recommendedDuration} days
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="text-lg font-bold text-orange-400">{preview.startingVolume}</div>
                    <div className="text-xs text-white/40">Starting Volume</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="text-lg font-bold text-green-400">{preview.targetVolume}</div>
                    <div className="text-xs text-white/40">Target Volume</div>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <div className="text-lg font-bold text-blue-400">{preview.phases.length}</div>
                    <div className="text-xs text-white/40">Phases</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {preview.phases.map((phase, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {phase.dailyVolume}
                      </div>
                      {i < preview.phases.length - 1 && (
                        <span className="text-white/20 mx-0.5 text-xs">&#8594;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => doAction({ action: "startPlan", listSize: parseInt(listSize), name: planName || undefined })}
                disabled={!listSize || parseInt(listSize) < 1 || actionPending}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {actionPending ? "Starting..." : "Start Warm-Up"}
              </button>
              <button onClick={() => setShowWizard(false)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active Plan Progress */}
        {plan && progress && (
          <>
            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Current Phase", value: `Phase ${plan.currentPhase}/${plan.totalPhases}`, color: "text-orange-400" },
                { label: "Days Elapsed", value: `${progress.daysElapsed}d`, color: "text-blue-400" },
                { label: "Total Sent", value: progress.totalSent.toLocaleString(), color: "text-green-400" },
                { label: "Avg Health Score", value: String(progress.avgHealthScore), color: "text-purple-400" },
                { label: "Status", value: progress.isOnTrack ? "On Track" : "Behind", color: progress.isOnTrack ? "text-green-400" : "text-yellow-400" },
              ].map((item) => (
                <div key={item.label} className={`${card} p-4 text-center`}>
                  <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-white/40">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Warnings */}
            {progress.warnings.length > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                {progress.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-yellow-400">
                    <span className="mt-0.5">&#9888;</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Current Phase Detail */}
            <div className={`${card} p-5 border-orange-500/20`}>
              <h2 className="text-base font-semibold mb-1">
                Current Phase: Day {progress.currentPhaseDetail.day} - {progress.currentPhaseDetail.description}
              </h2>
              <p className="text-xs text-white/40 mb-4">
                Target: Send {progress.currentPhaseDetail.dailyVolume.toLocaleString()} emails today
              </p>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-4">
                <div className="text-sm font-medium text-orange-400 mb-1">Tips for this phase:</div>
                <ul className="text-xs text-orange-300/70 space-y-1">
                  {progress.currentPhaseDetail.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-orange-500/50 mt-0.5">&#8226;</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-1">Actual Emails Sent</label>
                  <input
                    type="number" min="0" placeholder={`Target: ${progress.currentPhaseDetail.dailyVolume}`}
                    value={actualSent} onChange={(e) => setActualSent(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-1">Health Score (0-100, optional)</label>
                  <input
                    type="number" min="0" max="100" placeholder="From deliverability dashboard"
                    value={healthScore} onChange={(e) => setHealthScore(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => doAction({
                    action: "completePhase",
                    phaseNumber: plan.currentPhase,
                    actualSent: parseInt(actualSent) || 0,
                    healthScore: healthScore ? parseInt(healthScore) : undefined,
                  })}
                  disabled={!actualSent || actionPending}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  Complete Phase
                </button>
                {plan.status === "active" ? (
                  <button onClick={() => doAction({ action: "pause" })} disabled={actionPending}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
                    Pause
                  </button>
                ) : (
                  <button onClick={() => doAction({ action: "resume" })} disabled={actionPending}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
                    Resume
                  </button>
                )}
                <button
                  onClick={() => { if (confirm("Abandon this warm-up plan? This cannot be undone.")) doAction({ action: "abandon" }); }}
                  disabled={actionPending}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Abandon
                </button>
              </div>
            </div>

            {/* Phase Timeline */}
            <div className={`${card} p-5`}>
              <h2 className="text-base font-semibold mb-4">Phase Timeline</h2>
              <div className="space-y-2">
                {plan.phases.map((phase, i) => {
                  const isCurrent = phase.phase === plan.currentPhase;
                  const isPast = phase.completed;
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isCurrent ? "bg-orange-500/10 border border-orange-500/20" :
                      isPast ? "bg-green-500/5" : "bg-white/5"
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isPast ? "bg-green-500 text-white" :
                        isCurrent ? "bg-orange-500 text-white" :
                        "bg-white/10 text-white/40"
                      }`}>
                        {isPast ? "\u2713" : phase.phase}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Day {phase.day}</span>
                          <span className="text-xs text-white/40">{phase.description}</span>
                        </div>
                        <div className="text-xs text-white/30">
                          Target: {phase.dailyVolume.toLocaleString()} emails
                          {isPast && phase.actualSent != null && ` | Sent: ${phase.actualSent.toLocaleString()}`}
                          {isPast && phase.healthScore != null && ` | Health: ${phase.healthScore}`}
                        </div>
                      </div>
                      <div className="text-xs text-white/20 flex-shrink-0">{phase.milestone}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* No Active Plan */}
        {!plan && !showWizard && (
          <div className={`${card} p-8 text-center border-dashed`}>
            <div className="text-5xl mb-3 opacity-30">&#128293;</div>
            <h3 className="text-lg font-semibold mb-1">No Active Warm-Up Plan</h3>
            <p className="text-sm text-white/40 mb-4">
              Start a warm-up plan to gradually increase your sending volume and build sender reputation.
            </p>
            <button onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Create Warm-Up Plan
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className={`${card} p-5`}>
            <h2 className="text-base font-semibold mb-4">Previous Plans</h2>
            <div className="space-y-2">
              {history.map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{h.name}</div>
                    <div className="text-xs text-white/40">
                      {h.listSize?.toLocaleString()} subscribers | {h.totalPhases} phases |
                      Started {new Date(h.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    h.status === "completed" ? "bg-green-500/20 text-green-400" :
                    h.status === "abandoned" ? "bg-red-500/20 text-red-400" :
                    "bg-white/10 text-white/50"
                  }`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
