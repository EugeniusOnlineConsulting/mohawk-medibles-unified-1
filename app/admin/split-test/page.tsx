'use client';

import { useState, useEffect } from 'react';

interface TenantStats {
  slug: string;
  name: string;
  domain: string;
  primaryColor: string;
  active: boolean;
  isDefault: boolean;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    last30Days: { orders: number; revenue: number };
    avgOrderValue: number;
  };
}

interface DailyMetric {
  date: string;
  pageViews: number;
  productViews: number;
  addToCarts: number;
  checkoutStarts: number;
  ordersCompleted: number;
  revenue: number;
}

export default function SplitTestDashboard() {
  const [tenants, setTenants] = useState<TenantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetch('/api/admin/tenants/')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data) => {
        setTenants(data.tenants || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Split Test Dashboard</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Split Test Dashboard</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300">Error loading data: {error}</p>
          <p className="text-sm text-red-500 mt-1">Make sure you&apos;re logged in as admin.</p>
        </div>
      </div>
    );
  }

  const totalRevenue = tenants.reduce((sum, t) => sum + t.stats.totalRevenue, 0);
  const totalOrders = tenants.reduce((sum, t) => sum + t.stats.totalOrders, 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Split Test Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Compare niche site performance across {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`} />
        <SummaryCard label="Total Orders" value={totalOrders.toLocaleString()} />
        <SummaryCard label="Active Sites" value={tenants.filter(t => t.active).length.toString()} />
        <SummaryCard
          label="Avg Order Value"
          value={`$${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}`}
        />
      </div>

      {/* Tenant Comparison Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <TenantCard
            key={tenant.slug}
            tenant={tenant}
            totalRevenue={totalRevenue}
            totalOrders={totalOrders}
          />
        ))}

        {/* Add New Tenant Card */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer min-h-[280px]">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-medium">Add Niche Site</span>
          <span className="text-sm mt-1">Create a new tenant</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Head-to-Head Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Metric</th>
                {tenants.map((t) => (
                  <th key={t.slug} className="px-4 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      {t.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <CompRow label="Total Orders" tenants={tenants} getValue={(t) => t.stats.totalOrders.toLocaleString()} />
              <CompRow label="Total Revenue" tenants={tenants} getValue={(t) => `$${t.stats.totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`} />
              <CompRow label="Avg Order Value" tenants={tenants} getValue={(t) => `$${t.stats.avgOrderValue.toFixed(2)}`} />
              <CompRow label="30-Day Orders" tenants={tenants} getValue={(t) => t.stats.last30Days.orders.toLocaleString()} />
              <CompRow label="30-Day Revenue" tenants={tenants} getValue={(t) => `$${t.stats.last30Days.revenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`} />
              <CompRow
                label="Revenue Share"
                tenants={tenants}
                getValue={(t) => totalRevenue > 0 ? `${((t.stats.totalRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%'}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function TenantCard({
  tenant,
  totalRevenue,
  totalOrders,
}: {
  tenant: TenantStats;
  totalRevenue: number;
  totalOrders: number;
}) {
  const revenueShare = totalRevenue > 0 ? (tenant.stats.totalRevenue / totalRevenue) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Color Banner */}
      <div className="h-2" style={{ backgroundColor: tenant.primaryColor }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{tenant.name}</h3>
            <p className="text-sm text-gray-500">{tenant.domain}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              tenant.isDefault
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : tenant.active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500'
            }`}
          >
            {tenant.isDefault ? 'Default' : tenant.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
            <p className="text-lg font-bold" style={{ color: tenant.primaryColor }}>
              ${tenant.stats.totalRevenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Orders</p>
            <p className="text-lg font-bold">{tenant.stats.totalOrders.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">AOV</p>
            <p className="text-lg font-bold">${tenant.stats.avgOrderValue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Share</p>
            <p className="text-lg font-bold">{revenueShare.toFixed(1)}%</p>
          </div>
        </div>

        {/* Revenue Share Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(revenueShare, 100)}%`,
                backgroundColor: tenant.primaryColor,
              }}
            />
          </div>
        </div>

        {/* 30-Day Trend */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 mb-1">Last 30 Days</p>
          <div className="flex justify-between text-sm">
            <span>{tenant.stats.last30Days.orders} orders</span>
            <span className="font-medium">
              ${tenant.stats.last30Days.revenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompRow({
  label,
  tenants,
  getValue,
}: {
  label: string;
  tenants: TenantStats[];
  getValue: (t: TenantStats) => string;
}) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{label}</td>
      {tenants.map((t) => (
        <td key={t.slug} className="px-4 py-3 text-right tabular-nums">
          {getValue(t)}
        </td>
      ))}
    </tr>
  );
}
