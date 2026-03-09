"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        // Prevent hydration mismatch — render placeholder during SSR
        return (
            <Button variant="ghost" size="icon" className="text-cream/70 hover:text-white hover:bg-white/5 w-8 h-8">
                <div className="h-4 w-4" />
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="text-cream/70 hover:text-white hover:bg-white/5 w-8 h-8 transition-all duration-300"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
        </Button>
    );
}
