"use client";

/**
 * Image Processing — White backgrounds, watermarks, resize optimization.
 * Ported from mohawk-medibles2 ImageProcessingTab.tsx
 */
import { useState, useEffect, useMemo, useCallback } from "react";

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  imageCount: number;
}

type ProcessingStatus = "idle" | "processing" | "done" | "error";

export default function ImageProcessingPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [addWhiteBg, setAddWhiteBg] = useState(true);
  const [addWatermark, setAddWatermark] = useState(true);
  const [resize, setResize] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [processing, setProcessing] = useState<Map<number, ProcessingStatus>>(new Map());
  const [globalProcessing, setGlobalProcessing] = useState(false);

  const PAGE_SIZE = 20;
  const card = "bg-white/5 border border-white/10 rounded-xl";

  useEffect(() => {
    fetch("/api/admin/image-processing")
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase().trim();
    return products.filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q));
  }, [products, search]);

  const paged = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };

  const selectPage = () => {
    const pageIds = paged.map(p => p.id);
    const allSelected = pageIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const processSingle = useCallback(async (productId: number) => {
    setProcessing(prev => new Map(prev).set(productId, "processing"));
    try {
      const res = await fetch("/api/admin/image-processing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "processImages", productId, addWhiteBg, addWatermark, resize }),
      });
      const result = await res.json();
      setProcessing(prev => new Map(prev).set(productId, result.errors?.length > 0 ? "error" : "done"));
    } catch {
      setProcessing(prev => new Map(prev).set(productId, "error"));
    }
  }, [addWhiteBg, addWatermark, resize]);

  const processSelected = useCallback(async () => {
    if (selected.size === 0) return;
    setGlobalProcessing(true);
    const ids = Array.from(selected);

    for (let i = 0; i < ids.length; i += 10) {
      const batch = ids.slice(i, i + 10);
      batch.forEach(id => setProcessing(prev => new Map(prev).set(id, "processing")));
      try {
        const res = await fetch("/api/admin/image-processing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulkProcessImages", productIds: batch, addWhiteBg, addWatermark, resize }),
        });
        const data = await res.json();
        data.results?.forEach((r: any) => {
          setProcessing(prev => new Map(prev).set(r.productId, r.errors?.length > 0 ? "error" : "done"));
        });
      } catch {
        batch.forEach(id => setProcessing(prev => new Map(prev).set(id, "error")));
      }
    }
    setGlobalProcessing(false);
  }, [selected, addWhiteBg, addWatermark, resize]);

  const getStatusIndicator = (id: number) => {
    const status = processing.get(id);
    if (status === "processing") return <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
    if (status === "done") return <span className="text-green-400 text-sm">&#10003;</span>;
    if (status === "error") return <span className="text-red-400 text-sm">&#10005;</span>;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Image Processing</h1>
            <p className="text-white/60 mt-1">Add white backgrounds, watermarks, and optimize product images</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50">
              {selected.size} selected
            </span>
            <button onClick={processSelected} disabled={selected.size === 0 || globalProcessing}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
              {globalProcessing ? "Processing..." : `Process Selected (${selected.size})`}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className={`${card} p-4`}>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Processing Options</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "White Background", desc: "(flatten transparency)", checked: addWhiteBg, onChange: setAddWhiteBg },
              { label: "Watermark", desc: "(Mohawk Medibles logo)", checked: addWatermark, onChange: setAddWatermark },
              { label: "Resize to 800x800", desc: "(standardize dimensions)", checked: resize, onChange: setResize },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={opt.checked} onChange={e => opt.onChange(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500" />
                <span>{opt.label}</span>
                <span className="text-white/30 text-xs">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search & Select */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-4 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50" />
          </div>
          <button onClick={selectPage}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 transition-colors">
            {paged.every(p => selected.has(p.id)) ? "Deselect Page" : "Select Page"}
          </button>
          <button onClick={selectAll}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 transition-colors">
            {selected.size === filtered.length ? "Deselect All" : `Select All (${filtered.length})`}
          </button>
        </div>

        {/* Product List */}
        <div className={`${card} divide-y divide-white/5`}>
          {paged.map(p => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-white/30">ID: {p.id} | {p.imageCount} image{p.imageCount !== 1 ? "s" : ""}</p>
              </div>
              {getStatusIndicator(p.id)}
              <button onClick={() => processSingle(p.id)}
                disabled={processing.get(p.id) === "processing" || globalProcessing}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors disabled:opacity-50">
                {processing.get(p.id) === "processing" ? "..." : "Process"}
              </button>
            </div>
          ))}
          {paged.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">
              {search ? "No products match your search" : "No products found"}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30">
                Prev
              </button>
              <span className="text-xs px-2 text-white/40">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 transition-colors disabled:opacity-30">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className={`${card} p-4`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-xs text-white/40">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {Array.from(processing.values()).filter(s => s === "done").length}
              </p>
              <p className="text-xs text-white/40">Processed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">
                {Array.from(processing.values()).filter(s => s === "error").length}
              </p>
              <p className="text-xs text-white/40">Errors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
