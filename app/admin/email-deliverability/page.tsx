"use client";

/**
 * Email Deliverability Dashboard — Monitor sender reputation, delivery rates,
 * bounce tracking, and per-template performance.
 * Ported from mohawk-medibles2 (DeliverabilityDashboardTab + DeliverabilityTab)
 */
import { useState, useEffect, useCallback } from "react";

// ---- Types ------------------------------------------------------------------

interface DashboardData {
  overallScore: number;
  overallGrade: string;
  totalCampaignsSent: number;
  totalEmailsSent: number;
  avgDeliveryRate: number;
  avgBounceRate: number;
  avgSpamRate: number;
  reputationTrend: TrendPoint[];
  recommendations: string[];
  topIssues: { issue: string; severity: string; count: number }[];
  campaignScores: any[];
  byTemplate: { emailType: string; total: number; delivered: number; bounced: number; spamComplaint: number }[];
  recentEvents: { id: number; eventType: string; recipientEmail: string; emailType: string; createdAt: string }[];
  trend: TrendPoint[];
}

interface TrendPoint {
  date: string;
  score: number;
  deliveryRate: number;
  bounceRate: number;
  spamRate: number;
  totalSent: number;
}

// ---- Score Gauge ------------------------------------------------------------

function ScoreGauge({ score, grade, size = "lg" }: { score: number; grade: string; size?: "sm" | "lg" }) {
  const radius = size === "lg" ? 60 : 30;
  const stroke = size === "lg" ? 8 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444";
  const dim = (radius + stroke) * 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none"
          stroke="currentColor" strokeWidth={stroke} className="text-white/10" />
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeDasharray={circumference}
          strokeDashoffset={circumference - progress} strokeLinecap="round"
          className="transition-all duration-1000" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-lg"}`} style={{ color }}>{score}</span>
        <span className={`font-semibold ${size === "lg" ? "text-sm" : "text-xs"} text-white/50`}>{grade}</span>
      </div>
    </div>
  );
}

// ---- Reputation Trend -------------------------------------------------------

function ReputationTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return <p className="text-sm text-white/40 text-center py-8">No reputation data yet</p>;

  const maxScore = 100;
  const chartH = 160;
  const chartW = Math.max(data.length * 40, 300);

  return (
    <div className="overflow-x-auto">
      <svg width={chartW} height={chartH + 40} className="w-full" viewBox={`0 0 ${chartW} ${chartH + 40}`}>
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={30} y1={chartH - (v / maxScore) * chartH} x2={chartW} y2={chartH - (v / maxScore) * chartH}
              stroke="white" strokeOpacity={0.06} />
            <text x={0} y={chartH - (v / maxScore) * chartH + 4} fontSize={10} fill="white" opacity={0.3}>{v}</text>
          </g>
        ))}
        <polyline fill="none" stroke="#22c55e" strokeWidth={2}
          points={data.map((d, i) => `${30 + i * ((chartW - 30) / Math.max(data.length - 1, 1))},${chartH - (d.score / maxScore) * chartH}`).join(" ")} />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={30 + i * ((chartW - 30) / Math.max(data.length - 1, 1))}
              cy={chartH - (d.score / maxScore) * chartH} r={3} fill="#22c55e" />
            <text x={30 + i * ((chartW - 30) / Math.max(data.length - 1, 1))}
              y={chartH + 20} fontSize={9} fill="white" opacity={0.3} textAnchor="middle">
              {d.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ---- Main Page --------------------------------------------------------------

export default function EmailDeliverabilityPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const card = "bg-white/5 border border-white/10 rounded-xl";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-deliverability?action=dashboard&days=${days}`);
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to fetch deliverability data:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getHealthBadge = () => {
    if (!dashboard) return null;
    const b = dashboard.avgBounceRate;
    const s = dashboard.avgSpamRate;
    if (b > 5 || s > 0.5) return <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-medium">Poor</span>;
    if (b > 2 || s > 0.1) return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">Fair</span>;
    return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">Good</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <p className="text-white/40 text-center py-8">Unable to load deliverability data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Deliverability</h1>
            <p className="text-white/60 mt-1">Monitor sender reputation, bounce rates, and delivery health</p>
          </div>
          <div className="flex items-center gap-3">
            {getHealthBadge()}
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Score + KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className={`${card} p-5 flex items-center justify-center`}>
            <div className="text-center">
              <ScoreGauge score={dashboard.overallScore} grade={dashboard.overallGrade} size="lg" />
              <p className="text-sm text-white/50 mt-2">Overall Score</p>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <p className="text-white/50 text-sm mb-1">Total Sent</p>
            <p className="text-2xl font-bold">{dashboard.totalEmailsSent.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-1">{days} day period</p>
          </div>

          <div className={`${card} p-5`}>
            <p className="text-white/50 text-sm mb-1">Delivery Rate</p>
            <p className="text-2xl font-bold text-green-400">{dashboard.avgDeliveryRate}%</p>
            <p className="text-xs text-white/30 mt-1">Average across sends</p>
          </div>

          <div className={`${card} p-5`}>
            <p className="text-white/50 text-sm mb-1">Bounce Rate</p>
            <p className="text-2xl font-bold text-orange-400">{dashboard.avgBounceRate}%</p>
            <p className="text-xs text-white/30 mt-1">{dashboard.avgBounceRate <= 2 ? "Healthy" : "Needs attention"}</p>
          </div>

          <div className={`${card} p-5`}>
            <p className="text-white/50 text-sm mb-1">Spam Rate</p>
            <p className="text-2xl font-bold text-red-400">{dashboard.avgSpamRate}%</p>
            <p className="text-xs text-white/30 mt-1">{dashboard.avgSpamRate <= 0.1 ? "Excellent" : "Monitor closely"}</p>
          </div>
        </div>

        {/* Reputation Trend + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${card} p-5 lg:col-span-2`}>
            <h2 className="text-base font-semibold mb-1">Sender Reputation Trend (30 days)</h2>
            <p className="text-xs text-white/40 mb-4">Daily reputation score based on delivery success</p>
            <ReputationTrendChart data={dashboard.reputationTrend} />
          </div>

          <div className={`${card} p-5`}>
            <h2 className="text-base font-semibold mb-3">Recommendations</h2>
            <div className="space-y-3">
              {dashboard.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-green-400 shrink-0 mt-0.5">&#9650;</span>
                  <span className="text-white/70">{rec}</span>
                </div>
              ))}
              {dashboard.topIssues.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs font-semibold text-white/40 uppercase">Top Issues</p>
                  {dashboard.topIssues.map((issue, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        issue.severity === "high" ? "bg-red-500/20 text-red-400" :
                        issue.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-white/10 text-white/50"
                      }`}>{issue.severity}</span>
                      <span className="text-xs text-white/60">{issue.issue} ({issue.count}x)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 14-Day Delivery Trend */}
        {dashboard.trend && dashboard.trend.length > 0 && (
          <div className={`${card} p-5`}>
            <h2 className="text-base font-semibold mb-4">14-Day Delivery Trend</h2>
            <div className="space-y-2">
              {dashboard.trend.map((day) => {
                const rate = day.totalSent > 0 ? day.deliveryRate : 100;
                return (
                  <div key={day.date} className="flex items-center gap-3 text-sm">
                    <span className="w-20 text-white/40 font-mono text-xs">{day.date.slice(5)}</span>
                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${rate >= 95 ? "bg-green-500" : rate >= 90 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${rate}%` }} />
                    </div>
                    <span className="w-20 text-right font-mono text-xs text-white/50">{rate.toFixed(0)}% ({day.totalSent})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deliverability by Template */}
        {dashboard.byTemplate && dashboard.byTemplate.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <div className="p-5 pb-3">
              <h2 className="text-base font-semibold">Deliverability by Template</h2>
              <p className="text-xs text-white/40">Bounce and spam rates per email type</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-white/50 text-sm font-medium">Template</th>
                    <th className="px-5 py-3 text-white/50 text-sm font-medium text-right">Sent</th>
                    <th className="px-5 py-3 text-white/50 text-sm font-medium text-right">Delivered</th>
                    <th className="px-5 py-3 text-white/50 text-sm font-medium text-right">Bounced</th>
                    <th className="px-5 py-3 text-white/50 text-sm font-medium text-right">Spam</th>
                    <th className="px-5 py-3 text-white/50 text-sm font-medium text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.byTemplate.map((t) => (
                    <tr key={t.emailType} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 capitalize">{t.emailType.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3 text-right">{t.total}</td>
                      <td className="px-5 py-3 text-right text-green-400">{t.delivered}</td>
                      <td className="px-5 py-3 text-right text-red-400">{t.bounced}</td>
                      <td className="px-5 py-3 text-right text-orange-400">{t.spamComplaint}</td>
                      <td className="px-5 py-3 text-right font-medium">
                        {t.total > 0 ? ((t.delivered / t.total) * 100).toFixed(1) : "100"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Events */}
        {dashboard.recentEvents && dashboard.recentEvents.length > 0 && (
          <div className={`${card} p-5`}>
            <h2 className="text-base font-semibold mb-4">Recent Events</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {dashboard.recentEvents.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between py-2 border-b border-white/5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      evt.eventType === "delivered" ? "bg-green-500/20 text-green-400" :
                      evt.eventType === "bounced" ? "bg-red-500/20 text-red-400" :
                      "bg-white/10 text-white/50"
                    }`}>{evt.eventType}</span>
                    <span className="text-white/60">{evt.recipientEmail}</span>
                    {evt.emailType && (
                      <span className="text-xs text-white/30 capitalize">({evt.emailType.replace(/_/g, " ")})</span>
                    )}
                  </div>
                  <span className="text-xs text-white/30">{new Date(evt.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
