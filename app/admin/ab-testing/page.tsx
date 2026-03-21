"use client";

import { useState, useEffect, useCallback } from "react";
import {
    FlaskConical, Plus, Trash2, Play, Pause, Trophy,
    Eye, RefreshCw, Loader2,
} from "lucide-react";

const inputClass =
    "w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:border-violet-500";
const cardClass =
    "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800";
const btnPrimary =
    "px-4 py-2 bg-violet-600 text-white font-bold text-xs uppercase tracking-wider rounded hover:bg-violet-700 transition-colors disabled:opacity-50";
const btnDanger =
    "px-3 py-1.5 border border-red-300 dark:border-red-800 text-red-500 text-xs rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors";
const badgeClass =
    "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border";

const STATUS_STYLES: Record<string, string> = {
    draft: "text-gray-500 border-gray-300 bg-gray-50 dark:bg-gray-800",
    running: "text-green-500 border-green-300 bg-green-50 dark:bg-green-900/20",
    paused: "text-amber-500 border-amber-300 bg-amber-50 dark:bg-amber-900/20",
    completed: "text-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20",
};

interface AbTest {
    id: number;
    name: string;
    description?: string;
    element: string;
    variantA: string;
    variantB: string;
    status: string;
    trafficSplit: number;
    impressionsA: number;
    impressionsB: number;
    conversionsA: number;
    conversionsB: number;
    winnerVariant?: string;
}

interface Stats {
    total: number;
    running: number;
    completed: number;
    avgLift: number;
}

export default function ABTestingPage() {
    const [tests, setTests] = useState<AbTest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [selectedTest, setSelectedTest] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        element: "",
        variantA: "",
        variantB: "",
        trafficSplit: 50,
    });

    const fetchData = useCallback(async () => {
        try {
            const [testsRes, statsRes] = await Promise.all([
                fetch("/api/admin/ab-tests/?action=list"),
                fetch("/api/admin/ab-tests/?action=stats"),
            ]);
            const testsData = await testsRes.json();
            const statsData = await statsRes.json();
            setTests(testsData.tests || []);
            setStats(statsData);
        } catch (err) {
            console.error("Failed to fetch AB tests:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function fetchDetail(id: number) {
        const res = await fetch(`/api/admin/ab-tests/?action=detail&id=${id}`);
        const data = await res.json();
        setSelectedTest(data);
    }

    async function createTest() {
        setSaving(true);
        try {
            await fetch("/api/admin/ab-tests/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create", ...form }),
            });
            setShowCreate(false);
            setForm({ name: "", description: "", element: "", variantA: "", variantB: "", trafficSplit: 50 });
            await fetchData();
        } finally {
            setSaving(false);
        }
    }

    async function updateTest(id: number, data: any) {
        await fetch("/api/admin/ab-tests/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update", id, ...data }),
        });
        await fetchData();
    }

    async function deleteTest(id: number) {
        if (!confirm("Delete this test?")) return;
        await fetch("/api/admin/ab-tests/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete", id }),
        });
        setSelectedTest(null);
        await fetchData();
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <FlaskConical size={20} className="text-violet-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">A/B Testing</h1>
                        <p className="text-xs text-gray-500">Create and manage A/B tests for site elements</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <RefreshCw size={12} /> Refresh
                    </button>
                    <button className={btnPrimary} onClick={() => setShowCreate(true)}>
                        <span className="flex items-center gap-1.5"><Plus size={14} /> New Test</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Tests", value: stats.total, icon: FlaskConical, color: "text-violet-600" },
                        { label: "Running", value: stats.running, icon: Play, color: "text-green-500" },
                        { label: "Completed", value: stats.completed, icon: Eye, color: "text-blue-500" },
                        { label: "Avg Lift", value: `${stats.avgLift.toFixed(1)}%`, icon: Trophy, color: "text-amber-500" },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className={`${cardClass} p-4`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon size={14} className={stat.color} />
                                    <span className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <p className="text-xl font-black">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Form */}
            {showCreate && (
                <div className={`${cardClass} p-6`}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Create A/B Test</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Test Name</label>
                            <input className={inputClass} placeholder="Homepage CTA Button Color" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Element (CSS selector or ID)</label>
                            <input className={inputClass} placeholder="hero-cta-button" value={form.element} onChange={(e) => setForm((f) => ({ ...f, element: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Variant A (Control)</label>
                            <textarea className={`${inputClass} min-h-[80px]`} placeholder='{"text": "Shop Now", "color": "green"}' value={form.variantA} onChange={(e) => setForm((f) => ({ ...f, variantA: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Variant B (Challenger)</label>
                            <textarea className={`${inputClass} min-h-[80px]`} placeholder='{"text": "Browse Products", "color": "blue"}' value={form.variantB} onChange={(e) => setForm((f) => ({ ...f, variantB: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Traffic Split (% to Variant A)</label>
                            <input type="number" className={inputClass} min={1} max={99} value={form.trafficSplit} onChange={(e) => setForm((f) => ({ ...f, trafficSplit: Number(e.target.value) }))} />
                            <p className="text-gray-400 text-xs mt-1">{form.trafficSplit}% to A, {100 - form.trafficSplit}% to B</p>
                        </div>
                        <div>
                            <label className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Description (optional)</label>
                            <input className={inputClass} placeholder="Testing which CTA drives more clicks" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button className={btnPrimary} disabled={saving || !form.name || !form.element || !form.variantA || !form.variantB} onClick={createTest}>
                            {saving ? "Creating..." : "Create Test"}
                        </button>
                        <button className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700" onClick={() => setShowCreate(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Tests Table */}
            <div className={cardClass}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Test</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Element</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Split</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Impressions</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Winner</th>
                                <th className="text-left p-3 text-xs text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No A/B tests yet. Create your first test above.</td></tr>
                            ) : tests.map((t) => (
                                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => fetchDetail(t.id)}>
                                    <td className="p-3">
                                        <span className="text-sm font-bold">{t.name}</span>
                                        {t.description && <p className="text-gray-500 text-xs mt-0.5">{t.description}</p>}
                                    </td>
                                    <td className="p-3 text-gray-500 text-xs font-mono">{t.element}</td>
                                    <td className="p-3"><span className={`${badgeClass} ${STATUS_STYLES[t.status] || STATUS_STYLES.draft}`}>{t.status}</span></td>
                                    <td className="p-3 text-gray-500 text-xs">{t.trafficSplit}/{100 - t.trafficSplit}</td>
                                    <td className="p-3 text-gray-500 text-xs">{t.impressionsA + t.impressionsB}</td>
                                    <td className="p-3">
                                        {t.winnerVariant ? (
                                            <span className="text-violet-600 text-xs font-bold uppercase">Variant {t.winnerVariant}</span>
                                        ) : <span className="text-gray-400 text-xs">--</span>}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            {t.status === "draft" && (
                                                <button className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs rounded hover:bg-green-200 dark:hover:bg-green-900/50" onClick={() => updateTest(t.id, { status: "running" })} title="Start">
                                                    <Play size={12} />
                                                </button>
                                            )}
                                            {t.status === "running" && (
                                                <button className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs rounded hover:bg-amber-200 dark:hover:bg-amber-900/50" onClick={() => updateTest(t.id, { status: "paused" })} title="Pause">
                                                    <Pause size={12} />
                                                </button>
                                            )}
                                            {t.status === "paused" && (
                                                <button className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs rounded hover:bg-green-200 dark:hover:bg-green-900/50" onClick={() => updateTest(t.id, { status: "running" })} title="Resume">
                                                    <Play size={12} />
                                                </button>
                                            )}
                                            <button className={btnDanger} onClick={() => deleteTest(t.id)}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Test Detail */}
            {selectedTest && (
                <div className={`${cardClass} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider">{selectedTest.name} -- Results</h3>
                        <button className="text-gray-500 text-xs hover:text-gray-700" onClick={() => setSelectedTest(null)}>Close</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Variant A */}
                        <div className={`p-4 rounded-lg border ${selectedTest.winnerVariant === "a" ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold">Variant A (Control)</span>
                                {selectedTest.winnerVariant === "a" && <Trophy size={16} className="text-violet-600" />}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs"><span className="text-gray-500">Impressions</span><span className="font-bold">{selectedTest.results?.a?.impressions || 0}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-gray-500">Conversions</span><span className="font-bold">{selectedTest.results?.a?.conversions || 0}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-gray-500">Conversion Rate</span><span className="text-violet-600 font-bold">{(selectedTest.results?.a?.conversionRate || 0).toFixed(1)}%</span></div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-violet-600 rounded-full transition-all" style={{ width: `${Math.min(selectedTest.results?.a?.conversionRate || 0, 100)}%` }} />
                                </div>
                            </div>
                            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 font-mono break-all max-h-[80px] overflow-y-auto">
                                {selectedTest.variantA}
                            </div>
                        </div>

                        {/* Variant B */}
                        <div className={`p-4 rounded-lg border ${selectedTest.winnerVariant === "b" ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold">Variant B (Challenger)</span>
                                {selectedTest.winnerVariant === "b" && <Trophy size={16} className="text-violet-600" />}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs"><span className="text-gray-500">Impressions</span><span className="font-bold">{selectedTest.results?.b?.impressions || 0}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-gray-500">Conversions</span><span className="font-bold">{selectedTest.results?.b?.conversions || 0}</span></div>
                                <div className="flex justify-between text-xs"><span className="text-gray-500">Conversion Rate</span><span className="text-blue-500 font-bold">{(selectedTest.results?.b?.conversionRate || 0).toFixed(1)}%</span></div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(selectedTest.results?.b?.conversionRate || 0, 100)}%` }} />
                                </div>
                            </div>
                            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 font-mono break-all max-h-[80px] overflow-y-auto">
                                {selectedTest.variantB}
                            </div>
                        </div>
                    </div>

                    {/* Declare Winner */}
                    {selectedTest.status === "running" && !selectedTest.winnerVariant && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 text-xs font-bold rounded hover:bg-violet-200 dark:hover:bg-violet-900/50"
                                onClick={() => updateTest(selectedTest.id, { winnerVariant: "a", status: "completed" })}>
                                Declare A Winner
                            </button>
                            <button className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-500 text-xs font-bold rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                onClick={() => updateTest(selectedTest.id, { winnerVariant: "b", status: "completed" })}>
                                Declare B Winner
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
