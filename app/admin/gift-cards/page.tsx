"use client";

import { useState, useEffect } from "react";
import { Gift, Plus, Search, Ban, DollarSign, CreditCard, TrendingUp, Copy } from "lucide-react";

const DESIGNS = [
    { id: "classic", label: "Classic Green", color: "bg-green-500/20 border-green-500/30" },
    { id: "birthday", label: "Birthday", color: "bg-pink-500/20 border-pink-500/30" },
    { id: "holiday", label: "Holiday", color: "bg-red-500/20 border-red-500/30" },
    { id: "thankyou", label: "Thank You", color: "bg-blue-500/20 border-blue-500/30" },
    { id: "custom", label: "Custom", color: "bg-purple-500/20 border-purple-500/30" },
];

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white/30";

interface GiftCardData {
    cards: any[];
    stats: { totalCards: number; activeCount: number; totalValue: number; totalRedeemed: number };
}

export default function GiftCardsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState("");
    const [data, setData] = useState<GiftCardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        amount: "25",
        recipientEmail: "",
        recipientName: "",
        senderName: "",
        message: "",
        design: "classic",
    });

    const fetchData = () => {
        fetch("/api/admin/gift-cards/")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    function resetForm() {
        setCreateForm({ amount: "25", recipientEmail: "", recipientName: "", senderName: "", message: "", design: "classic" });
    }

    function handleCreate() {
        setCreating(true);
        fetch("/api/admin/gift-cards/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: Number(createForm.amount),
                recipientEmail: createForm.recipientEmail || undefined,
                recipientName: createForm.recipientName || undefined,
                senderName: createForm.senderName || undefined,
                design: createForm.design,
            }),
        })
            .then(r => r.json())
            .then(() => { setCreating(false); setShowCreate(false); resetForm(); fetchData(); })
            .catch(() => setCreating(false));
    }

    function handleDisable(id: number) {
        fetch("/api/admin/gift-cards/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
            .then(() => fetchData());
    }

    const cards = data?.cards || [];
    const stats = data?.stats;

    const filteredCards = cards.filter((c: any) =>
        c.code?.toLowerCase().includes(search.toLowerCase()) ||
        c.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
        c.recipientName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gift Cards</h1>
                    <p className="text-white/60 mt-1">Issue, track, and manage gift cards</p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    {showCreate ? "Cancel" : <><Plus size={14} className="inline mr-1" /> Issue Gift Card</>}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Cards", value: stats?.totalCards || 0, icon: Gift, gradient: "from-green-500 to-emerald-600" },
                    { label: "Active Cards", value: stats?.activeCount || 0, icon: CreditCard, gradient: "from-blue-500 to-indigo-600" },
                    { label: "Total Value", value: `$${Number(stats?.totalValue || 0).toFixed(2)}`, icon: DollarSign, gradient: "from-amber-500 to-orange-600" },
                    { label: "Redeemed", value: `$${Number(stats?.totalRedeemed || 0).toFixed(2)}`, icon: TrendingUp, gradient: "from-purple-500 to-violet-600" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input className={`${inputClass} pl-9`} placeholder="Search by code, email, name..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6 mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Create New Gift Card</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Amount ($)</label>
                            <select className={inputClass} value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))}>
                                {["10", "25", "50", "75", "100", "150", "200", "250", "500"].map(v => (
                                    <option key={v} value={v}>${v}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Design</label>
                            <div className="flex gap-2 flex-wrap">
                                {DESIGNS.map(d => (
                                    <button key={d.id} onClick={() => setCreateForm(f => ({ ...f, design: d.id }))}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                            createForm.design === d.id ? d.color + " text-white" : "border-white/10 text-zinc-500 hover:text-white"
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Recipient Email</label>
                            <input className={inputClass} placeholder="recipient@email.com" value={createForm.recipientEmail} onChange={e => setCreateForm(f => ({ ...f, recipientEmail: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Recipient Name</label>
                            <input className={inputClass} placeholder="John Doe" value={createForm.recipientName} onChange={e => setCreateForm(f => ({ ...f, recipientName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Sender Name</label>
                            <input className={inputClass} placeholder="Admin" value={createForm.senderName} onChange={e => setCreateForm(f => ({ ...f, senderName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Message (optional)</label>
                            <input className={inputClass} placeholder="Enjoy your gift!" value={createForm.message} onChange={e => setCreateForm(f => ({ ...f, message: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            disabled={creating} onClick={handleCreate}>
                            {creating ? "Creating..." : "Create Gift Card"}
                        </button>
                        <button className="px-4 py-2 text-zinc-500 text-sm hover:text-white transition-colors" onClick={() => setShowCreate(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Cards Table */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase">
                                <th className="text-left pb-3 pt-4 pl-6">Code</th>
                                <th className="text-left pb-3 pt-4">Amount</th>
                                <th className="text-left pb-3 pt-4">Balance</th>
                                <th className="text-left pb-3 pt-4">Recipient</th>
                                <th className="text-left pb-3 pt-4">Design</th>
                                <th className="text-left pb-3 pt-4">Status</th>
                                <th className="text-left pb-3 pt-4">Created</th>
                                <th className="text-right pb-3 pt-4 pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent mx-auto" />
                                </td></tr>
                            ) : filteredCards.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-zinc-500">No gift cards found</td></tr>
                            ) : filteredCards.map((card: any) => (
                                <tr key={card.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-3 pl-6">
                                        <div className="flex items-center gap-2">
                                            <code className="text-green-400 font-mono text-xs">{card.code}</code>
                                            <button onClick={() => navigator.clipboard.writeText(card.code)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-3 font-bold text-sm">${Number(card.originalAmount || card.amount).toFixed(2)}</td>
                                    <td className="py-3 text-green-400 font-bold text-sm">${Number(card.balance || card.amount).toFixed(2)}</td>
                                    <td className="py-3">
                                        <div>
                                            <span className="text-xs">{card.recipientName || "\u2014"}</span>
                                            {card.recipientEmail && <span className="text-zinc-500 text-xs block">{card.recipientEmail}</span>}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        {DESIGNS.find(d => d.id === card.design) ? (
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${DESIGNS.find(d => d.id === card.design)?.color}`}>
                                                {DESIGNS.find(d => d.id === card.design)?.label}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500 text-xs">{card.design || "classic"}</span>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase border ${
                                            card.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"
                                        }`}>
                                            {card.isActive ? "active" : "disabled"}
                                        </span>
                                    </td>
                                    <td className="py-3 text-zinc-500 text-xs">{card.createdAt ? new Date(card.createdAt).toLocaleDateString() : "\u2014"}</td>
                                    <td className="py-3 text-right pr-6">
                                        {card.isActive && (
                                            <button className="px-3 py-1.5 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-colors"
                                                onClick={() => handleDisable(card.id)}>
                                                <Ban size={12} className="inline mr-1" /> Disable
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
