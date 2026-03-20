"use client";

import { trpc } from "@/lib/trpc";

export default function TeamPage() {
  const members = trpc.team.listMembers.useQuery(undefined, { retry: false });
  const roles = trpc.team.listCustomRoles.useQuery(undefined, { retry: false });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-white/60 mt-1">
              Manage team members and custom roles
            </p>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + Invite Member
          </button>
        </div>

        {/* Team Members */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Members</h2>
          {members.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 animate-pulse"
                >
                  <div className="h-5 bg-white/10 rounded w-32 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-20" />
                </div>
              ))}
            </div>
          ) : members.isError ? (
            <p className="text-white/40">
              Unable to load team members. Connect the tRPC team router.
            </p>
          ) : (members.data ?? []).length === 0 ? (
            <p className="text-white/40">
              No team members found. Invite someone to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(members.data ?? []).map((member: any) => (
                <div
                  key={member.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-white/50 text-sm">{member.email}</p>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        member.active !== false ? "bg-green-400" : "bg-white/20"
                      }`}
                    />
                    {member.active !== false ? "Active" : "Inactive"}
                    {member.lastActive && (
                      <>
                        <span className="text-white/20">|</span>
                        Last active:{" "}
                        {new Date(member.lastActive).toLocaleDateString()}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Roles */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Custom Roles</h2>
            <button className="text-white/50 hover:text-white text-sm transition-colors">
              + Create Role
            </button>
          </div>
          {roles.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : roles.isError ? (
            <p className="text-white/40">
              Unable to load roles. Connect the tRPC team router.
            </p>
          ) : (roles.data ?? []).length === 0 ? (
            <p className="text-white/40">
              No custom roles defined. Default roles (Admin, Manager, Staff) are
              available.
            </p>
          ) : (
            <div className="space-y-2">
              {(roles.data ?? []).map((role: any) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-5 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">{role.name}</p>
                    <p className="text-white/40 text-xs">
                      {role.permissions?.length ?? 0} permissions
                      {role.description ? ` — ${role.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs">
                      {role.memberCount ?? 0} members
                    </span>
                    <button className="text-white/40 hover:text-white text-sm transition-colors">
                      Edit
                    </button>
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

function RoleBadge({ role }: { role?: string }) {
  const colors: Record<string, string> = {
    admin: "bg-purple-500/20 text-purple-400",
    owner: "bg-purple-500/20 text-purple-400",
    manager: "bg-blue-500/20 text-blue-400",
    staff: "bg-white/10 text-white/60",
    cashier: "bg-green-500/20 text-green-400",
  };
  const r = (role ?? "staff").toLowerCase();
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs capitalize ${colors[r] ?? colors.staff}`}
    >
      {role ?? "Staff"}
    </span>
  );
}
