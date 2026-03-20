"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Package, Users, ShoppingCart, BarChart3, Settings, LogOut,
    Search, Bell, ChevronDown, TrendingUp, Truck,
    ChevronLeft, ChevronRight, Percent,
    LayoutDashboard, Megaphone, BookOpen, MessageSquare,
    Zap, Gift, Tag, Warehouse, ClipboardList,
    UserCog, Monitor, PieChart, CreditCard,
    ShoppingBag, Star, Beaker, ArrowLeftRight,
    Globe, Heart, Clock, Mail,
} from "lucide-react";

const NAV_SECTIONS = [
    { heading: "Overview", items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/financial", label: "Financial Model", icon: TrendingUp },
        { href: "/admin/bi", label: "BI Reports", icon: PieChart },
    ]},
    { heading: "Commerce", items: [
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/coupons", label: "Coupons", icon: Percent },
        { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
        { href: "/admin/gift-cards", label: "Gift Cards", icon: Gift },
        { href: "/admin/brands", label: "Brands", icon: Tag },
    ]},
    { heading: "Point of Sale", items: [
        { href: "/admin/pos", label: "POS Terminal", icon: CreditCard },
        { href: "/admin/pos/transactions", label: "Transactions", icon: ClipboardList },
        { href: "/admin/pos/employees", label: "Employees", icon: UserCog },
    ]},
    { heading: "Inventory", items: [
        { href: "/admin/inventory", label: "Stock Levels", icon: Warehouse },
        { href: "/admin/inventory/purchase-orders", label: "Purchase Orders", icon: ShoppingBag },
        { href: "/admin/inventory/transfers", label: "Transfers", icon: ArrowLeftRight },
        { href: "/admin/inventory/vendors", label: "Vendors", icon: Globe },
    ]},
    { heading: "Operations", items: [
        { href: "/admin/shipping", label: "Shipping", icon: Truck },
        { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
        { href: "/admin/content", label: "Content", icon: BookOpen },
        { href: "/admin/agents", label: "Agents", icon: MessageSquare },
        { href: "/admin/reviews", label: "Reviews", icon: Star },
        { href: "/admin/abandoned-carts", label: "Abandoned Carts", icon: Clock },
        { href: "/admin/email", label: "Email Logs", icon: Mail },
    ]},
    { heading: "Testing", items: [
        { href: "/admin/split-test", label: "A/B Tests", icon: Beaker },
    ]},
    { heading: "System", items: [
        { href: "/admin/team", label: "Team", icon: UserCog },
        { href: "/admin/sites", label: "Site Monitor", icon: Monitor },
        { href: "/admin/wishlist", label: "Wishlists", icon: Heart },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]},
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();

    function isActive(href: string) {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex">
            {/* Sidebar */}
            <aside className={`${sidebarCollapsed ? "w-20" : "w-72"} bg-[#0f0f18] border-r border-white/5 flex flex-col transition-all duration-300 shrink-0`}>
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                            <span className="text-lg font-black">M</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h1 className="font-bold text-sm">Mohawk Medibles</h1>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Command Center</p>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
                    {NAV_SECTIONS.map((section) => (
                        <div key={section.heading}>
                            {!sidebarCollapsed && (
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest px-3 mb-2">{section.heading}</p>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={sidebarCollapsed ? item.label : undefined}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(item.href)
                                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {!sidebarCollapsed && item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/5 space-y-1">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        {!sidebarCollapsed && "Collapse"}
                    </button>
                    <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 transition-colors">
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed && "Back to Site"}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search orders, products, customers..."
                                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50 w-96"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {process.env.NODE_ENV === "production" ? "PRODUCTION" : "DEVELOPMENT"}
                        </div>
                        <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <Bell className="h-4 w-4 text-zinc-400" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold">A</div>
                            <span className="text-sm">Admin</span>
                            <ChevronDown className="h-3 w-3 text-zinc-500" />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
