"use client";

import { useState, useEffect } from "react";
import { Trophy, Plus, Trash2, GripVertical, Save, RotateCcw, Sparkles } from "lucide-react";

interface TierData {
    name: string;
    minReferrals: number;
    multiplier: number;
    icon: string;
    color: string;
    bgColor: string;
    perks: string[];
}

const PRESET_ICONS = ["\ud83e\udd49", "\ud83e\udd48", "\ud83e\udd47", "\ud83d\udc8e", "\ud83d\udc51", "\u2b50", "\ud83d\udd25", "\ud83c\udfc6", "\ud83d\udcab", "\ud83c\udf1f", "\ud83c\udfaf", "\ud83d\udcaa"];

const DEFAULT_NEW_TIER: TierData = {
    name: "New Tier",
    minReferrals: 0,
    multiplier: 1.0,
    icon: "\u2b50",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.15)",
    perks: ["Base bonus"],
};

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-all";

export default function ReferralTiersPage() {
    const [editTiers, setEditTiers] = useState<TierData[]>([]);
    const [initialized, setInitialized] = useState(false);
    const [expandedTier, setExpandedTier] = useState<number | null>(null);
    const [newPerkInputs, setNewPerkInputs] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/referral-tiers/")
            .then(r => r.json())
            .then(tiers => {
                setEditTiers(tiers.map((t: any) => ({
                    name: t.name,
                    minReferrals: t.minReferrals,
                    multiplier: t.multiplier,
                    icon: t.icon,
                    color: t.color,
                    bgColor: t.bgColor,
                    perks: [...(t.perks || [])],
                })));
                setInitialized(true);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const updateTier = (idx: number, field: keyof TierData, value: any) => {
        setEditTiers(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const addTier = () => {
        const lastTier = editTiers[editTiers.length - 1];
        const newTier: TierData = {
            ...DEFAULT_NEW_TIER,
            minReferrals: lastTier ? lastTier.minReferrals + 5 : 0,
            multiplier: lastTier ? Math.round((lastTier.multiplier + 0.5) * 10) / 10 : 1.0,
        };
        setEditTiers(prev => [...prev, newTier]);
        setExpandedTier(editTiers.length);
    };

    const removeTier = (idx: number) => {
        if (editTiers.length <= 1) return;
        setEditTiers(prev => prev.filter((_, i) => i !== idx));
        if (expandedTier === idx) setExpandedTier(null);
        else if (expandedTier !== null && expandedTier > idx) setExpandedTier(expandedTier - 1);
    };

    const addPerk = (tierIdx: number) => {
        const perk = newPerkInputs[tierIdx]?.trim();
        if (!perk) return;
        setEditTiers(prev => {
            const next = [...prev];
            next[tierIdx] = { ...next[tierIdx], perks: [...next[tierIdx].perks, perk] };
            return next;
        });
        setNewPerkInputs(prev => ({ ...prev, [tierIdx]: "" }));
    };

    const removePerk = (tierIdx: number, perkIdx: number) => {
        setEditTiers(prev => {
            const next = [...prev];
            next[tierIdx] = { ...next[tierIdx], perks: next[tierIdx].perks.filter((_, i) => i !== perkIdx) };
            return next;
        });
    };

    const resetToDefaults = () => {
        setInitialized(false);
        setLoading(true);
        fetch("/api/admin/referral-tiers/")
            .then(r => r.json())
            .then(tiers => {
                setEditTiers(tiers.map((t: any) => ({ ...t, perks: [...(t.perks || [])] })));
                setInitialized(true);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleSave = () => {
        if (editTiers.length > 0 && editTiers[0].minReferrals !== 0) return;
        for (let i = 1; i < editTiers.length; i++) {
            if (editTiers[i].minReferrals <= editTiers[i - 1].minReferrals) return;
        }
        setSaving(true);
        fetch("/api/admin/referral-tiers/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editTiers),
        })
            .then(r => r.json())
            .then(() => setSaving(false))
            .catch(() => setSaving(false));
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Trophy className="w-7 h-7 text-green-400" />
                        Referral Tier Management
                    </h1>
                    <p className="text-white/60 mt-1">Customize reward tiers, multipliers, and perks for your referral program</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={resetToDefaults} className="px-4 py-2 border border-white/10 text-zinc-400 text-sm rounded-lg hover:bg-white/5 transition-colors">
                        <RotateCcw className="w-4 h-4 inline mr-1" /> Reset
                    </button>
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <Save className="w-4 h-4 inline mr-1" />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {/* Tier Preview Bar */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-3">Tier Progression Preview</p>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {editTiers.map((tier, idx) => (
                        <div key={idx} className="flex items-center">
                            <div
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium whitespace-nowrap cursor-pointer transition-all hover:scale-105"
                                style={{ borderColor: tier.color + "60", backgroundColor: tier.bgColor, color: tier.color }}
                                onClick={() => setExpandedTier(expandedTier === idx ? null : idx)}
                            >
                                <span className="text-lg">{tier.icon}</span>
                                <span>{tier.name}</span>
                                <span className="text-xs opacity-70">{tier.multiplier}x</span>
                            </div>
                            {idx < editTiers.length - 1 && <div className="mx-1 text-zinc-600 text-xs">&rarr;</div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tier Cards */}
            <div className="space-y-3">
                {editTiers.map((tier, idx) => (
                    <div
                        key={idx}
                        className={`bg-[#0f0f18] rounded-2xl border transition-all ${
                            expandedTier === idx ? "border-green-500/30 shadow-lg shadow-green-500/5" : "border-white/5 hover:border-white/10"
                        }`}
                    >
                        {/* Summary Row */}
                        <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedTier(expandedTier === idx ? null : idx)}>
                            <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: tier.bgColor }}>
                                {tier.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{tier.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: tier.bgColor, color: tier.color }}>
                                        {tier.multiplier}x bonus
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {idx === 0 ? "Starting tier" : `Unlocks at ${tier.minReferrals} referrals`}
                                    {" \u00b7 "}{tier.perks.length} perk{tier.perks.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); removeTier(idx); }}
                                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Expanded Edit Form */}
                        {expandedTier === idx && (
                            <div className="border-t border-white/5 p-4 space-y-4 bg-white/[0.02]">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1 font-medium">Tier Name</label>
                                        <input type="text" className={inputClass} value={tier.name} onChange={e => updateTier(idx, "name", e.target.value)} placeholder="e.g. Gold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1 font-medium">Icon</label>
                                        <div className="flex gap-1 flex-wrap">
                                            {PRESET_ICONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    onClick={() => updateTier(idx, "icon", icon)}
                                                    className={`w-8 h-8 rounded-md text-lg flex items-center justify-center transition-all ${
                                                        tier.icon === icon ? "bg-green-500/20 ring-2 ring-green-400" : "bg-white/5 border border-white/10 hover:bg-white/10"
                                                    }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1 font-medium">Badge Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={tier.color}
                                                onChange={e => {
                                                    const hex = e.target.value;
                                                    updateTier(idx, "color", hex);
                                                    const r = parseInt(hex.slice(1, 3), 16);
                                                    const g = parseInt(hex.slice(3, 5), 16);
                                                    const b = parseInt(hex.slice(5, 7), 16);
                                                    updateTier(idx, "bgColor", `rgba(${r}, ${g}, ${b}, 0.15)`);
                                                }}
                                                className="w-10 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                                            />
                                            <input type="text" className={inputClass} value={tier.color} onChange={e => updateTier(idx, "color", e.target.value)} placeholder="#FFD700" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1 font-medium">Preview</label>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: tier.color + "60", backgroundColor: tier.bgColor, color: tier.color }}>
                                            <span className="text-lg">{tier.icon}</span>
                                            <span>{tier.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1 font-medium">Min. Referrals Required</label>
                                        <input
                                            type="number" className={inputClass} value={tier.minReferrals}
                                            onChange={e => updateTier(idx, "minReferrals", parseInt(e.target.value) || 0)}
                                            min={idx === 0 ? 0 : 1} disabled={idx === 0}
                                        />
                                        {idx === 0 && <p className="text-xs text-zinc-600 mt-1">First tier always starts at 0</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1 font-medium">Bonus Multiplier</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" className={inputClass} value={tier.multiplier} onChange={e => updateTier(idx, "multiplier", parseFloat(e.target.value) || 1)} min={0.1} max={10} step={0.1} />
                                            <span className="text-sm text-zinc-500 whitespace-nowrap">= {Math.round(100 * tier.multiplier)}% of base</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-zinc-500 mb-2 font-medium flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Perks & Benefits
                                    </label>
                                    <div className="space-y-2">
                                        {tier.perks.map((perk, perkIdx) => (
                                            <div key={perkIdx} className="flex items-center gap-2">
                                                <span className="text-green-400 text-sm">&check;</span>
                                                <input type="text" className={`${inputClass} flex-1`} value={perk}
                                                    onChange={e => {
                                                        const newPerks = [...tier.perks];
                                                        newPerks[perkIdx] = e.target.value;
                                                        updateTier(idx, "perks", newPerks);
                                                    }}
                                                />
                                                <button onClick={() => removePerk(idx, perkIdx)} className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-600 text-sm">+</span>
                                            <input type="text" className={`${inputClass} flex-1`} placeholder="Add a new perk..."
                                                value={newPerkInputs[idx] || ""}
                                                onChange={e => setNewPerkInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPerk(idx); } }}
                                            />
                                            <button onClick={() => addPerk(idx)} className="px-3 py-2 text-xs bg-white/5 text-zinc-400 rounded-lg hover:bg-white/10 transition-all font-medium">Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Tier */}
            <button
                onClick={addTier}
                className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-zinc-500 hover:border-green-500/40 hover:text-green-400 hover:bg-green-500/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Plus className="w-4 h-4" /> Add New Tier
            </button>

            {/* Info */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4">
                <h4 className="text-sm font-bold text-green-400 mb-2">How Tier Bonuses Work</h4>
                <ul className="text-xs text-green-300/70 space-y-1">
                    <li>When a referral is completed, the referrer&apos;s bonus points are multiplied by their current tier multiplier</li>
                    <li>Example: If base bonus is 100 pts and referrer is Gold (2x), they earn 200 pts</li>
                    <li>Tiers are determined by the total number of completed referrals</li>
                    <li>Changes to tiers apply immediately to all future referral completions</li>
                </ul>
            </div>
        </div>
    );
}
