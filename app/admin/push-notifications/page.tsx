"use client";

import { useState } from "react";
import { Bell, Send, Users, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Admin — Push Notifications Management
 * Compose and send push notifications to all subscribers or specific users.
 */
export default function PushNotificationsPage() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("");
    const [targetUserId, setTargetUserId] = useState("");
    const [sendToAll, setSendToAll] = useState(true);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);

    // Fetch subscriber count
    const fetchCount = async () => {
        setLoadingCount(true);
        try {
            const res = await fetch("/api/admin/push/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "count" }),
            });
            // Use the tRPC route via direct DB query for count
            // For simplicity, we'll show a placeholder until tRPC is wired
            setSubscriberCount(null);
        } catch {
            // ignore
        }
        setLoadingCount(false);
    };

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            setResult({ success: false, message: "Title and body are required." });
            return;
        }

        const confirmed = window.confirm(
            sendToAll
                ? "Send this notification to ALL subscribers?"
                : `Send this notification to user ${targetUserId}?`
        );
        if (!confirmed) return;

        setSending(true);
        setResult(null);

        try {
            const payload: Record<string, string> = { title: title.trim(), body: body.trim() };
            if (url.trim()) payload.url = url.trim();
            if (!sendToAll && targetUserId.trim()) payload.userId = targetUserId.trim();

            const res = await fetch("/api/admin/push/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                const count = data.sent ?? data.successful ?? 0;
                setResult({
                    success: true,
                    message: `Notification sent successfully! Delivered to ${count} device${count !== 1 ? "s" : ""}.`,
                });
                setTitle("");
                setBody("");
                setUrl("");
                setTargetUserId("");
            } else {
                setResult({ success: false, message: data.error || "Failed to send notification." });
            }
        } catch (err: any) {
            setResult({ success: false, message: err.message || "Network error." });
        }

        setSending(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        Push Notifications
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm">
                        Send push notifications to subscribers. Flash sales, order updates, and more.
                    </p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0f0f18] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Smartphone className="h-4 w-4 text-amber-400" />
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Subscriptions</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {subscriberCount !== null ? subscriberCount : "--"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">Active push subscriptions</p>
                </div>
                <div className="bg-[#0f0f18] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Unique Users</span>
                    </div>
                    <p className="text-2xl font-bold text-white">--</p>
                    <p className="text-xs text-zinc-600 mt-1">Users with push enabled</p>
                </div>
                <div className="bg-[#0f0f18] rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Send className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Status</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">Active</p>
                    <p className="text-xs text-zinc-600 mt-1">Push service operational</p>
                </div>
            </div>

            {/* Compose Form */}
            <div className="bg-[#0f0f18] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Send className="h-4 w-4 text-amber-400" />
                    Compose Notification
                </h2>

                <div className="space-y-4">
                    {/* Target selector */}
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={sendToAll}
                                onChange={() => setSendToAll(true)}
                                className="accent-amber-500"
                            />
                            <span className="text-sm text-zinc-300">Send to All Subscribers</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={!sendToAll}
                                onChange={() => setSendToAll(false)}
                                className="accent-amber-500"
                            />
                            <span className="text-sm text-zinc-300">Specific User</span>
                        </label>
                    </div>

                    {/* User ID input (conditional) */}
                    {!sendToAll && (
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">User ID</label>
                            <input
                                type="text"
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                placeholder="Enter user ID (cuid)"
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Flash Sale: 30% Off All Edibles!"
                            maxLength={100}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">{title.length}/100 characters</p>
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">Body *</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="For the next 24 hours, enjoy 30% off our entire edibles collection. Use code FLASH30 at checkout."
                            rows={3}
                            maxLength={500}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">{body.length}/500 characters</p>
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-xs text-zinc-500 mb-1">URL (optional)</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://mohawkmedibles.ca/deals"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                        />
                        <p className="text-[10px] text-zinc-600 mt-1">Where the notification click leads</p>
                    </div>

                    {/* Preview */}
                    {(title || body) && (
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-2">Preview</p>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-white">M</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{title || "Notification Title"}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{body || "Notification body text..."}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Result message */}
                    {result && (
                        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                            result.success
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                            {result.success ? (
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            {result.message}
                        </div>
                    )}

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || !title.trim() || !body.trim()}
                        className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {sending ? "Sending..." : sendToAll ? "Broadcast to All" : "Send to User"}
                    </button>
                </div>
            </div>
        </div>
    );
}
