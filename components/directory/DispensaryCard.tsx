"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, Leaf, Award, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DispensaryCardProps {
    dispensary: {
        id: string;
        name: string;
        slug: string;
        address: string;
        city: string;
        province: string;
        averageRating: number;
        reviewCount: number;
        isIndigenousOwned: boolean;
        isFirstNations: boolean;
        isLicensed: boolean;
        dataQualityScore: number;
        images: {
            url: string;
            altText?: string | null;
        }[];
        hours: {
            dayOfWeek: number;
            isClosed: boolean;
            openTime?: string | null;
            closeTime?: string | null;
        }[];
    };
}

export function DispensaryCard({ dispensary }: DispensaryCardProps) {
    const today = new Date().getDay();
    const todayHours = dispensary.hours.find(h => h.dayOfWeek === today);
    
    const isOpen = () => {
        if (!todayHours || todayHours.isClosed) return false;
        if (!todayHours.openTime || !todayHours.closeTime) return false;
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
        const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
        
        const currentTime = currentHour * 60 + currentMinute;
        const openTime = openHour * 60 + openMin;
        const closeTime = closeHour * 60 + closeMin;
        
        return currentTime >= openTime && currentTime < closeTime;
    };

    const primaryImage = dispensary.images[0]?.url || "/placeholder-dispensary.jpg";

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
                <Image
                    src={primaryImage}
                    alt={dispensary.images[0]?.altText || dispensary.name}
                    fill
                    className="object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {dispensary.isIndigenousOwned && (
                        <Badge className="bg-amber-600 text-white border-0 text-xs">
                            <Leaf className="w-3 h-3 mr-1" />
                            Indigenous Owned
                        </Badge>
                    )}
                    {dispensary.isFirstNations && (
                        <Badge className="bg-emerald-600 text-white border-0 text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            First Nations
                        </Badge>
                    )}
                </div>

                {/* Premium Badge */}
                {dispensary.dataQualityScore > 70 && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                            <BadgeCheck className="w-3 h-3 mr-1" />
                            Premium
                        </Badge>
                    </div>
                )}

                {/* Open/Closed Badge */}
                <div className="absolute bottom-3 right-3">
                    <Badge 
                        className={`${isOpen() 
                            ? "bg-green-500 text-white" 
                            : "bg-red-500 text-white"
                        } border-0`}
                    >
                        {isOpen() ? "Open" : "Closed"}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">
                        {dispensary.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">
                                {dispensary.averageRating.toFixed(1)}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            ({dispensary.reviewCount} reviews)
                        </span>
                        {dispensary.isLicensed && (
                            <Badge variant="outline" className="text-xs">
                                Licensed
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                        {dispensary.address}, {dispensary.city}
                    </span>
                </div>

                {/* Hours */}
                {todayHours && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>
                            {todayHours.isClosed 
                                ? "Closed today" 
                                : `Open today: ${todayHours.openTime} - ${todayHours.closeTime}`
                            }
                        </span>
                    </div>
                )}

                {/* CTA */}
                <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    asChild
                >
                    <Link href={`/directory/dispensary/${dispensary.slug}`}>
                        View Details
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default DispensaryCard;
