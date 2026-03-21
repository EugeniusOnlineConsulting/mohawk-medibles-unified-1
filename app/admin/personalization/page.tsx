"use client";

import { useState } from "react";
import {
    Sparkles, Search, User, ShoppingBag, Eye, Loader2,
} from "lucide-react";

const cardClass =
    "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800";

export default function PersonalizationPage() {
    const [userId, setUserId] = useState("");
    const [searchId, setSearchId] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [recs, setRecs] = useState<any[]>([]);
    const [profileLoading, setProfileLoading] = useState(false);

    const handleSearch = async () => {
        const id = userId.trim();
        if (!id) return;
        setSearchId(id);
        setProfileLoading(true);

        try {
            const [profileRes, recsRes] = await Promise.all([
                fetch(`/api/admin/personalization/?action=profile&userId=${id}`),
                fetch(`/api/admin/personalization/?action=recommendations&userId=${id}&limit=4`),
            ]);
            const profileData = await profileRes.json();
            const recsData = await recsRes.json();

            if (profileRes.ok) setProfile(profileData);
            else setProfile(null);

            if (recsRes.ok && Array.isArray(recsData)) setRecs(recsData);
            else setRecs([]);
        } catch (err) {
            console.error("Failed to fetch personalization:", err);
            setProfile(null);
            setRecs([]);
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Email Personalization</h1>
                    <p className="text-xs text-gray-500">Preview personalized product recommendations based on purchase history</p>
                </div>
            </div>

            {/* Search */}
            <div className={`${cardClass} p-6`}>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4" /> Look Up User
                </h3>
                <p className="text-xs text-gray-500 mb-4">Enter a user ID to preview their personalization profile</p>
                <div className="flex gap-3">
                    <input
                        placeholder="User ID (e.g., clxx1234...)"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="max-w-xs px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                    <button onClick={handleSearch} disabled={!userId.trim()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50">
                        <Search className="w-4 h-4" /> Look Up
                    </button>
                </div>
            </div>

            {profileLoading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                </div>
            )}

            {profile && !profileLoading && (
                <>
                    {/* Purchase Profile */}
                    <div className={`${cardClass} p-6`}>
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                            <User className="w-4 h-4" /> Purchase Profile
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{profile.totalOrders}</p>
                                <p className="text-xs text-gray-500">Total Orders</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">${profile.totalSpent?.toFixed(2) || "0.00"}</p>
                                <p className="text-xs text-gray-500">Total Spent</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">${profile.averageOrderValue?.toFixed(2) || "0.00"}</p>
                                <p className="text-xs text-gray-500">Avg Order Value</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold">{profile.uniqueProducts}</p>
                                <p className="text-xs text-gray-500">Unique Products</p>
                            </div>
                        </div>
                        {profile.topCategories?.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Top Categories</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.topCategories.map((cat: any, i: number) => (
                                        <span key={i} className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                            {cat.name} ({cat.count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {profile.recentProducts?.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Recent Purchases</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.recentProducts.slice(0, 8).map((p: any, i: number) => (
                                        <span key={i} className="px-2.5 py-1 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-full">
                                            {p.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {recs.length > 0 && (
                        <div className={`${cardClass} p-6`}>
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                                <ShoppingBag className="w-4 h-4" /> Recommended Products
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">Products recommended in this user&apos;s emails</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {recs.map((rec) => (
                                    <div key={rec.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                                        {rec.image && <img src={rec.image} alt={rec.name} className="w-full h-32 object-cover rounded" />}
                                        <p className="font-medium text-sm">{rec.name}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-violet-600 font-bold">${rec.price}</span>
                                            <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 rounded">{rec.reason}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!searchId && !profileLoading && (
                <div className="text-center py-12 text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Enter a user ID above to preview their personalization profile</p>
                </div>
            )}
        </div>
    );
}
