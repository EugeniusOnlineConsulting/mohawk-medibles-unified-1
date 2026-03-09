"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface WishlistItem {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    category: string;
    addedAt: number;
}

interface WishlistContextType {
    items: WishlistItem[];
    addItem: (item: Omit<WishlistItem, "addedAt">) => void;
    removeItem: (id: string) => void;
    toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
    count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("mohawk-wishlist");
            if (saved) setItems(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem("mohawk-wishlist", JSON.stringify(items));
    }, [items]);

    // Sync to server (debounced 5s)
    const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
        syncTimerRef.current = setTimeout(() => {
            fetch("/api/wishlist/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            }).catch(() => { /* silent */ });
        }, 5000);
        return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
    }, [items]);

    const addItem = React.useCallback((item: Omit<WishlistItem, "addedAt">) => {
        setItems((current) => {
            if (current.some((i) => i.id === item.id)) return current;
            return [{ ...item, addedAt: Date.now() }, ...current].slice(0, 50);
        });
    }, []);

    const removeItem = React.useCallback((id: string) => {
        setItems((current) => current.filter((i) => i.id !== id));
    }, []);

    const toggleItem = React.useCallback((item: Omit<WishlistItem, "addedAt">) => {
        setItems((current) => {
            if (current.some((i) => i.id === item.id)) {
                return current.filter((i) => i.id !== item.id);
            }
            return [{ ...item, addedAt: Date.now() }, ...current].slice(0, 50);
        });
    }, []);

    const isInWishlist = React.useCallback((id: string) => {
        return items.some((i) => i.id === id);
    }, [items]);

    const clearWishlist = React.useCallback(() => setItems([]), []);

    const count = items.length;

    const contextValue = React.useMemo(() => ({
        items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist, count,
    }), [items, addItem, removeItem, toggleItem, isInWishlist, clearWishlist, count]);

    return (
        <WishlistContext.Provider value={contextValue}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
