"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
  Link2,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function WishlistSharePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");

  const utils = trpc.useUtils();

  const { data: shareInfo, isLoading } =
    trpc.wishlistShare.getMyShare.useQuery(undefined, {
      retry: false,
    });

  const createShare = trpc.wishlistShare.createShare.useMutation({
    onSuccess: () => {
      utils.wishlistShare.getMyShare.invalidate();
    },
  });

  const updateShare = trpc.wishlistShare.updateShare.useMutation({
    onSuccess: () => {
      utils.wishlistShare.getMyShare.invalidate();
      setEditingTitle(false);
    },
  });

  const deleteShare = trpc.wishlistShare.deleteShare.useMutation({
    onSuccess: () => {
      utils.wishlistShare.getMyShare.invalidate();
    },
  });

  useEffect(() => {
    if (shareInfo?.title) {
      setTitleInput(shareInfo.title);
    }
  }, [shareInfo?.title]);

  function handleCreateShare() {
    createShare.mutate({ title: titleInput || undefined });
  }

  function handleCopyLink() {
    if (!shareInfo?.url) return;
    navigator.clipboard.writeText(shareInfo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleTogglePublic() {
    if (!shareInfo) return;
    updateShare.mutate({ isPublic: !shareInfo.isPublic });
  }

  function handleSaveTitle() {
    updateShare.mutate({ title: titleInput || null });
  }

  function handleRevoke() {
    if (confirm("This will remove your share link. Anyone with the link will no longer be able to view your wishlist.")) {
      deleteShare.mutate();
      setIsOpen(false);
    }
  }

  const shareUrl = shareInfo?.url || "";
  const shareText = shareInfo?.title
    ? `Check out ${shareInfo.title} on Mohawk Medibles!`
    : "Check out my wishlist on Mohawk Medibles!";

  const socialLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-sky-500/20 hover:text-sky-400",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-500/20 hover:text-blue-400",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      color: "hover:bg-green-500/20 hover:text-green-400",
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent("Here's my wishlist: " + shareUrl)}`,
      color: "hover:bg-orange-500/20 hover:text-orange-400",
    },
  ];

  if (isLoading) return null;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2 border-forest/30 hover:border-forest text-forest dark:text-lime dark:border-lime/30 dark:hover:border-lime"
      >
        <Share2 className="h-4 w-4" />
        Share Wishlist
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-card border border-border rounded-2xl shadow-2xl p-6 z-50">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <h3 className="text-lg font-bold mb-1">Share Your Wishlist</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a shareable link so friends and family can see what you want.
          </p>

          {!shareInfo ? (
            /* No share exists yet */
            <div className="space-y-3">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Give it a title (e.g. Ian's Birthday Picks)"
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-lime"
              />
              <Button
                onClick={handleCreateShare}
                disabled={createShare.isPending}
                className="w-full bg-forest hover:bg-forest/90 text-white dark:bg-lime dark:text-charcoal-deep dark:hover:bg-lime/90"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {createShare.isPending ? "Generating..." : "Generate Share Link"}
              </Button>
            </div>
          ) : (
            /* Share exists */
            <div className="space-y-4">
              {/* Title editing */}
              <div>
                {editingTitle ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="Wishlist title..."
                      className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest dark:focus:ring-lime"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveTitle}
                      disabled={updateShare.isPending}
                      className="bg-forest text-white dark:bg-lime dark:text-charcoal-deep"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingTitle(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {shareInfo.title || "Untitled Wishlist"}
                    </span>
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Public/Private toggle */}
              <button
                onClick={handleTogglePublic}
                disabled={updateShare.isPending}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                {shareInfo.isPublic ? (
                  <Globe className="h-4 w-4 text-green-500" />
                ) : (
                  <Lock className="h-4 w-4 text-yellow-500" />
                )}
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">
                    {shareInfo.isPublic ? "Public" : "Private"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shareInfo.isPublic
                      ? "Anyone with the link can view"
                      : "Only you can see this wishlist"}
                  </p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${
                    shareInfo.isPublic ? "bg-green-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      shareInfo.isPublic ? "left-5" : "left-0.5"
                    }`}
                  />
                </div>
              </button>

              {/* Copy link */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareInfo.url}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-xs text-muted-foreground truncate"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className={`shrink-0 ${
                    copied
                      ? "bg-green-500 text-white"
                      : "bg-forest text-white dark:bg-lime dark:text-charcoal-deep"
                  }`}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Social share buttons */}
              {shareInfo.isPublic && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Share on social media
                  </p>
                  <div className="flex gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 rounded-lg border border-border text-muted-foreground transition-colors ${social.color}`}
                        title={`Share on ${social.name}`}
                      >
                        <social.icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Revoke */}
              <button
                onClick={handleRevoke}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Revoke share link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
