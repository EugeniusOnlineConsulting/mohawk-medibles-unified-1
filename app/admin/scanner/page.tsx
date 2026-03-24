"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { trpc } from "@/lib/trpc";
import {
  ScanLine, Package, ClipboardCheck, BarChart3,
  CheckCircle, AlertTriangle, Plus, Minus, Search,
  Printer,
} from "lucide-react";

// Dynamic import to avoid SSR issues with html5-qrcode
const BarcodeScanner = dynamic(() => import("@/components/admin/BarcodeScanner"), {
  ssr: false,
  loading: () => (
    <div className="bg-black rounded-2xl flex items-center justify-center" style={{ minHeight: 320 }}>
      <p className="text-zinc-500 text-sm">Loading scanner...</p>
    </div>
  ),
});

type ScanMode = "product" | "order" | "stock";

interface ScanResult {
  type: "product" | "order" | "unknown";
  data: string;
  parsed: Record<string, unknown> | null;
}

function parseScanData(raw: string): ScanResult {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.type === "order" && parsed.number) {
      return { type: "order", data: parsed.number, parsed };
    }
    if (parsed.type === "product" && parsed.sku) {
      return { type: "product", data: parsed.sku, parsed };
    }
    return { type: "unknown", data: raw, parsed };
  } catch {
    // Plain text — treat as SKU or order number
    if (raw.startsWith("MM-") || raw.startsWith("WS-")) {
      return { type: "order", data: raw, parsed: null };
    }
    return { type: "product", data: raw, parsed: null };
  }
}

export default function AdminScannerPage() {
  const [mode, setMode] = useState<ScanMode>("product");
  const [scanActive, setScanActive] = useState(true);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [manualInput, setManualInput] = useState("");

  // Product lookup
  const [productSku, setProductSku] = useState<string | null>(null);
  const productQuery = trpc.scanner.lookupProduct.useQuery(
    { sku: productSku! },
    { enabled: !!productSku, retry: false }
  );

  // Order verification
  const verifyOrder = trpc.scanner.verifyOrder.useMutation();

  // Stock adjustment
  const [stockAdjustment, setStockAdjustment] = useState(0);
  const adjustStock = trpc.scanner.adjustStock.useMutation({
    onSuccess: () => {
      setStockAdjustment(0);
      // Refetch product
      if (productSku) {
        setProductSku(null);
        setTimeout(() => setProductSku(lastScan?.data || null), 100);
      }
    },
  });

  const handleScan = useCallback(
    (raw: string) => {
      const result = parseScanData(raw);
      setLastScan(result);

      if (mode === "product" || mode === "stock") {
        setProductSku(result.data);
      } else if (mode === "order") {
        verifyOrder.mutate({ orderNumber: result.data });
      }
    },
    [mode, verifyOrder]
  );

  const handleManualLookup = () => {
    if (!manualInput.trim()) return;
    handleScan(manualInput.trim());
    setManualInput("");
  };

  const modes: Array<{ key: ScanMode; label: string; icon: typeof Package }> = [
    { key: "product", label: "Product Lookup", icon: Package },
    { key: "order", label: "Order Verify", icon: ClipboardCheck },
    { key: "stock", label: "Stock Count", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <ScanLine className="h-7 w-7 text-green-400" /> QR / Barcode Scanner
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Scan products, verify orders, and count inventory</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMode(m.key);
              setLastScan(null);
              setProductSku(null);
              verifyOrder.reset();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === m.key
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-white/5 text-zinc-400 border border-transparent hover:text-white hover:bg-white/10"
            }`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Column */}
        <div className="space-y-4">
          <BarcodeScanner onScan={handleScan} active={scanActive} />

          {/* Manual Input */}
          <div className="flex gap-2">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
              placeholder={mode === "order" ? "Enter order number..." : "Enter SKU or barcode..."}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-green-500/50"
            />
            <button
              onClick={handleManualLookup}
              className="px-4 py-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {lastScan && (
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
              <div>
                <p className="text-xs text-zinc-400">Last scan</p>
                <p className="text-sm text-white font-mono">{lastScan.data}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="space-y-4">
          {/* Product Lookup Results */}
          {(mode === "product" || mode === "stock") && productQuery.data && (
            <div className="bg-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                {productQuery.data.image && (
                  <img
                    src={productQuery.data.image}
                    alt={productQuery.data.name}
                    className="w-20 h-20 rounded-xl object-cover bg-white/5"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{productQuery.data.name}</h3>
                  <p className="text-sm text-zinc-400">{productQuery.data.category}</p>
                  {productQuery.data.sku && (
                    <p className="text-xs text-zinc-500 font-mono mt-1">SKU: {productQuery.data.sku}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-zinc-400">Price</p>
                  <p className="text-xl font-bold text-green-400">
                    ${productQuery.data.salePrice || productQuery.data.price}
                  </p>
                  {productQuery.data.salePrice && (
                    <p className="text-xs text-zinc-500 line-through">${productQuery.data.price}</p>
                  )}
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-zinc-400">Stock</p>
                  <p className={`text-xl font-bold ${
                    (productQuery.data.inventory?.quantity ?? 0) <= 5 ? "text-red-400" : "text-white"
                  }`}>
                    {productQuery.data.inventory?.quantity ?? "N/A"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-zinc-400">Status</p>
                  <p className="text-xl font-bold text-white">{productQuery.data.status}</p>
                </div>
              </div>

              {/* Stock adjustment (in stock mode) */}
              {mode === "stock" && (
                <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-3">Quick Stock Adjustment</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStockAdjustment(Math.max(stockAdjustment - 1, -999))}
                      className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      value={stockAdjustment}
                      onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                      className="w-24 text-center px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-bold"
                    />
                    <button
                      onClick={() => setStockAdjustment(stockAdjustment + 1)}
                      className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (stockAdjustment === 0 || !productQuery.data?.sku) return;
                        adjustStock.mutate({
                          sku: productQuery.data.sku,
                          adjustment: stockAdjustment,
                          reason: "Scanner stock count",
                        });
                      }}
                      disabled={stockAdjustment === 0 || adjustStock.isPending}
                      className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg disabled:opacity-50 text-sm"
                    >
                      {adjustStock.isPending ? "Saving..." : "Apply"}
                    </button>
                  </div>
                  {adjustStock.isSuccess && adjustStock.data && (
                    <p className="text-green-400 text-xs mt-2">
                      Updated: {adjustStock.data.previousQty} &rarr; {adjustStock.data.newQty}
                    </p>
                  )}
                  {adjustStock.isError && (
                    <p className="text-red-400 text-xs mt-2">{adjustStock.error.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {(mode === "product" || mode === "stock") && productSku && productQuery.isError && (
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-medium">Product Not Found</p>
              <p className="text-sm text-zinc-400 mt-1">No product matches SKU: {productSku}</p>
            </div>
          )}

          {/* Order Verify Results */}
          {mode === "order" && verifyOrder.isSuccess && verifyOrder.data && (
            <div className="bg-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Order {verifyOrder.data.orderNumber}</h3>
                  <p className="text-sm text-zinc-400">
                    {verifyOrder.data.user?.name} &middot; {verifyOrder.data.user?.email}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  verifyOrder.data.status === "COMPLETED" ? "bg-green-500/10 text-green-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>
                  {verifyOrder.data.status}
                </span>
              </div>

              {(verifyOrder.data as unknown as { markedPickedUp: boolean }).markedPickedUp && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <div>
                    <p className="text-green-400 font-semibold">Marked as Picked Up</p>
                    <p className="text-sm text-green-400/70">Order status updated to COMPLETED</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-zinc-400">Total</p>
                  <p className="text-lg font-bold text-white">${verifyOrder.data.total.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-zinc-400">Payment</p>
                  <p className="text-lg font-bold text-white">{verifyOrder.data.paymentStatus}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-400 mb-2">Items</p>
                <div className="space-y-1.5">
                  {verifyOrder.data.items.map((item: { id: string; name: string; quantity: number; price: number }) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white">{item.name} x{item.quantity}</span>
                      <span className="text-zinc-400">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === "order" && verifyOrder.isError && (
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-medium">Order Not Found</p>
              <p className="text-sm text-zinc-400 mt-1">{verifyOrder.error.message}</p>
            </div>
          )}

          {/* Placeholder when nothing scanned yet */}
          {!lastScan && !productSku && !verifyOrder.data && !verifyOrder.isError && (
            <div className="bg-white/5 rounded-2xl p-12 text-center">
              <ScanLine className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Scan a QR code or barcode to see results here</p>
              <p className="text-zinc-500 text-sm mt-1">Or enter a code manually above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
