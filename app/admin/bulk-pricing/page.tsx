"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, Save, Package, Percent, Search } from "lucide-react";

type Tier = { minQuantity: number; maxQuantity?: number; discountPercent: number; priceOverride?: number };

const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-white/30";

export default function BulkPricingPage() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [editingProduct, setEditingProduct] = useState<number | null>(null);
    const [currentTiers, setCurrentTiers] = useState<any[]>([]);
    const [tiers, setTiers] = useState<Tier[]>([]);
    const [saving, setSaving] = useState(false);

    // Load products
    useEffect(() => {
        fetch("/api/admin/bulk-pricing/")
            .then(r => r.json())
            .then(d => setProducts(d.products || []))
            .catch(() => {});
    }, []);

    // Load tiers when product selected
    useEffect(() => {
        if (!editingProduct) return;
        fetch(`/api/admin/bulk-pricing/?productId=${editingProduct}`)
            .then(r => r.json())
            .then(d => setCurrentTiers(d.tiers || []))
            .catch(() => {});
    }, [editingProduct]);

    const filteredProducts = products.filter((p: any) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    function selectProduct(id: number) {
        setEditingProduct(id);
        setTiers([]);
    }

    function loadExistingTiers() {
        if (currentTiers.length > 0) {
            setTiers(currentTiers.map((t: any) => ({
                minQuantity: t.minQuantity,
                maxQuantity: t.maxQuantity || undefined,
                discountPercent: Number(t.discountPercent),
                priceOverride: t.priceOverride ? Number(t.priceOverride) : undefined,
            })));
        }
    }

    function addTier() {
        const lastMax = tiers.length > 0 ? (tiers[tiers.length - 1].maxQuantity || tiers[tiers.length - 1].minQuantity + 4) : 0;
        setTiers([...tiers, { minQuantity: lastMax + 1, maxQuantity: lastMax + 10, discountPercent: 5 }]);
    }

    function updateTier(idx: number, field: keyof Tier, value: number | undefined) {
        setTiers(tiers.map((t, i) => i === idx ? { ...t, [field]: value } : t));
    }

    function removeTier(idx: number) {
        setTiers(tiers.filter((_, i) => i !== idx));
    }

    function handleSave() {
        if (!editingProduct) return;
        setSaving(true);
        fetch("/api/admin/bulk-pricing/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: editingProduct, tiers }),
        })
            .then(r => r.json())
            .then(() => {
                setSaving(false);
                // Refetch current tiers
                fetch(`/api/admin/bulk-pricing/?productId=${editingProduct}`)
                    .then(r => r.json())
                    .then(d => { setCurrentTiers(d.tiers || []); setTiers([]); });
            })
            .catch(() => setSaving(false));
    }

    function handleDeleteAll() {
        if (!editingProduct || !confirm("Remove all bulk pricing?")) return;
        fetch(`/api/admin/bulk-pricing/?productId=${editingProduct}`, { method: "DELETE" })
            .then(() => { setCurrentTiers([]); setTiers([]); });
    }

    const selectedProduct = products.find((p: any) => p.id === editingProduct);

    return (
        <div className="space-y-6">
            {/* Info Header */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Package size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Bulk Pricing Manager</h1>
                        <p className="text-zinc-500 text-sm">Set quantity-based discount tiers for any product. Customers buying in bulk automatically get better prices.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selector */}
                <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-4">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Select Product</h4>
                    <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input className={`${inputClass} pl-9`} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto space-y-1">
                        {filteredProducts.slice(0, 50).map((p: any) => (
                            <button key={p.id} onClick={() => selectProduct(p.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                                    editingProduct === p.id
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <span className="font-bold">{p.name}</span>
                                <span className="text-zinc-500 ml-2">${Number(p.price || 0).toFixed(2)}</span>
                            </button>
                        ))}
                        {filteredProducts.length === 0 && <p className="text-zinc-500 text-xs text-center py-4">No products found</p>}
                    </div>
                </div>

                {/* Tier Editor */}
                <div className="lg:col-span-2">
                    {editingProduct ? (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-bold">{selectedProduct?.name || `Product #${editingProduct}`}</h4>
                                    <p className="text-zinc-500 text-xs">Base price: ${Number(selectedProduct?.price || 0).toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                    {currentTiers.length > 0 && tiers.length === 0 && (
                                        <button className="px-3 py-1.5 border border-white/10 text-zinc-400 text-xs rounded-lg hover:bg-white/5 transition-colors"
                                            onClick={loadExistingTiers}>Load Existing Tiers</button>
                                    )}
                                    <button className="px-3 py-1.5 border border-green-500/30 text-green-400 text-xs rounded-lg hover:bg-green-500/10 transition-colors"
                                        onClick={addTier}><Plus size={12} className="inline mr-1" />Add Tier</button>
                                </div>
                            </div>

                            {/* Current Tiers Display */}
                            {currentTiers.length > 0 && tiers.length === 0 && (
                                <div className="mb-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Current Active Tiers</p>
                                    <div className="space-y-1">
                                        {currentTiers.map((t: any, i: number) => (
                                            <div key={i} className="flex items-center gap-3 text-xs">
                                                <span>{t.minQuantity}{t.maxQuantity ? `-${t.maxQuantity}` : "+"} units</span>
                                                <span className="text-green-400 font-bold">{Number(t.discountPercent)}% off</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="px-3 py-1.5 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/10 transition-colors mt-3"
                                        onClick={handleDeleteAll}>
                                        <Trash2 size={12} className="inline mr-1" />Remove All Tiers
                                    </button>
                                </div>
                            )}

                            {/* Tier Editor */}
                            {tiers.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-5 gap-2 text-xs text-zinc-500 uppercase tracking-wider px-1">
                                        <span>Min Qty</span><span>Max Qty</span><span>Discount %</span><span>Price Override</span><span></span>
                                    </div>
                                    {tiers.map((tier, idx) => (
                                        <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                                            <input type="number" className={inputClass} value={tier.minQuantity}
                                                onChange={e => updateTier(idx, "minQuantity", Number(e.target.value))} />
                                            <input type="number" className={inputClass} value={tier.maxQuantity || ""} placeholder="\u221e"
                                                onChange={e => updateTier(idx, "maxQuantity", e.target.value ? Number(e.target.value) : undefined)} />
                                            <div className="relative">
                                                <input type="number" className={`${inputClass} pr-7`} value={tier.discountPercent}
                                                    onChange={e => updateTier(idx, "discountPercent", Number(e.target.value))} />
                                                <Percent size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            </div>
                                            <div className="relative">
                                                <input type="number" className={`${inputClass} pl-6`} value={tier.priceOverride || ""} placeholder="Auto"
                                                    onChange={e => updateTier(idx, "priceOverride", e.target.value ? Number(e.target.value) : undefined)} />
                                                <DollarSign size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            </div>
                                            <button className="text-red-400 hover:text-red-300 p-2" onClick={() => removeTier(idx)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Preview */}
                                    <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Price Preview</p>
                                        <div className="space-y-1">
                                            {tiers.map((tier, i) => {
                                                const basePrice = Number(selectedProduct?.price || 0);
                                                const discountedPrice = tier.priceOverride || (basePrice * (1 - tier.discountPercent / 100));
                                                return (
                                                    <div key={i} className="flex items-center gap-3 text-xs">
                                                        <span>{tier.minQuantity}{tier.maxQuantity ? `-${tier.maxQuantity}` : "+"} units</span>
                                                        <span className="text-zinc-500 line-through">${basePrice.toFixed(2)}</span>
                                                        <span className="text-green-400 font-bold">${discountedPrice.toFixed(2)}/unit</span>
                                                        <span className="text-emerald-400">({tier.discountPercent}% off)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                            disabled={saving} onClick={handleSave}>
                                            <Save size={12} className="inline mr-1" />{saving ? "Saving..." : "Save Tiers"}
                                        </button>
                                        <button className="px-4 py-2 text-zinc-500 text-sm hover:text-white transition-colors" onClick={() => setTiers([])}>Cancel</button>
                                    </div>
                                </div>
                            ) : tiers.length === 0 && currentTiers.length === 0 && (
                                <div className="text-center py-8">
                                    <Package size={32} className="mx-auto text-zinc-600 mb-3" />
                                    <p className="text-zinc-500 text-sm mb-3">No bulk pricing tiers set for this product</p>
                                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors" onClick={addTier}>
                                        <Plus size={12} className="inline mr-1" />Add First Tier
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-12 text-center">
                            <DollarSign size={40} className="mx-auto text-zinc-600 mb-3" />
                            <p className="text-zinc-500 text-sm">Select a product from the left to manage its bulk pricing tiers</p>
                        </div>
                    )}
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#0f0f18] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3">How Bulk Pricing Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { title: "Set Quantity Tiers", desc: "Define price breaks at different quantities. E.g., 5-9 units = 10% off, 10+ units = 20% off." },
                        { title: "Automatic Discounts", desc: "When a customer adds enough quantity, the discount applies automatically at checkout." },
                        { title: "Price Override", desc: "Optionally set a fixed price per unit instead of a percentage discount for precise control." },
                    ].map((step, i) => (
                        <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                <p className="text-sm font-bold">{step.title}</p>
                            </div>
                            <p className="text-zinc-500 text-xs">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
