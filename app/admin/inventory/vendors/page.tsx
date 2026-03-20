"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function VendorsPage() {
  const vendors = trpc.inventory.listVendors.useQuery(undefined, {
    retry: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vendors</h1>
            <p className="text-white/60 mt-1">
              Supplier directory and management
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/inventory"
              className="text-white/50 hover:text-white text-sm transition-colors px-3 py-2"
            >
              &larr; Back to Inventory
            </a>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Vendor"}
            </button>
          </div>
        </div>

        {/* Add Vendor Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Vendor</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Mutation would go here
                alert(`Vendor "${name}" would be created via tRPC mutation`);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vendor name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Flower, Edibles, Concentrates"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vendor List */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Email
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Category
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Products
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {vendors.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : vendors.isError ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      Unable to load vendors. Connect the tRPC inventory router.
                    </td>
                  </tr>
                ) : (vendors.data ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      No vendors found. Add a vendor to get started.
                    </td>
                  </tr>
                ) : (
                  (vendors.data ?? []).map((v: any) => (
                    <tr
                      key={v.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{v.name}</td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {v.email ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {v.phone ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {v.category ? (
                          <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                            {v.category}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {v.productCount ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-white/40 hover:text-white text-sm transition-colors">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
