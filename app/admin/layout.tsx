/**
 * Admin Layout — Shared sidebar navigation + metadata
 */
import { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
    title: "Admin Console | Mohawk Medibles",
    description: "Manage orders, customers, inventory, and shipping.",
    robots: "noindex, nofollow",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminShell>{children}</AdminShell>;
}
