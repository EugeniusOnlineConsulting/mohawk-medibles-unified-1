"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function PosEmployeesPage() {
  const employees = trpc.team.listPosEmployees.useQuery(undefined, {
    retry: false,
  });
  const utils = trpc.useUtils();
  const createEmployee = trpc.team.createPosEmployee.useMutation({
    onSuccess: () => {
      utils.team.listPosEmployees.invalidate();
      setName("");
      setPin("");
      setRole("cashier");
      setShowForm(false);
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"cashier" | "manager" | "admin">("cashier");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createEmployee.mutate({ name: name.trim(), pin, role });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">POS Employees</h1>
            <p className="text-white/60 mt-1">
              Manage employees with POS access
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/pos"
              className="text-white/50 hover:text-white text-sm transition-colors px-3 py-2"
            >
              &larr; Back to POS
            </a>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Employee"}
            </button>
          </div>
        </div>

        {/* Add Employee Form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Employee</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-white/50 text-sm mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                  required
                />
              </div>
              <div className="w-32">
                <label className="block text-white/50 text-sm mb-1">PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="4-digit"
                  maxLength={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="w-40">
                <label className="block text-white/50 text-sm mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "cashier" | "manager" | "admin")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={createEmployee.isPending}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  {createEmployee.isPending ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
            {createEmployee.isError && (
              <p className="text-red-400 text-sm mt-3">
                Error: {createEmployee.error?.message ?? "Failed to create employee"}
              </p>
            )}
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Name
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Role
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Status
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Created
                  </th>
                  <th className="px-6 py-4 text-white/50 text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : employees.isError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      Unable to load employees. The tRPC team router may not be
                      connected yet.
                    </td>
                  </tr>
                ) : (employees.data ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-white/40"
                    >
                      No POS employees found. Click &quot;Add Employee&quot; to
                      get started.
                    </td>
                  </tr>
                ) : (
                  (employees.data ?? []).map((emp: any) => (
                    <tr
                      key={emp.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{emp.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-xs capitalize">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            emp.active !== false
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/10 text-white/40"
                          }`}
                        >
                          {emp.active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/50">
                        {emp.createdAt
                          ? new Date(emp.createdAt).toLocaleDateString()
                          : "N/A"}
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
