"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Star, RefreshCw, Clock, ExternalLink } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`}
        />
      ))}
    </div>
  );
}

export default function GoogleReviewsAdminPage() {
  const [syncing, setSyncing] = useState(false);

  const { data, refetch, isLoading } = trpc.googleReviews.getAll.useQuery();
  const syncMutation = trpc.googleReviews.syncNow.useMutation({
    onSuccess: () => {
      refetch();
      setSyncing(false);
    },
    onError: () => setSyncing(false),
  });

  const handleSync = () => {
    setSyncing(true);
    syncMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Google Reviews</h1>
            <p className="text-white/60 mt-1">
              Synced reviews from Google Places API
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/50 text-sm mb-1">Average Rating</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-amber-400">
                {data?.averageRating?.toFixed(1) ?? "—"}
              </span>
              {data?.averageRating ? (
                <StarRating rating={Math.round(data.averageRating)} />
              ) : null}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/50 text-sm mb-1">Total Reviews</p>
            <span className="text-3xl font-black text-white">
              {data?.totalReviews ?? "—"}
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-white/50 text-sm mb-1">Last Synced</p>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {data?.lastSyncedAt
                  ? new Date(data.lastSyncedAt).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold">
              Synced Reviews ({data?.total ?? 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-white/40">Loading...</div>
          ) : !data?.reviews?.length ? (
            <div className="p-12 text-center text-white/40">
              <p className="mb-2">No reviews synced yet.</p>
              <p className="text-sm">
                Click "Sync Now" to fetch reviews from Google, or configure
                GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID env vars.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.reviews.map((review) => (
                <div key={review.id} className="px-6 py-4 flex gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {review.authorPhoto ? (
                      <img
                        src={review.authorPhoto}
                        alt={review.authorName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-sm">
                        {review.authorName}
                      </span>
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-white/40">
                        {review.relativeTime}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2">
                      {review.text || "No text"}
                    </p>
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
