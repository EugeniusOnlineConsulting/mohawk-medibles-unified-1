"use client";

/**
 * Bulk Image Upload — Upload ZIP of product images with fuzzy folder matching.
 * Ported from mohawk-medibles2 BulkImagesTab.tsx
 */
import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";

// ---- Types ------------------------------------------------------------------

interface ProductMatch {
  id: number;
  name: string;
  slug: string;
  imageCount: number;
}

interface FolderMapping {
  folderName: string;
  files: { name: string; data: ArrayBuffer; type: string }[];
  matchedProduct: ProductMatch | null;
  matchScore: number;
  status: "pending" | "uploading" | "done" | "error" | "skipped";
  uploadedCount: number;
  errorMessage?: string;
}

// ---- Fuzzy matching ---------------------------------------------------------

function normalizeStr(s: string): string {
  return s.toLowerCase().replace(/[-_\s]+/g, " ").replace(/[^a-z0-9 ]/g, "").trim();
}

function matchScore(folderName: string, product: ProductMatch): number {
  const normFolder = normalizeStr(folderName);
  const normName = normalizeStr(product.name);
  const normSlug = normalizeStr(product.slug);

  if (normFolder === normSlug) return 100;
  if (normFolder === normName) return 95;
  if (normSlug.includes(normFolder) || normFolder.includes(normSlug)) return 80;
  if (normName.includes(normFolder) || normFolder.includes(normName)) return 75;

  const folderWords = normFolder.split(" ").filter(w => w.length > 1);
  const nameWords = normName.split(" ").filter(w => w.length > 1);
  if (folderWords.length === 0 || nameWords.length === 0) return 0;

  let matchedWords = 0;
  for (const fw of folderWords) {
    if (nameWords.some(nw => nw.includes(fw) || fw.includes(nw))) matchedWords++;
  }
  return Math.round((matchedWords / Math.max(folderWords.length, nameWords.length)) * 70);
}

function findBestMatch(folderName: string, products: ProductMatch[]): { product: ProductMatch | null; score: number } {
  let best: ProductMatch | null = null;
  let bestScore = 0;
  for (const p of products) {
    const s = matchScore(folderName, p);
    if (s > bestScore) { bestScore = s; best = p; }
  }
  return { product: bestScore >= 40 ? best : null, score: bestScore };
}

// ---- Image utils ------------------------------------------------------------

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp", "tiff"]);
function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has((filename.split(".").pop() || "").toLowerCase());
}
function getContentType(filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    webp: "image/webp", gif: "image/gif", avif: "image/avif",
    bmp: "image/bmp", tiff: "image/tiff",
  };
  return types[ext] || "image/jpeg";
}

// ---- Main Page --------------------------------------------------------------

export default function BulkImagesPage() {
  const [step, setStep] = useState<"upload" | "review" | "progress" | "done">("upload");
  const [mappings, setMappings] = useState<FolderMapping[]>([]);
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [totalImages, setTotalImages] = useState(0);
  const [uploadedImages, setUploadedImages] = useState(0);
  const [failedImages, setFailedImages] = useState(0);
  const [products, setProducts] = useState<ProductMatch[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [assigningFolder, setAssigningFolder] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  const card = "bg-white/5 border border-white/10 rounded-xl";

  // Load products
  useEffect(() => {
    fetch("/api/admin/bulk-images?action=productList")
      .then(r => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  // ---- ZIP Processing -------------------------------------------------------
  const handleZipUpload = useCallback(async (file: File) => {
    if (!products.length) return;
    setIsProcessing(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);
      const folders = new Map<string, { name: string; data: ArrayBuffer; type: string }[]>();

      for (const [path, entry] of Object.entries(zip.files)) {
        if (entry.dir || !isImageFile(path)) continue;
        const parts = path.split("/").filter(p => p);
        let folderName: string, fileName: string;
        if (parts.length >= 2) {
          folderName = parts[0];
          fileName = parts[parts.length - 1];
        } else {
          fileName = parts[0];
          folderName = fileName.replace(/\.[^.]+$/, "");
        }
        if (!folders.has(folderName)) folders.set(folderName, []);
        const data = await entry.async("arraybuffer");
        folders.get(folderName)!.push({ name: fileName, data, type: getContentType(fileName) });
      }

      if (folders.size === 0) {
        setIsProcessing(false);
        return;
      }

      const newMappings: FolderMapping[] = [];
      let imgCount = 0;
      for (const [folderName, files] of folders) {
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        const { product, score } = findBestMatch(folderName, products);
        imgCount += files.length;
        newMappings.push({ folderName, files, matchedProduct: product, matchScore: score, status: "pending", uploadedCount: 0 });
      }
      newMappings.sort((a, b) => {
        if (a.matchedProduct && !b.matchedProduct) return -1;
        if (!a.matchedProduct && b.matchedProduct) return 1;
        return b.matchScore - a.matchScore;
      });

      setMappings(newMappings);
      setTotalImages(imgCount);
      setUploadedImages(0);
      setFailedImages(0);
      setStep("review");
    } catch (err: any) {
      console.error("ZIP processing failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [products]);

  const assignProduct = useCallback((folderName: string, product: ProductMatch | null) => {
    setMappings(prev => prev.map(m =>
      m.folderName === folderName ? { ...m, matchedProduct: product, matchScore: product ? 100 : 0 } : m
    ));
  }, []);

  const skipFolder = useCallback((folderName: string) => {
    setMappings(prev => prev.map(m => m.folderName === folderName ? { ...m, status: "skipped" } : m));
  }, []);

  const unskipFolder = useCallback((folderName: string) => {
    setMappings(prev => prev.map(m => m.folderName === folderName ? { ...m, status: "pending" } : m));
  }, []);

  // ---- Upload Execution -----------------------------------------------------
  const startUpload = useCallback(async () => {
    const toUpload = mappings.filter(m => m.matchedProduct && m.status !== "skipped");
    if (toUpload.length === 0) return;
    setStep("progress");
    setIsProcessing(true);
    pauseRef.current = false;
    abortRef.current = false;
    let uploaded = 0, failed = 0;

    for (let i = 0; i < mappings.length; i++) {
      if (abortRef.current) break;
      const mapping = mappings[i];
      if (!mapping.matchedProduct || mapping.status === "skipped") continue;

      while (pauseRef.current && !abortRef.current) await new Promise(r => setTimeout(r, 500));
      if (abortRef.current) break;

      setMappings(prev => prev.map((m, idx) => idx === i ? { ...m, status: "uploading" } : m));

      try {
        if (mode === "replace") {
          await fetch("/api/admin/bulk-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "clearImages", productId: mapping.matchedProduct.id }),
          });
        }

        for (let j = 0; j < mapping.files.length; j++) {
          if (abortRef.current) break;
          while (pauseRef.current && !abortRef.current) await new Promise(r => setTimeout(r, 500));
          if (abortRef.current) break;

          const file = mapping.files[j];
          const base64 = btoa(new Uint8Array(file.data).reduce((data, byte) => data + String.fromCharCode(byte), ""));

          try {
            await fetch("/api/admin/bulk-images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "uploadImage",
                productId: mapping.matchedProduct!.id,
                base64,
                filename: file.name,
                contentType: file.type,
              }),
            });
            uploaded++;
            setUploadedImages(uploaded);
            setMappings(prev => prev.map((m, idx) => idx === i ? { ...m, uploadedCount: j + 1 } : m));
          } catch {
            failed++;
            setFailedImages(failed);
          }
        }
        setMappings(prev => prev.map((m, idx) => idx === i ? { ...m, status: "done" } : m));
      } catch (err: any) {
        failed += mapping.files.length;
        setFailedImages(failed);
        setMappings(prev => prev.map((m, idx) => idx === i ? { ...m, status: "error", errorMessage: err.message } : m));
      }
    }

    setIsProcessing(false);
    setStep("done");
  }, [mappings, mode]);

  // ---- Derived state --------------------------------------------------------
  const filteredMappings = useMemo(() => {
    if (!searchFilter) return mappings;
    const q = searchFilter.toLowerCase();
    return mappings.filter(m =>
      m.folderName.toLowerCase().includes(q) ||
      m.matchedProduct?.name.toLowerCase().includes(q) ||
      m.matchedProduct?.slug.toLowerCase().includes(q)
    );
  }, [mappings, searchFilter]);

  const stats = useMemo(() => ({
    matched: mappings.filter(m => m.matchedProduct && m.status !== "skipped").length,
    unmatched: mappings.filter(m => !m.matchedProduct && m.status !== "skipped").length,
    skipped: mappings.filter(m => m.status === "skipped").length,
    done: mappings.filter(m => m.status === "done").length,
    errors: mappings.filter(m => m.status === "error").length,
    total: mappings.length,
  }), [mappings]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
  }, [products, productSearch]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".zip") || file.type === "application/zip" || file.type === "application/x-zip-compressed")) {
      handleZipUpload(file);
    }
  }, [handleZipUpload]);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleZipUpload(file);
    e.target.value = "";
  }, [handleZipUpload]);

  // ---- CSV Download ---------------------------------------------------------
  const downloadCsvTemplate = useCallback(() => {
    window.open("/api/admin/bulk-images?action=csvTemplate", "_blank");
  }, []);

  // ===========================================================================
  // STEP 1: Upload ZIP
  // ===========================================================================
  if (step === "upload") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Bulk Image Upload</h1>
            <p className="text-white/60 mt-1">
              Upload a ZIP file containing product images organized in folders. Each folder name should match a product name or slug.
            </p>
          </div>

          {/* Instructions */}
          <div className={`${card} p-5`}>
            <h3 className="text-sm font-bold mb-3">ZIP File Structure</h3>
            <div className="bg-white/5 rounded-lg p-4 font-mono text-xs text-white/50 space-y-1">
              <p className="text-white/30">product-images.zip</p>
              <p className="ml-4"><span className="text-violet-400">moroccan-love-hash/</span></p>
              <p className="ml-8">image-1.jpg</p>
              <p className="ml-8">image-2.jpg</p>
              <p className="ml-4"><span className="text-violet-400">pink-kush-aaaa/</span></p>
              <p className="ml-8">front.png</p>
              <p className="ml-8">detail.png</p>
            </div>
            <p className="text-xs text-white/30 mt-3">
              Folder names are matched to products by name or slug using fuzzy matching. You can manually reassign any unmatched folders in the next step.
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`${card} p-10 text-center cursor-pointer transition-all border-2 border-dashed ${
              isDragging ? "border-violet-500 bg-violet-500/10" : "border-white/20 hover:border-violet-500/50 hover:bg-white/5"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">Extracting ZIP file...</p>
                <p className="text-xs text-white/40">This may take a moment for large files.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center text-3xl text-violet-400">
                  &#128230;
                </div>
                <p className="text-sm font-bold">{isDragging ? "Drop your ZIP file here" : "Drag & drop a ZIP file here"}</p>
                <p className="text-xs text-white/40">or click to browse. Supports .zip files up to 500MB</p>
                <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Choose ZIP File
                </button>
              </div>
            )}
          </div>

          {/* Mode Selection */}
          <div className={`${card} p-5`}>
            <h3 className="text-sm font-bold mb-3">Upload Mode</h3>
            <div className="flex gap-3">
              <button onClick={() => setMode("append")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                  mode === "append" ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/20"
                }`}>
                <p className="text-sm font-bold">Append</p>
                <p className="text-xs text-white/40 mt-0.5">Add new images to existing product images</p>
              </button>
              <button onClick={() => setMode("replace")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
                  mode === "replace" ? "border-red-500 bg-red-500/10" : "border-white/10 hover:border-white/20"
                }`}>
                <p className="text-sm font-bold">Replace</p>
                <p className="text-xs text-white/40 mt-0.5">Remove existing images and replace with new ones</p>
              </button>
            </div>
          </div>

          {/* CSV Template */}
          <div className={`${card} p-5`}>
            <h3 className="text-sm font-bold mb-2">Product Reference</h3>
            <p className="text-xs text-white/40 mb-3">
              Download a CSV with all product IDs, names, and slugs to help you organize your image folders.
            </p>
            <button onClick={downloadCsvTemplate}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
              Download Product CSV
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STEP 2: Review Mappings
  // ===========================================================================
  if (step === "review") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Review Folder Mappings</h1>
              <p className="text-sm text-white/50 mt-0.5">
                {stats.matched} matched, {stats.unmatched} unmatched, {stats.skipped} skipped of {stats.total} folders
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep("upload"); setMappings([]); }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
                Start Over
              </button>
              <button onClick={startUpload} disabled={stats.matched === 0}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                Start Upload ({stats.matched} folders)
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Folders", value: stats.total, color: "text-white" },
              { label: "Matched", value: stats.matched, color: "text-green-400" },
              { label: "Unmatched", value: stats.unmatched, color: "text-amber-400" },
              { label: "Total Images", value: totalImages, color: "text-violet-400" },
            ].map(s => (
              <div key={s.label} className={`${card} p-3`}>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Mode badge */}
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${
            mode === "append" ? "bg-violet-500/20 text-violet-400" : "bg-red-500/20 text-red-400"
          }`}>
            {mode === "append" ? "Append Mode" : "Replace Mode"}
          </span>

          {/* Search */}
          <input value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search folders or products..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50" />

          {/* Mapping List */}
          <div className="space-y-2">
            {filteredMappings.map((mapping) => (
              <div key={mapping.folderName}
                className={`${card} transition-all ${mapping.status === "skipped" ? "opacity-50" : ""}`}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-sm">&#128193;</span>
                        <span className="text-sm font-semibold truncate">{mapping.folderName}</span>
                        <span className="text-xs text-white/30 shrink-0">{mapping.files.length} images</span>
                      </div>
                    </div>
                    <span className="text-white/20">&#8594;</span>
                    <div className="flex-1 min-w-0">
                      {mapping.matchedProduct ? (
                        <div className="flex items-center gap-2">
                          <span className="text-violet-400 text-sm">&#128230;</span>
                          <span className="text-sm font-medium truncate">{mapping.matchedProduct.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            mapping.matchScore >= 80 ? "bg-green-500/20 text-green-400" :
                            mapping.matchScore >= 60 ? "bg-amber-500/20 text-amber-400" :
                            "bg-orange-500/20 text-orange-400"
                          }`}>{mapping.matchScore}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-amber-400 font-medium">No match found</span>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setAssigningFolder(assigningFolder === mapping.folderName ? null : mapping.folderName); setProductSearch(""); }}
                        className="p-2 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-colors" title="Assign product">
                        &#128269;
                      </button>
                      <button onClick={() => {
                        const expanded = new Set(expandedFolders);
                        if (expanded.has(mapping.folderName)) expanded.delete(mapping.folderName);
                        else expanded.add(mapping.folderName);
                        setExpandedFolders(expanded);
                      }} className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors" title="Preview">
                        &#128065;
                      </button>
                      {mapping.status === "skipped" ? (
                        <button onClick={() => unskipFolder(mapping.folderName)}
                          className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors" title="Include">
                          &#8634;
                        </button>
                      ) : (
                        <button onClick={() => skipFolder(mapping.folderName)}
                          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Skip">
                          &#10005;
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Search Dropdown */}
                  {assigningFolder === mapping.folderName && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 mb-2"
                        autoFocus />
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        <button onClick={() => { assignProduct(mapping.folderName, null); setAssigningFolder(null); }}
                          className="w-full text-left px-3 py-2 text-sm text-white/40 hover:bg-white/5 rounded-lg">
                          Unassign
                        </button>
                        {filteredProducts.slice(0, 20).map(p => (
                          <button key={p.id}
                            onClick={() => { assignProduct(mapping.folderName, p); setAssigningFolder(null); }}
                            className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-violet-500/10 hover:text-violet-400 rounded-lg flex items-center justify-between">
                            <span className="truncate">{p.name}</span>
                            <span className="text-xs text-white/30 shrink-0 ml-2">{p.imageCount} imgs</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {expandedFolders.has(mapping.folderName) && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {mapping.files.slice(0, 12).map((file, idx) => {
                          const blob = new Blob([file.data], { type: file.type });
                          const url = URL.createObjectURL(blob);
                          return (
                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                              <img src={url} alt={file.name} className="w-full h-full object-cover"
                                onLoad={() => URL.revokeObjectURL(url)} />
                            </div>
                          );
                        })}
                        {mapping.files.length > 12 && (
                          <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            <span className="text-xs text-white/40 font-bold">+{mapping.files.length - 12}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-white/20 mt-1.5">{mapping.files.map(f => f.name).join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STEP 3 & 4: Progress / Done
  // ===========================================================================
  const progressPercent = totalImages > 0 ? Math.round(((uploadedImages + failedImages) / totalImages) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{step === "done" ? "Upload Complete" : "Uploading Images..."}</h1>
            <p className="text-sm text-white/50 mt-0.5">
              {uploadedImages} of {totalImages} images uploaded
              {failedImages > 0 && ` | ${failedImages} failed`}
            </p>
          </div>
          {step === "progress" && (
            <div className="flex gap-2">
              <button onClick={() => { pauseRef.current = !pauseRef.current; setIsPaused(!isPaused); }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors">
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button onClick={() => { abortRef.current = true; }}
                className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition-colors">
                Stop
              </button>
            </div>
          )}
          {step === "done" && (
            <button onClick={() => { setStep("upload"); setMappings([]); }}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Upload More
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">{progressPercent}%</span>
            <span className="text-xs text-white/40">
              {uploadedImages} uploaded | {failedImages} failed | {totalImages - uploadedImages - failedImages} remaining
            </span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Uploaded", value: uploadedImages, color: "text-green-400" },
            { label: "Failed", value: failedImages, color: "text-red-400" },
            { label: "Folders Done", value: stats.done, color: "text-violet-400" },
            { label: "Errors", value: stats.errors, color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className={`${card} p-3`}>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Per-folder status */}
        <div className="space-y-1.5">
          {mappings.filter(m => m.matchedProduct && m.status !== "skipped").map((mapping) => (
            <div key={mapping.folderName} className={`${card} px-4 py-3`}>
              <div className="flex items-center gap-3">
                {mapping.status === "uploading" && <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                {mapping.status === "done" && <span className="text-green-400 shrink-0">&#10003;</span>}
                {mapping.status === "error" && <span className="text-red-400 shrink-0">&#10005;</span>}
                {mapping.status === "pending" && <div className="w-4 h-4 rounded-full border-2 border-white/20 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{mapping.matchedProduct?.name}</p>
                  <p className="text-xs text-white/40">
                    {mapping.uploadedCount}/{mapping.files.length} images
                    {mapping.errorMessage && <span className="text-red-400 ml-2">{mapping.errorMessage}</span>}
                  </p>
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                  <div className={`h-full rounded-full transition-all ${
                    mapping.status === "error" ? "bg-red-500" :
                    mapping.status === "done" ? "bg-green-500" : "bg-violet-500"
                  }`} style={{ width: `${mapping.files.length > 0 ? (mapping.uploadedCount / mapping.files.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
