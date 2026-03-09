"use client";

import { Star, CheckCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        title?: string | null;
        content: string;
        authorName?: string | null;
        verified: boolean;
        sentiment?: string | null;
        createdAt: Date;
    };
}

export function ReviewCard({ review }: ReviewCardProps) {
    const getSentimentColor = (sentiment?: string | null) => {
        switch (sentiment) {
            case "positive":
                return "bg-green-100 text-green-800";
            case "negative":
                return "bg-red-100 text-red-800";
            case "neutral":
                return "bg-muted text-foreground";
            default:
                return "bg-muted text-foreground";
        }
    };

    return (
        <div className="border-b border-border last:border-0 pb-4 last:pb-0">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground/30"
                                }`}
                            />
                        ))}
                    </div>
                    {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                        </Badge>
                    )}
                </div>
                <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
            </div>

            {review.title && (
                <h4 className="font-semibold text-foreground mb-1">{review.title}</h4>
            )}

            <p className="text-foreground text-sm leading-relaxed mb-2">
                {review.content}
            </p>

            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    By {review.authorName || "Anonymous"}
                </span>
                
                {review.sentiment && (
                    <Badge className={`text-xs ${getSentimentColor(review.sentiment)}`}>
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                    </Badge>
                )}
            </div>
        </div>
    );
}

export default ReviewCard;
