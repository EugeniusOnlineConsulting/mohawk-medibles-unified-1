"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, TrendingDown } from "lucide-react";
import { getBulkPricingTiers, isWeightBasedProduct, type BulkPricingTier } from "@/lib/bulkPricing";

interface ProductForPricing {
    price: number;
    category?: string;
    specs?: {
        weight?: string;
    };
    variants?: Array<{
        name: string;
        price: number;
        salePrice?: number | null;
        attributes?: Record<string, string> | null;
        isActive?: boolean;
    }>;
}

interface BulkPricingTiersProps {
    product: ProductForPricing;
    onTierSelect?: (tier: BulkPricingTier) => void;
}

export default function BulkPricingTiers({ product, onTierSelect }: BulkPricingTiersProps) {
    const [tiers, setTiers] = useState<BulkPricingTier[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const computed = getBulkPricingTiers(product);
        setTiers(computed);

        // Set default selection
        const defaultIdx = computed.findIndex(t => t.isDefault);
        if (defaultIdx >= 0) setSelectedIndex(defaultIdx);
    }, [product]);

    if (tiers.length === 0 || !isWeightBasedProduct(product)) return null;

    function handleSelect(index: number) {
        setSelectedIndex(index);
        onTierSelect?.(tiers[index]);
    }

    const selectedTier = tiers[selectedIndex];

    return (
        <div className="mb-6">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-forest dark:text-leaf" />
                <span className="text-sm font-semibold text-forest dark:text-cream">
                    Choose Your Size
                </span>
                <span className="text-xs text-muted-foreground">
                    — Save more when you buy bigger
                </span>
            </div>

            {/* Tier swatches */}
            <div className="flex flex-wrap gap-2">
                {tiers.map((tier, i) => {
                    const isSelected = i === selectedIndex;
                    const hasSavings = tier.savingsPercent > 0;

                    return (
                        <motion.button
                            key={tier.weight}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(i)}
                            className={`relative flex flex-col items-center px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[80px] ${
                                isSelected
                                    ? "bg-forest text-white dark:bg-leaf dark:text-charcoal-deep shadow-lg ring-2 ring-forest/30 dark:ring-leaf/30"
                                    : "bg-white dark:bg-card border border-border hover:border-forest/40 dark:hover:border-leaf/40 hover:shadow-md"
                            }`}
                        >
                            {/* Savings badge */}
                            {hasSavings && (
                                <span className={`absolute -top-2 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    isSelected
                                        ? "bg-amber-400 text-amber-900"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                }`}>
                                    -{tier.savingsPercent}%
                                </span>
                            )}

                            {/* Weight */}
                            <span className={`text-sm font-bold ${
                                isSelected ? "" : "text-forest dark:text-cream"
                            }`}>
                                {tier.weight}
                            </span>

                            {/* Total price */}
                            <span className={`text-base font-bold mt-0.5 ${
                                isSelected ? "" : "text-foreground"
                            }`}>
                                ${tier.totalPrice.toFixed(2)}
                            </span>

                            {/* Price per gram */}
                            <span className={`text-[10px] mt-0.5 ${
                                isSelected ? "text-white/80 dark:text-charcoal-deep/70" : "text-muted-foreground"
                            }`}>
                                ${tier.pricePerGram.toFixed(2)}/g
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected tier info bar */}
            {selectedTier && (
                <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-3 text-sm"
                >
                    <span className="font-medium text-forest dark:text-leaf">
                        {selectedTier.weight} — ${selectedTier.totalPrice.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                        (${selectedTier.pricePerGram.toFixed(2)} per gram)
                    </span>
                    {selectedTier.savingsPercent > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <TrendingDown className="h-3 w-3" />
                            Save {selectedTier.savingsPercent}% vs single gram
                        </span>
                    )}
                </motion.div>
            )}
        </div>
    );
}
