"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const MAX_COMPARE = 4;
const STORAGE_KEY = "mohawk-compare";

interface CompareContextType {
  slugs: string[];
  add: (slug: string) => "added" | "removed" | "full";
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  count: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSlugs(parsed.slice(0, MAX_COMPARE));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  }, [slugs]);

  const add = useCallback(
    (slug: string): "added" | "removed" | "full" => {
      let result: "added" | "removed" | "full" = "added";
      setSlugs((prev) => {
        if (prev.includes(slug)) {
          result = "removed";
          return prev.filter((s) => s !== slug);
        }
        if (prev.length >= MAX_COMPARE) {
          result = "full";
          return prev;
        }
        result = "added";
        return [...prev, slug];
      });
      return result;
    },
    []
  );

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => {
    setSlugs([]);
  }, []);

  const has = useCallback(
    (slug: string) => slugs.includes(slug),
    [slugs]
  );

  return (
    <CompareContext.Provider
      value={{ slugs, add, remove, clear, has, count: slugs.length }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
}
