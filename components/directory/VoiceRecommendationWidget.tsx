"use client";

import { useState } from "react";
import { Mic, Sparkles, X, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VoiceRecommendationWidgetProps {
    dispensary: {
        id: string;
        name: string;
        city: string;
        province: string;
        isIndigenousOwned: boolean;
        averageRating: number;
        reviewCount?: number;
    };
}

export function VoiceRecommendationWidget({ dispensary }: VoiceRecommendationWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateRecommendation = async () => {
        setIsLoading(true);
        
        // Simulate AI voice agent generating recommendation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const recommendations = [
            `${dispensary.name} is highly rated with ${dispensary.averageRating} stars. ` +
            `Located in ${dispensary.city}, they offer quality products and great service. ` +
            `${dispensary.isIndigenousOwned ? "Proudly Indigenous-owned!" : ""}`,
            
            `I recommend ${dispensary.name} for their excellent selection and customer reviews. ` +
            `Many customers in ${dispensary.city} praise their knowledgeable staff.`,
            
            `Based on ${dispensary.reviewCount || 'many'} reviews, ${dispensary.name} ` +
            `is a top choice in ${dispensary.city}. Their ${dispensary.isIndigenousOwned ? 'Indigenous ownership adds to their community connection. ' : ''}` +
            `Worth visiting!`
        ];
        
        setRecommendation(recommendations[Math.floor(Math.random() * recommendations.length)]);
        setIsLoading(false);
    };

    const startVoiceInteraction = () => {
        setIsListening(true);
        
        // Simulate voice listening
        setTimeout(() => {
            setIsListening(false);
            generateRecommendation();
        }, 2000);
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full px-6 py-6 shadow-lg hover:shadow-xl transition-all"
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI Voice Agent
                    <Badge className="ml-2 bg-amber-500 text-white border-0">Premium</Badge>
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96">
            <Card className="shadow-2xl border-2 border-emerald-200">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            AI Voice Assistant
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
                            {isListening ? (
                                <div className="flex gap-1">
                                    <span className="w-2 h-8 bg-emerald-600 animate-pulse" />
                                    <span className="w-2 h-6 bg-emerald-600 animate-pulse delay-75" />
                                    <span className="w-2 h-8 bg-emerald-600 animate-pulse delay-150" />
                                </div>
                            ) : (
                                <Mic className="w-10 h-10 text-emerald-600" />
                            )}
                        </div>
                        
                        <h3 className="font-semibold text-foreground mb-1">
                            {isListening ? "Listening..." : "Ask About This Dispensary"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isListening 
                                ? "Tell me what you're looking for..." 
                                : "Get personalized recommendations from our AI"
                            }
                        </p>
                    </div>

                    {recommendation && (
                        <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-foreground">{recommendation}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Button
                            onClick={startVoiceInteraction}
                            disabled={isListening || isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isListening ? (
                                <>
                                    <span className="animate-pulse">Listening...</span>
                                </>
                            ) : isLoading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Thinking...
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4 mr-2" />
                                    Get Recommendation
                                </>
                            )}
                        </Button>
                        
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => generateRecommendation()}
                                disabled={isLoading}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Text
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <a href={`tel:`}>
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call
                                </a>
                            </Button>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground/60 text-center mt-4">
                        Powered by GLORVIS Voice AI • Premium Listing Feature
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default VoiceRecommendationWidget;
