"use client";

export default function WishlistAdminPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Wishlists</h1>
                <p className="text-zinc-400 mt-1">View customer wishlist activity and popular products</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-1">Total Wishlisted Items</p>
                    <p className="text-3xl font-bold">—</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-1">Users with Wishlists</p>
                    <p className="text-3xl font-bold">—</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm mb-1">Wishlist → Purchase Rate</p>
                    <p className="text-3xl font-bold">—</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <p className="text-zinc-500">Wishlist analytics will populate once customers start using the feature.</p>
            </div>
        </div>
    );
}
