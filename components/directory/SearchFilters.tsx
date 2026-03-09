"use client";

import { Search, MapPin, Filter, Leaf, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SearchFiltersProps {
    provinces: {
        province: string;
        _count: {
            id: number;
        };
    }[];
}

const PROVINCE_NAMES: Record<string, string> = {
    "ON": "Ontario",
    "BC": "British Columbia",
    "AB": "Alberta",
    "QC": "Quebec",
    "MB": "Manitoba",
    "SK": "Saskatchewan",
    "NS": "Nova Scotia",
    "NB": "New Brunswick",
    "NL": "Newfoundland",
    "PE": "PEI",
    "YT": "Yukon",
    "NT": "Northwest Territories",
    "NU": "Nunavut",
};

export function SearchFilters({ provinces }: SearchFiltersProps) {
    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Search</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Search dispensaries..."
                        className="pl-10"
                    />
                </div>
            </div>

            <Separator />

            {/* Location Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Province
                </h3>
                <div className="space-y-2">
                    {provinces.map((p) => (
                        <div key={p.province} className="flex items-center space-x-2">
                            <Checkbox id={`province-${p.province}`} />
                            <Label 
                                htmlFor={`province-${p.province}`}
                                className="text-sm text-muted-foreground cursor-pointer flex-1"
                            >
                                {PROVINCE_NAMES[p.province] || p.province}
                            </Label>
                            <span className="text-xs text-muted-foreground/60">
                                ({p._count.id})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Features Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Features
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="indigenous" />
                        <Label htmlFor="indigenous" className="text-sm text-muted-foreground cursor-pointer flex items-center">
                            <Leaf className="w-3 h-3 mr-1 text-amber-600" />
                            Indigenous Owned
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="first-nations" />
                        <Label htmlFor="first-nations" className="text-sm text-muted-foreground cursor-pointer">
                            First Nations
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="licensed" />
                        <Label htmlFor="licensed" className="text-sm text-muted-foreground cursor-pointer">
                            Licensed
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="delivery" />
                        <Label htmlFor="delivery" className="text-sm text-muted-foreground cursor-pointer">
                            Delivery Available
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="open-now" />
                        <Label htmlFor="open-now" className="text-sm text-muted-foreground cursor-pointer">
                            Open Now
                        </Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Rating Filter */}
            <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Rating
                </h3>
                <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                            <Checkbox id={`rating-${rating}`} />
                            <Label 
                                htmlFor={`rating-${rating}`}
                                className="text-sm text-muted-foreground cursor-pointer flex items-center"
                            >
                                <span className="flex text-yellow-400 mr-1">
                                    {Array.from({ length: rating }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                </span>
                                & Up
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Apply Filters
            </Button>

            <Button variant="outline" className="w-full">
                Clear All
            </Button>
        </div>
    );
}

export default SearchFilters;
