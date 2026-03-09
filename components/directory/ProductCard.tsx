"use client";

import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        category: string;
        strainType?: string | null;
    };
}

export function ProductCard({ product }: ProductCardProps) {
    const getStrainColor = (strain?: string | null) => {
        switch (strain?.toLowerCase()) {
            case "indica":
                return "bg-purple-100 text-purple-800";
            case "sativa":
                return "bg-yellow-100 text-yellow-800";
            case "hybrid":
                return "bg-green-100 text-green-800";
            default:
                return "bg-muted text-foreground";
        }
    };

    const getCategoryIcon = (category: string) => {
        return <Leaf className="w-4 h-4" />;
    };

    return (
        <div className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition">
            <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs capitalize">
                    {getCategoryIcon(product.category)}
                    <span className="ml-1">{product.category}</span>
                </Badge>
                
                {product.strainType && (
                    <Badge className={`text-xs ${getStrainColor(product.strainType)}`}>
                        {product.strainType}
                    </Badge>
                )}
            </div>
            
            <h4 className="font-medium text-foreground">{product.name}</h4>
        </div>
    );
}

export default ProductCard;
