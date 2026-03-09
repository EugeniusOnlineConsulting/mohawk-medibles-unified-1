"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    MapPin, 
    Phone, 
    Globe, 
    Mail, 
    Clock, 
    Star, 
    CheckCircle,
    Award,
    Leaf,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "./ReviewCard";
import { GoogleMap } from "./GoogleMap";
import { ProductCard } from "./ProductCard";
import { BusinessHours } from "./BusinessHours";

interface DispensaryDetailProps {
    dispensary: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        descriptionAi?: string | null;
        address: string;
        city: string;
        province: string;
        postalCode: string;
        latitude?: number | null;
        longitude?: number | null;
        phone?: string | null;
        email?: string | null;
        website?: string | null;
        isIndigenousOwned: boolean;
        isFirstNations: boolean;
        isLicensed: boolean;
        licenseNumber?: string | null;
        averageRating: number;
        reviewCount: number;
        dataQualityScore: number;
        hours: {
            dayOfWeek: number;
            openTime?: string | null;
            closeTime?: string | null;
            isClosed: boolean;
        }[];
        reviews: {
            id: string;
            rating: number;
            title?: string | null;
            content: string;
            authorName?: string | null;
            verified: boolean;
            sentiment?: string | null;
            createdAt: Date;
        }[];
        products: {
            id: string;
            name: string;
            category: string;
            strainType?: string | null;
        }[];
        images: {
            id: string;
            url: string;
            altText?: string | null;
            isPrimary: boolean;
        }[];
    };
}

export default function DispensaryDetail({ dispensary }: DispensaryDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const images = dispensary.images.length > 0 
        ? dispensary.images 
        : [{ url: "/placeholder-dispensary.jpg", altText: dispensary.name, isPrimary: true }];

    const primaryImage = images.find(img => img.isPrimary) || images[0];
    const otherImages = images.filter(img => !img.isPrimary);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const getDirectionsUrl = () => {
        const query = encodeURIComponent(`${dispensary.address}, ${dispensary.city}, ${dispensary.province}`);
        return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    };

    const displayedReviews = showAllReviews ? dispensary.reviews : dispensary.reviews.slice(0, 3);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Breadcrumb */}
            <nav className="text-sm mb-6">
                <Link href="/directory" className="text-emerald-600 hover:underline">
                    Directory
                </Link>
                <span className="mx-2 text-muted-foreground/60">/</span>
                <Link 
                    href={`/directory/${dispensary.province.toLowerCase()}`} 
                    className="text-emerald-600 hover:underline"
                >
                    {dispensary.province}
                </Link>
                <span className="mx-2 text-muted-foreground/60">/</span>
                <Link 
                    href={`/directory/${dispensary.province.toLowerCase()}/${dispensary.city.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-emerald-600 hover:underline"
                >
                    {dispensary.city}
                </Link>
                <span className="mx-2 text-muted-foreground/60">/</span>
                <span className="text-muted-foreground">{dispensary.name}</span>
            </nav>

            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Gallery */}
                    <div className="relative h-96 md:h-full min-h-[400px] bg-muted">
                        <Image
                            src={images[currentImageIndex]?.url || primaryImage.url}
                            alt={images[currentImageIndex]?.altText || primaryImage.altText || dispensary.name}
                            fill
                            className="object-cover"
                            priority
                        />
                        
                        {/* Image Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition ${
                                                idx === currentImageIndex ? "bg-white" : "bg-white/50"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {dispensary.isIndigenousOwned && (
                                <Badge className="bg-amber-600 text-white border-0">
                                    <Leaf className="w-3 h-3 mr-1" />
                                    Indigenous Owned
                                </Badge>
                            )}
                            {dispensary.isFirstNations && (
                                <Badge className="bg-emerald-600 text-white border-0">
                                    <Award className="w-3 h-3 mr-1" />
                                    First Nations
                                </Badge>
                            )}
                            {dispensary.isLicensed && (
                                <Badge className="bg-blue-600 text-white border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Licensed
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            {dispensary.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${
                                            star <= Math.round(dispensary.averageRating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground/30"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="font-semibold text-foreground">
                                {dispensary.averageRating.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">
                                ({dispensary.reviewCount} reviews)
                            </span>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-foreground">{dispensary.address}</p>
                                <p className="text-foreground">
                                    {dispensary.city}, {dispensary.province} {dispensary.postalCode}
                                </p>
                            </div>
                        </div>

                        {/* Contact Buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {dispensary.phone && (
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={`tel:${dispensary.phone}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call
                                    </a>
                                </Button>
                            )}
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                                <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                </a>
                            </Button>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                            {dispensary.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <a href={`tel:${dispensary.phone}`} className="hover:text-emerald-600">
                                        {dispensary.phone}
                                    </a>
                                </div>
                            )}
                            {dispensary.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <a href={`mailto:${dispensary.email}`} className="hover:text-emerald-600">
                                        {dispensary.email}
                                    </a>
                                </div>
                            )}
                            {dispensary.website && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <a 
                                        href={dispensary.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="hover:text-emerald-600 flex items-center"
                                    >
                                        Visit Website
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="bg-white p-1 rounded-lg shadow">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({dispensary.reviewCount})</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Description */}
                        <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <p className="text-foreground leading-relaxed whitespace-pre-line">
                                {dispensary.descriptionAi || dispensary.description || 
                                    `${dispensary.name} is a cannabis dispensary located in ${dispensary.city}, ${dispensary.province}. ` +
                                    "Visit us for quality cannabis products and exceptional service."
                                }
                            </p>
                            
                            {dispensary.licenseNumber && (
                                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                                    <p className="text-sm text-emerald-800">
                                        <span className="font-semibold">License:</span> {dispensary.licenseNumber}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Business Hours */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                                Hours
                            </h3>
                            <BusinessHours hours={dispensary.hours} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="products">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-6">Products</h2>
                        {dispensary.products.length > 0 ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dispensary.products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                Product catalog coming soon. Call or visit for current inventory.
                            </p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="reviews">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Reviews</h2>
                            <Button variant="outline">Write a Review</Button>
                        </div>
                        
                        {displayedReviews.length > 0 ? (
                            <div className="space-y-4">
                                {displayedReviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                                
                                {dispensary.reviews.length > 3 && (
                                    <Button
                                        variant="outline"
                                        className="w-full mt-4"
                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                    >
                                        {showAllReviews ? "Show Less" : `Show All ${dispensary.reviewCount} Reviews`}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No reviews yet. Be the first to review!
                            </p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="location">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-2xl font-bold mb-4">Location</h2>
                        
                        {/* Google Map */}
                        {dispensary.latitude && dispensary.longitude ? (
                            <GoogleMap
                                latitude={dispensary.latitude}
                                longitude={dispensary.longitude}
                                name={dispensary.name}
                                address={`${dispensary.address}, ${dispensary.city}`}
                            />
                        ) : (
                            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Map location unavailable</p>
                            </div>
                        )}

                        {/* Address Card */}
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <h3 className="font-semibold mb-2">{dispensary.name}</h3>
                            <p className="text-muted-foreground">{dispensary.address}</p>
                            <p className="text-muted-foreground">
                                {dispensary.city}, {dispensary.province} {dispensary.postalCode}
                            </p>
                            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" asChild>
                                <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                </a>
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
