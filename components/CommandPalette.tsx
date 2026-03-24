"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  Home,
  Tag,
  FileText,
  HelpCircle,
  Package,
  Star,
  Gift,
  Truck,
  MapPin,
  Phone,
  BookOpen,
  Shield,
  RotateCcw,
  Zap,
  Users,
  Heart,
  Loader2,
  ArrowRight,
  Command,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────── */

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

interface ProductResult {
  id: number;
  name: string;
  shortName?: string;
  slug: string;
  path?: string;
  price: number;
  image?: string;
  category?: string;
}

/* ────────────────────────────────────────────────────────────
   Static Pages / Navigation Commands
   ──────────────────────────────────────────────────────────── */

function buildStaticCommands(push: (path: string) => void): CommandItem[] {
  return [
    // Navigation
    {
      id: "home",
      label: "Home",
      description: "Go to homepage",
      icon: <Home size={18} />,
      action: () => push("/"),
      group: "Navigation",
    },
    {
      id: "shop",
      label: "Shop All Products",
      description: "Browse the full catalogue",
      icon: <ShoppingBag size={18} />,
      action: () => push("/shop"),
      group: "Navigation",
    },
    {
      id: "deals",
      label: "Deals",
      description: "Current sales and promotions",
      icon: <Tag size={18} />,
      action: () => push("/deals"),
      group: "Navigation",
    },
    {
      id: "flash-sale",
      label: "Flash Sale",
      description: "Limited-time flash deals",
      icon: <Zap size={18} />,
      action: () => push("/flash-sale"),
      group: "Navigation",
    },
    {
      id: "bundles",
      label: "Bundles",
      description: "Bundle deals and mix & match",
      icon: <Package size={18} />,
      action: () => push("/bundles"),
      group: "Navigation",
    },
    {
      id: "mix-match",
      label: "Build Your Own Ounce",
      description: "Mix & match strains — save up to 20%",
      icon: <Package size={18} />,
      action: () => push("/mix-match"),
      group: "Navigation",
    },
    {
      id: "brands",
      label: "Brands",
      description: "Shop by brand",
      icon: <Star size={18} />,
      action: () => push("/brands"),
      group: "Navigation",
    },
    {
      id: "gift-cards",
      label: "Gift Cards",
      description: "Purchase a gift card",
      icon: <Gift size={18} />,
      action: () => push("/gift-cards"),
      group: "Navigation",
    },
    {
      id: "reviews",
      label: "Reviews",
      description: "Customer reviews",
      icon: <Star size={18} />,
      action: () => push("/reviews"),
      group: "Navigation",
    },

    // Account
    {
      id: "account",
      label: "My Account",
      description: "View your account",
      icon: <Users size={18} />,
      action: () => push("/account"),
      group: "Account",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      description: "Your saved products",
      icon: <Heart size={18} />,
      action: () => push("/wishlist"),
      group: "Account",
    },
    {
      id: "track-order",
      label: "Track Order",
      description: "Track your shipment",
      icon: <Truck size={18} />,
      action: () => push("/track-order"),
      group: "Account",
    },
    {
      id: "rewards",
      label: "Rewards",
      description: "Loyalty points and rewards",
      icon: <Gift size={18} />,
      action: () => push("/rewards"),
      group: "Account",
    },
    {
      id: "refer",
      label: "Refer a Friend",
      description: "Earn rewards by referring friends",
      icon: <Users size={18} />,
      action: () => push("/refer-a-friend"),
      group: "Account",
    },

    // Information
    {
      id: "about",
      label: "Our Story",
      description: "About Mohawk Medibles",
      icon: <BookOpen size={18} />,
      action: () => push("/our-story"),
      group: "Information",
    },
    {
      id: "how-to-order",
      label: "How to Order",
      description: "Step-by-step ordering guide",
      icon: <HelpCircle size={18} />,
      action: () => push("/how-to-order"),
      group: "Information",
    },
    {
      id: "faq",
      label: "FAQ",
      description: "Frequently asked questions",
      icon: <HelpCircle size={18} />,
      action: () => push("/faq"),
      group: "Information",
    },
    {
      id: "contact",
      label: "Contact Us",
      description: "Get in touch",
      icon: <Phone size={18} />,
      action: () => push("/contact"),
      group: "Information",
    },
    {
      id: "support",
      label: "Support",
      description: "Customer support",
      icon: <Phone size={18} />,
      action: () => push("/support"),
      group: "Information",
    },
    {
      id: "delivery",
      label: "Delivery",
      description: "Delivery info and zones",
      icon: <MapPin size={18} />,
      action: () => push("/delivery"),
      group: "Information",
    },
    {
      id: "blog",
      label: "Blog",
      description: "Articles and guides",
      icon: <FileText size={18} />,
      action: () => push("/blog"),
      group: "Information",
    },

    // Legal
    {
      id: "privacy",
      label: "Privacy Policy",
      description: "How we handle your data",
      icon: <Shield size={18} />,
      action: () => push("/privacy"),
      group: "Legal",
    },
    {
      id: "terms",
      label: "Terms of Service",
      description: "Terms and conditions",
      icon: <FileText size={18} />,
      action: () => push("/terms"),
      group: "Legal",
    },
    {
      id: "returns",
      label: "Returns Policy",
      description: "Return and refund policy",
      icon: <RotateCcw size={18} />,
      action: () => push("/returns-policy"),
      group: "Legal",
    },
    {
      id: "shipping",
      label: "Shipping Policy",
      description: "Shipping rates and info",
      icon: <Truck size={18} />,
      action: () => push("/shipping-policy"),
      group: "Legal",
    },
  ];
}

/* ────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────── */

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const staticCommands = useRef(buildStaticCommands((p) => router.push(p)));

  // Rebuild commands when router changes (shouldn't, but safe)
  useEffect(() => {
    staticCommands.current = buildStaticCommands((p) => router.push(p));
  }, [router]);

  /* ── Filtered static commands ─────────────────────────────── */
  const filteredCommands = query.trim()
    ? staticCommands.current.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          (c.description?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : staticCommands.current;

  /* ── Product search (debounced) ───────────────────────────── */
  const searchProducts = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProductResults([]);
      setLoadingProducts(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadingProducts(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(q)}&limit=5`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const products: ProductResult[] = (data.results ?? data ?? []).slice(0, 5);
      if (!controller.signal.aborted) {
        setProductResults(products);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setProductResults([]);
    } finally {
      if (!controller.signal.aborted) setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => searchProducts(query.trim()), 250);
    } else {
      setProductResults([]);
      setLoadingProducts(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, searchProducts]);

  /* ── Build flat list of all items for keyboard nav ────────── */
  const allItems: { type: "product" | "command"; item: ProductResult | CommandItem }[] = [];

  // Products first when searching
  if (query.trim().length >= 2) {
    productResults.forEach((p) => allItems.push({ type: "product", item: p }));
  }
  filteredCommands.forEach((c) => allItems.push({ type: "command", item: c }));

  /* ── Group the commands for display ───────────────────────── */
  const grouped: Record<string, CommandItem[]> = {};
  filteredCommands.forEach((c) => {
    if (!grouped[c.group]) grouped[c.group] = [];
    grouped[c.group].push(c);
  });
  const groupOrder = ["Navigation", "Account", "Information", "Legal"];

  /* ── Clamp selectedIndex ──────────────────────────────────── */
  useEffect(() => {
    if (selectedIndex >= allItems.length) {
      setSelectedIndex(Math.max(0, allItems.length - 1));
    }
  }, [allItems.length, selectedIndex]);

  /* ── Global Cmd/Ctrl+K listener ───────────────────────────── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* ── Focus input on open ──────────────────────────────────── */
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setProductResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ── Scroll active item into view ─────────────────────────── */
  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  /* ── Execute selected item ────────────────────────────────── */
  const executeItem = useCallback(
    (index: number) => {
      const entry = allItems[index];
      if (!entry) return;
      setOpen(false);
      if (entry.type === "product") {
        const product = entry.item as ProductResult;
        const slug = product.slug || product.path;
        router.push(`/product/${slug}`);
      } else {
        (entry.item as CommandItem).action();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allItems, router]
  );

  /* ── Keyboard handler inside palette ──────────────────────── */
  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          executeItem(selectedIndex);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [allItems.length, executeItem, selectedIndex]
  );

  /* ── Compute flat index offset for a command ──────────────── */
  function flatIndexOf(item: ProductResult | CommandItem, type: "product" | "command"): number {
    return allItems.findIndex(
      (e) =>
        e.type === type &&
        (type === "product"
          ? (e.item as ProductResult).id === (item as ProductResult).id
          : (e.item as CommandItem).id === (item as CommandItem).id)
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search size={20} className="shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder="Search products, pages, and more..."
            className="flex-1 bg-transparent text-base text-white placeholder:text-zinc-500 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className="sr-only">Clear</span>
              &times;
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
          {/* No results */}
          {allItems.length === 0 && !loadingProducts && query.length >= 2 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Product results */}
          {query.trim().length >= 2 && (productResults.length > 0 || loadingProducts) && (
            <div className="mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <ShoppingBag size={12} />
                Products
                {loadingProducts && <Loader2 size={12} className="animate-spin" />}
              </div>
              {productResults.map((product) => {
                const idx = flatIndexOf(product, "product");
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={`product-${product.id}`}
                    data-active={isActive}
                    onClick={() => executeItem(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-orange-500/15 text-orange-400"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={36}
                        height={36}
                        className="rounded-md object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/5">
                        <Package size={16} className="text-zinc-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {product.shortName || product.name}
                      </div>
                      {product.category && (
                        <div className="truncate text-xs text-zinc-500">
                          {product.category}
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-emerald-400">
                      ${Number(product.price).toFixed(2)}
                    </div>
                    {isActive && (
                      <ArrowRight size={14} className="shrink-0 text-orange-400/60" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grouped static commands */}
          {groupOrder.map((group) => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            return (
              <Fragment key={group}>
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {group}
                </div>
                {items.map((cmd) => {
                  const idx = flatIndexOf(cmd, "command");
                  const isActive = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-active={isActive}
                      onClick={() => executeItem(idx)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isActive
                          ? "bg-orange-500/15 text-orange-400"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      <span
                        className={`shrink-0 ${
                          isActive ? "text-orange-400" : "text-zinc-500"
                        }`}
                      >
                        {cmd.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="truncate text-xs text-zinc-500">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <ArrowRight size={14} className="shrink-0 text-orange-400/60" />
                      )}
                    </button>
                  );
                })}
              </Fragment>
            );
          })}
        </div>

        {/* Footer with keyboard hints */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-medium">
                &uarr;
              </kbd>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-medium">
                &darr;
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-medium">
                Enter
              </kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-medium">
                Esc
              </kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command size={12} />
            <span>K to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
