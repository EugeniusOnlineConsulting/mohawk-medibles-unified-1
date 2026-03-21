"use client";

import { useState, useEffect } from "react";
import { Clock, Send, Calendar, History, CheckCircle, XCircle, AlertCircle, Play, Pause, RefreshCw } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    return `${mins}m`;
}

function formatUptime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

interface DigestData {
    settings: { enabled: boolean; frequency: "daily" | "weekly"; dayOfWeek: number; hour: number; minute: number };
    status: { isRunning: boolean; nextRunAt: string | null; uptime: number | null };
    history: any[];
}

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/30";

export default function EmailDigestPage() {
    const [data, setData] = useState<DigestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ enabled: false, frequency: "weekly" as "daily" | "weekly", dayOfWeek: 1, hour: 9, minute: 0 });
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [triggering, setTriggering] = useState(false);

    const fetchData = () => {
        fetch("/api/admin/email-digest/")
            .then(r => r.json())
            .then(d => {
                setData(d);
                setForm(d.settings);
                setHasChanges(false);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    function handleChange<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(f => ({ ...f, [key]: value }));
        setHasChanges(true);
    }

    function handleSave() {
        setSaving(true);
        fetch("/api/admin/email-digest/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
            .then(() => { setSaving(false); setHasChanges(false); fetchData(); })
            .catch(() => setSaving(false));
    }

    function handleTrigger() {
        setTriggering(true);
        fetch("/api/admin/email-digest/", { method: "POST" })
            .then(r => r.json())
            .then(() => { setTriggering(false); fetchData(); })
            .catch(() => setTriggering(false));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            </div>
        );
    }

    const status = data?.status;
    const history = data?.history || [];

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status?.isRunning ? "bg-green-500/10" : "bg-white/5"}`}>
                            {status?.isRunning ? <Play className="w-5 h-5 text-green-400" /> : <Pause className="w-5 h-5 text-zinc-500" />}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">
                                Email Performance Digest
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${status?.isRunning ? "bg-green-500/20 text-green-400" : "bg-white/5 text-zinc-500"}`}>
                                    {status?.isRunning ? "Active" : "Inactive"}
                                </span>
                            </h1>
                            <p className="text-sm text-zinc-500">
                                {status?.isRunning
                                    ? `Next run: ${status.nextRunAt ? new Date(status.nextRunAt).toLocaleString() : "\u2014"}`
                                    : "Scheduler is not running"}
                                {status?.uptime ? ` \u00b7 Uptime: ${formatUptime(status.uptime)}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleTrigger}
                        disabled={triggering}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Send className="w-3 h-3 inline mr-1" />
                        {triggering ? "Sending..." : "Send Now"}
                    </button>
                </div>
            </div>

            {/* Settings */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-400" /> Schedule Settings
                </h3>
                <div className="space-y-4">
                    {/* Enable/Disable */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Enable Digest</p>
                            <p className="text-xs text-zinc-500">Automatically send email performance reports</p>
                        </div>
                        <button
                            onClick={() => handleChange("enabled", !form.enabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${form.enabled ? "bg-green-500" : "bg-white/10"}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.enabled ? "left-6" : "left-0.5"}`} />
                        </button>
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Frequency</label>
                        <select className={inputClass} value={form.frequency} onChange={e => handleChange("frequency", e.target.value as "daily" | "weekly")}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    {form.frequency === "weekly" && (
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Day of Week</label>
                            <select className={inputClass} value={form.dayOfWeek} onChange={e => handleChange("dayOfWeek", parseInt(e.target.value))}>
                                {DAY_NAMES.map((day, i) => <option key={i} value={i}>{day}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Hour (UTC)</label>
                            <select className={inputClass} value={form.hour} onChange={e => handleChange("hour", parseInt(e.target.value))}>
                                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, "0")}:00</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Minute</label>
                            <select className={inputClass} value={form.minute} onChange={e => handleChange("minute", parseInt(e.target.value))}>
                                {[0, 15, 30, 45].map(m => <option key={m} value={m}>:{String(m).padStart(2, "0")}</option>)}
                            </select>
                        </div>
                    </div>

                    {hasChanges && (
                        <div className="flex gap-2 pt-2">
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {saving ? "Saving..." : "Save Settings"}
                            </button>
                            <button onClick={() => { if (data) { setForm(data.settings); setHasChanges(false); } }} className="px-4 py-2 border border-white/10 text-zinc-400 text-sm rounded-lg hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Run History */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <History className="w-4 h-4 text-green-400" /> Run History
                    </h3>
                    <button onClick={fetchData} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No digest runs yet</p>
                        <p className="text-xs text-zinc-600 mt-1">Click &quot;Send Now&quot; to trigger the first digest</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {history.map((run: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    run.status === "success" ? "bg-green-500/10" : run.status === "skipped" ? "bg-amber-500/10" : "bg-red-500/10"
                                }`}>
                                    {run.status === "success" ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                                     run.status === "skipped" ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                                     <XCircle className="w-4 h-4 text-red-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium capitalize">{run.status}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded">{run.triggeredBy}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 truncate">
                                        {run.status === "success"
                                            ? `${run.emailsSent} emails \u00b7 ${run.totalOpens} opens \u00b7 ${run.totalClicks} clicks`
                                            : run.errorMessage || "\u2014"}
                                        {" \u00b7 "}{formatDuration(run.durationMs)}
                                    </p>
                                </div>
                                <span className="text-xs text-zinc-600 flex-shrink-0">
                                    {new Date(run.startedAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
