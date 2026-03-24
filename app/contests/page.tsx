"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Trophy, Clock, Gift, Users, Flame, Star, Lock, Coins, ShoppingCart, UserPlus } from "lucide-react";
import Link from "next/link";

function useCountdown(endDate: string | Date) {
  const [timeLeft, setTimeLeft] = useState("");

  const calculate = useCallback(() => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Ended";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  }, [endDate]);

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [calculate]);

  return timeLeft;
}

function EntryMethodBadge({ method, minPurchase, pointsCost }: { method: string; minPurchase?: number | null; pointsCost?: number | null }) {
  const config: Record<string, { icon: typeof Gift; label: string; color: string }> = {
    FREE: { icon: Gift, label: "Free Entry", color: "text-emerald-400" },
    PURCHASE: { icon: ShoppingCart, label: minPurchase ? `Spend $${minPurchase}+` : "Any Purchase", color: "text-amber-400" },
    SIGNUP: { icon: UserPlus, label: "New Signup", color: "text-blue-400" },
    POINTS: { icon: Coins, label: `${pointsCost || 100} Points`, color: "text-purple-400" },
  };
  const c = config[method] || config.FREE;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${c.color}`}>
      <Icon className="w-4 h-4" /> {c.label}
    </span>
  );
}

function ContestCard({ contest, onEnter, entering }: {
  contest: {
    id: number;
    title: string;
    description: string;
    prize: string;
    prizeImage?: string | null;
    entryMethod: string;
    minPurchaseAmount?: number | null;
    pointsCost?: number | null;
    endDate: string | Date;
    _count: { entries: number };
    totalEntries: number;
  };
  onEnter: (id: number) => void;
  entering: boolean;
}) {
  const countdown = useCountdown(contest.endDate);
  const canDirectEnter = contest.entryMethod === "FREE" || contest.entryMethod === "POINTS";

  return (
    <div className="bg-[#141420] rounded-2xl overflow-hidden shadow-xl shadow-black/40 hover:shadow-amber-500/10 transition-all duration-300 group">
      {/* Prize Image */}
      {contest.prizeImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={contest.prizeImage}
            alt={contest.prize}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141420] via-transparent to-transparent" />
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono text-amber-300">{countdown}</span>
          </div>
        </div>
      )}

      <div className="p-6">
        {!contest.prizeImage && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono text-amber-300">{countdown}</span>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
          {contest.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-amber-400 font-semibold">{contest.prize}</span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{contest.description}</p>

        <div className="flex items-center justify-between mb-4">
          <EntryMethodBadge method={contest.entryMethod} minPurchase={contest.minPurchaseAmount} pointsCost={contest.pointsCost} />
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            <span>{contest._count.entries} {contest._count.entries === 1 ? "entry" : "entries"}</span>
          </div>
        </div>

        {canDirectEnter ? (
          <button
            onClick={() => onEnter(contest.id)}
            disabled={entering}
            className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {entering ? "Entering..." : "Enter Now"}
          </button>
        ) : contest.entryMethod === "PURCHASE" ? (
          <Link
            href="/shop"
            className="block w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 transition-all"
          >
            Shop to Enter
          </Link>
        ) : (
          <Link
            href="/register"
            className="block w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/20 transition-all"
          >
            Sign Up to Enter
          </Link>
        )}
      </div>
    </div>
  );
}

function PastContestCard({ contest }: {
  contest: {
    id: number;
    title: string;
    prize: string;
    prizeImage?: string | null;
    endDate: string | Date;
    winnerAnnouncedAt?: string | Date | null;
    winner?: { id: string; name: string } | null;
    _count: { entries: number };
  };
}) {
  return (
    <div className="bg-[#141420]/60 rounded-xl p-5 shadow-lg shadow-black/20">
      <div className="flex items-start gap-4">
        {contest.prizeImage && (
          <img
            src={contest.prizeImage}
            alt={contest.prize}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{contest.title}</h4>
          <p className="text-amber-400 text-sm">{contest.prize}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{contest._count.entries} entries</span>
            <span>Ended {new Date(contest.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      {contest.winner && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-gray-300">
            Winner: <span className="text-amber-300 font-medium">{contest.winner.name}</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default function ContestsPage() {
  const [enteringId, setEnteringId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeQuery = trpc.contest.getActive.useQuery();
  const pastQuery = trpc.contest.getPast.useQuery();
  const enterMutation = trpc.contest.enter.useMutation({
    onSuccess: () => {
      setMessage({ type: "success", text: "You're entered! Good luck!" });
      activeQuery.refetch();
      setEnteringId(null);
    },
    onError: (err) => {
      setMessage({ type: "error", text: err.message });
      setEnteringId(null);
    },
  });

  function handleEnter(contestId: number) {
    setMessage(null);
    setEnteringId(contestId);
    enterMutation.mutate({ contestId });
  }

  const activeContests = activeQuery.data ?? [];
  const pastContests = pastQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 rounded-full px-4 py-2 mb-6">
            <Flame className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Contests & Giveaways</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Win <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Premium Prizes</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Enter our contests for a chance to win exclusive cannabis products, gift cards, and more.
            The more you shop, the more entries you earn.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Status message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Active Contests */}
        {activeQuery.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141420] rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : activeContests.length > 0 ? (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-400" />
              Active Contests
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.map((contest: any) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  onEnter={handleEnter}
                  entering={enteringId === contest.id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 mb-16">
            <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Active Contests</h3>
            <p className="text-gray-500">Check back soon — new contests are added regularly!</p>
          </div>
        )}

        {/* Past Contests */}
        {pastContests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              Past Winners
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pastContests.map((contest: any) => (
                <PastContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
