"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface VoiceControlState {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
}

export function useVoiceControl(onCommand?: (text: string) => void): VoiceControlState {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const onCommandRef = useRef(onCommand);

    // Keep callback ref up-to-date without triggering effect re-runs
    useEffect(() => {
        onCommandRef.current = onCommand;
    }, [onCommand]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Web Speech API not supported in this browser.");
            return;
        }

        const speechConfig = new SpeechRecognition();
        speechConfig.continuous = false;
        speechConfig.interimResults = true;
        speechConfig.lang = "en-US";

        speechConfig.onstart = () => setIsListening(true);
        speechConfig.onend = () => setIsListening(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        speechConfig.onresult = (event: any) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript;
            setTranscript(text);

            if (event.results[current].isFinal && onCommandRef.current) {
                onCommandRef.current(text);
            }
        };

        recognitionRef.current = speechConfig;

        return () => {
            try { speechConfig.abort(); } catch { /* ignore */ }
        };
    }, []); // Runs once — stable

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Voice start error", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    return { isListening, transcript, startListening, stopListening };
}
