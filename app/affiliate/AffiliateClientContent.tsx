"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  DollarSign, Users, MousePointerClick, TrendingUp, Copy, Check,
  Send, Clock, Gift, Headphones, Zap, ArrowRight, Loader2,
  Wallet, BarChart3, Link2, ChevronRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// AFFILIATE PAGE — Public landing + Dashboard for approved affiliates
// ═══════════════════════════════════════════════════════════

export default function AffiliateClientContent() {
  const status = trpc.affiliate.getMyStatus.useQuery(undefined, { retry: false });

  // If user is an approved affiliate, show dashboard
  if (status.data?.affiliate && status.data.affiliate.status === "ACTIVE") {
    return <AffiliateDashboard />;
  }

  // If application is pending
  if (status.data?.application?.status === "PENDING") {
    return <ApplicationPending />;
  }

  // If application was rejected
  if (status.data?.application?.status === "REJECTED") {
    return <ApplicationRejected />;
  }

  // Show public landing + application form
  return <AffiliateLanding isLoggedIn={!status.isError} />;
}

// ═══════════════════════════════════════════════════════════
// APPLICATION PENDING STATE
// ═══════════════════════════════════════════════════════════

function ApplicationPending() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black mb-4">
            Application Under Review
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Your affiliate application has been submitted and is currently being reviewed
            by our team. We typically review applications within 24-48 hours.
          </p>
          <div className="bg-[var(--card)] rounded-2xl p-6 shadow-xl shadow-black/20">
            <p className="text-sm text-[var(--muted-foreground)]">
              You will receive an email notification once your application has been
              reviewed. In the meantime, feel free to browse our product catalog.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APPLICATION REJECTED STATE
// ═══════════════════════════════════════════════════════════

function ApplicationRejected() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-32 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-black mb-4">
            Application Not Approved
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Unfortunately, your affiliate application was not approved at this time.
            Please contact our support team at{" "}
            <a href="mailto:support@mohawkmedibles.ca" className="text-[var(--lime)] hover:underline">
              support@mohawkmedibles.ca
            </a>{" "}
            for more information.
          </p>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PUBLIC LANDING PAGE
// ═══════════════════════════════════════════════════════════

function AffiliateLanding({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-24 px-4 overflow-hidden">
        {/* Fire glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_70%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-amber-500/10 rounded-full text-amber-400 text-sm font-bold uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            Affiliate Program
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 text-white">
            EARN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">10% COMMISSION</span>{" "}
            ON EVERY SALE
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
            Partner with Canada&apos;s leading Indigenous-owned cannabis dispensary.
            Share your unique link, and earn commission on every order — it&apos;s that simple.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/25"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-[var(--card)] rounded-2xl shadow-xl shadow-black/20 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Commission Rate", value: "10%", icon: DollarSign },
            { label: "Cookie Window", value: "30 Days", icon: Clock },
            { label: "Min. Payout", value: "$50", icon: Wallet },
            { label: "Payout Frequency", value: "Monthly", icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
            Why Partner With Us?
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            We provide everything you need to succeed as an affiliate.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: DollarSign,
              title: "Passive Income",
              desc: "Earn 10% on every sale from your referrals. No cap on earnings.",
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: BarChart3,
              title: "Real-Time Tracking",
              desc: "Monitor clicks, conversions, and earnings from your personal dashboard.",
              color: "from-blue-500 to-cyan-600",
            },
            {
              icon: Headphones,
              title: "Dedicated Support",
              desc: "Get priority access to our affiliate management team for any questions.",
              color: "from-purple-500 to-violet-600",
            },
            {
              icon: Gift,
              title: "Exclusive Promos",
              desc: "Access exclusive discount codes and promotional materials for your audience.",
              color: "from-amber-500 to-orange-600",
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
              How It Works
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              Get started in 4 simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Apply", desc: "Fill out the application form below. It takes less than 2 minutes." },
              { step: "02", title: "Get Approved", desc: "Our team reviews applications within 24-48 hours." },
              { step: "03", title: "Share Your Link", desc: "Get your unique referral link and share it with your audience." },
              { step: "04", title: "Earn Commission", desc: "Earn 10% on every order placed through your link for 30 days." },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10 h-full">
                  <div className="text-4xl font-black text-amber-500/20 mb-3">{item.step}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-amber-500/20 items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="max-w-2xl mx-auto px-4 py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white mb-4">
            Apply to Become an Affiliate
          </h2>
          <p className="text-[var(--muted-foreground)]">
            {isLoggedIn
              ? "Fill out the form below to get started."
              : "You need to be signed in to apply."}
          </p>
        </div>
        {isLoggedIn ? (
          <AffiliateApplicationForm />
        ) : (
          <div className="text-center">
            <a
              href="/login?redirect=/affiliate"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity"
            >
              Sign In to Apply <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APPLICATION FORM
// ═══════════════════════════════════════════════════════════

function AffiliateApplicationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    socialMedia: "",
    audience: "",
    howPromote: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const apply = trpc.affiliate.submitApplication.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-[var(--muted-foreground)]">
          We&apos;ll review your application within 24-48 hours and notify you via email.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    apply.mutate({
      name: form.name,
      email: form.email,
      website: form.website || undefined,
      socialMedia: form.socialMedia || undefined,
      audience: form.audience || undefined,
      howPromote: form.howPromote || undefined,
    });
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-2xl p-8 shadow-xl shadow-black/20 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Website or Blog URL
        </label>
        <input
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          placeholder="https://yoursite.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Social Media Links
        </label>
        <input
          type="text"
          value={form.socialMedia}
          onChange={(e) => setForm({ ...form, socialMedia: e.target.value })}
          placeholder="Instagram, TikTok, YouTube URLs"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          Audience Size
        </label>
        <select
          value={form.audience}
          onChange={(e) => setForm({ ...form, audience: e.target.value })}
          className={`${inputClass} appearance-none`}
        >
          <option value="">Select audience size</option>
          <option value="under-1k">Under 1,000</option>
          <option value="1k-5k">1,000 - 5,000</option>
          <option value="5k-10k">5,000 - 10,000</option>
          <option value="10k-50k">10,000 - 50,000</option>
          <option value="50k-100k">50,000 - 100,000</option>
          <option value="100k+">100,000+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1.5">
          How Will You Promote Mohawk Medibles?
        </label>
        <textarea
          value={form.howPromote}
          onChange={(e) => setForm({ ...form, howPromote: e.target.value })}
          placeholder="Tell us about your promotional strategy..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>

      {apply.error && (
        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
          {apply.error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={apply.isPending || !form.name || !form.email}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {apply.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Submit Application
          </>
        )}
      </button>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════
// AFFILIATE DASHBOARD (for approved affiliates)
// ═══════════════════════════════════════════════════════════

function AffiliateDashboard() {
  const stats = trpc.affiliate.getMyStats.useQuery();
  const conversions = trpc.affiliate.getMyConversions.useQuery({ limit: 20 });
  const payouts = trpc.affiliate.getMyPayouts.useQuery({ limit: 20 });

  const [copied, setCopied] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"ETRANSFER" | "CRYPTO">("ETRANSFER");

  const requestPayout = trpc.affiliate.requestPayout.useMutation({
    onSuccess: () => {
      payouts.refetch();
      stats.refetch();
    },
  });

  const affiliateLink = stats.data
    ? `https://mohawkmedibles.co/?ref=${stats.data.code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (stats.isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const s = stats.data;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#1a1a22] to-[var(--background)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-black text-white">
                Affiliate Dashboard
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Code: <span className="text-amber-400 font-mono font-bold">{s?.code}</span>
                {" "}&middot;{" "}
                {s?.commissionRate}% commission
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-2 space-y-8 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Earnings", value: `$${(s?.totalEarnings ?? 0).toFixed(2)}`, icon: DollarSign, color: "from-green-500 to-emerald-600" },
            { label: "Pending Commission", value: `$${(s?.pendingCommission ?? 0).toFixed(2)}`, icon: Clock, color: "from-amber-500 to-orange-600" },
            { label: "Total Referrals", value: String(s?.totalReferrals ?? 0), icon: Users, color: "from-purple-500 to-violet-600" },
            { label: "Total Clicks", value: String(s?.totalClicks ?? 0), icon: MousePointerClick, color: "from-blue-500 to-cyan-600" },
            { label: "Conversion Rate", value: `${s?.conversionRate ?? "0.0"}%`, icon: TrendingUp, color: "from-pink-500 to-rose-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--card)] rounded-2xl p-5 shadow-lg shadow-black/10"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Affiliate Link */}
        <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10">
          <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Your Affiliate Link
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-white/5 rounded-xl text-white font-mono text-sm truncate">
              {affiliateLink}
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 font-bold text-sm shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Request Payout */}
        <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg shadow-black/10">
          <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">
            Request Payout
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value as "ETRANSFER" | "CRYPTO")}
              className="px-4 py-3 bg-white/5 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="ETRANSFER">Interac e-Transfer</option>
              <option value="CRYPTO">Cryptocurrency</option>
            </select>
            <button
              onClick={() => requestPayout.mutate({ method: payoutMethod })}
              disabled={requestPayout.isPending}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {requestPayout.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              Request Payout (min $50)
            </button>
          </div>
          {requestPayout.error && (
            <p className="mt-3 text-sm text-red-400">{requestPayout.error.message}</p>
          )}
          {requestPayout.isSuccess && (
            <p className="mt-3 text-sm text-green-400">Payout request submitted successfully!</p>
          )}
        </div>

        {/* Recent Conversions */}
        <div className="bg-[var(--card)] rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Recent Conversions
            </h3>
          </div>
          {conversions.data && conversions.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Commission</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {conversions.data.map((c) => (
                    <tr key={c.id} className="text-white hover:bg-white/[0.02]">
                      <td className="px-6 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3 font-mono text-xs">{c.orderId.slice(0, 12)}...</td>
                      <td className="px-6 py-3">${c.orderTotal.toFixed(2)}</td>
                      <td className="px-6 py-3 text-green-400 font-bold">${c.commission.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <ConversionBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-[var(--muted-foreground)]">
              No conversions yet. Start sharing your affiliate link!
            </div>
          )}
        </div>

        {/* Payout History */}
        <div className="bg-[var(--card)] rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
          <div className="px-6 py-4">
            <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              Payout History
            </h3>
          </div>
          {payouts.data && payouts.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payouts.data.map((p) => (
                    <tr key={p.id} className="text-white hover:bg-white/[0.02]">
                      <td className="px-6 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-3 font-bold">${p.amount.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        {p.method === "ETRANSFER" ? "e-Transfer" : "Crypto"}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          p.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {p.status === "COMPLETED" ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-[var(--muted-foreground)]">
              No payouts yet. Earn at least $50 in approved commissions to request a payout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversionBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-400",
    APPROVED: "bg-green-500/10 text-green-400",
    PAID: "bg-blue-500/10 text-blue-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
