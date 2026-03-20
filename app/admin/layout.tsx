/**
 * Admin Layout — Shared sidebar navigation + tRPC provider + metadata
 * Updated: Added TRPCProvider for command center features (POS, Inventory, BI, Team)
 */
import { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import { TRPCProvider } from "@/components/TRPCProvider";

export const metadata: Metadata = {
    title: "Command Center | Mohawk Medibles",
    description: "Manage orders, customers, inventory, POS, and shipping.",
    robots: "noindex, nofollow",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TRPCProvider>
            <AdminShell>{children}</AdminShell>
        </TRPCProvider>
    );
}
