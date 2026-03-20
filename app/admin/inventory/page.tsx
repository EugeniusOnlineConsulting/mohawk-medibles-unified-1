"use client";

import { trpc } from "@/lib/trpc";

export default function InventoryDashboardPage() {
  const warehouses = trpc.inventory.listWarehouses.useQuery(undefined, {
    retry: false,
  });
  const lowStock = trpc.inventory.getLowStockAlerts.useQuery(undefined, {
    retry: false,
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-white/60 mt-1">
            Stock levels, warehouses, and alerts
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="/admin/inventory/purchase-orders"
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
          >
            <h3 className="font-semibold">Purchase Orders</h3>
            <p className="text-white/50 text-sm mt-1">
              Manage supplier orders
            </p>
          </a>
          <a
            href="/admin/inventory/transfers"
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
          >
            <h3 className="font-semibold">Transfers</h3>
            <p className="text-white/50 text-sm mt-1">
              Move stock between warehouses
            </p>
          </a>
          <a
            href="/admin/inventory/vendors"
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
          >
            <h3 className="font-semibold">Vendors</h3>
            <p className="text-white/50 text-sm mt-1">
              Supplier directory
            </p>
          </a>
        </div>

        {/* Warehouses */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Warehouses</h2>
          {warehouses.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-5 animate-pulse"
                >
                  <div className="h-5 bg-white/10 rounded w-32 mb-3" />
                  <div className="h-8 bg-white/10 rounded w-16" />
                </div>
              ))}
            </div>
          ) : warehouses.isError ? (
            <p className="text-white/40">
              Unable to load warehouses. Connect the tRPC inventory router to
              enable this feature.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(warehouses.data ?? []).map((wh: any) => (
                <div
                  key={wh.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-5"
                >
                  <h3 className="font-semibold mb-1">{wh.name}</h3>
                  <p className="text-white/50 text-sm mb-3">
                    {wh.location ?? "No location set"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {wh.totalStock ?? wh.stockCount ?? 0}
                    </span>
                    <span className="text-white/50 text-sm">items in stock</span>
                  </div>
                  <div className="mt-3 flex gap-3 text-sm">
                    <span className="text-green-400">
                      {wh.skuCount ?? 0} SKUs
                    </span>
                    <span className="text-white/30">|</span>
                    <span
                      className={
                        (wh.lowStockCount ?? 0) > 0
                          ? "text-yellow-400"
                          : "text-white/40"
                      }
                    >
                      {wh.lowStockCount ?? 0} low stock
                    </span>
                  </div>
                </div>
              ))}
              {(warehouses.data ?? []).length === 0 && (
                <p className="text-white/40 col-span-3">
                  No warehouses configured.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            Low Stock Alerts
          </h2>
          {lowStock.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : lowStock.isError ? (
            <p className="text-white/40">
              Unable to load alerts. Connect the tRPC inventory router.
            </p>
          ) : (lowStock.data ?? []).length === 0 ? (
            <p className="text-green-400">All stock levels are healthy.</p>
          ) : (
            <div className="space-y-2">
              {(lowStock.data ?? []).map((alert: any) => (
                <div
                  key={alert.id ?? alert.productId}
                  className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {alert.productName ?? alert.name}
                    </p>
                    <p className="text-white/50 text-xs">
                      {alert.warehouse ?? "Default"} &middot; SKU:{" "}
                      {alert.sku ?? "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">
                      {alert.currentStock ?? alert.quantity} left
                    </p>
                    <p className="text-white/40 text-xs">
                      Threshold: {alert.threshold ?? alert.reorderPoint ?? 10}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
