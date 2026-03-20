"use client";

import { useState } from "react";

export default function BrandsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Brand Directory</h1>
            <p className="text-white/60 mt-1">
              Manage cannabis brands and suppliers
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Brand"}
          </button>
        </div>

        {/* Add Brand Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Brand</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowForm(false);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  placeholder="Brand name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://brand.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Category
                </label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30">
                  <option value="">Select category...</option>
                  <option value="flower">Flower</option>
                  <option value="edibles">Edibles</option>
                  <option value="concentrates">Concentrates</option>
                  <option value="vapes">Vapes</option>
                  <option value="accessories">Accessories</option>
                  <option value="topicals">Topicals</option>
                </select>
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="contact@brand.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white/50 text-sm mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief brand description..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Add Brand
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Brands Grid */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Category
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Products
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Website
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    No brands added yet. Click &quot;Add Brand&quot; to build
                    your directory.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
