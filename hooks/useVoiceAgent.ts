"use client";

/**
 * useVoiceAgent — React hook for Gemini voice shopping assistant
 * ══════════════════════════════════════════════════════════════
 * Manages the full voice agent lifecycle:
 *   • Session creation & persistence
 *   • Speech recognition (Web Speech API)
 *   • API calls to /api/sage/voice
 *   • Action execution (navigate, add-to-cart, search, filter)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

// ─── Types ──────────────────────────────────────────────────

export interface VoiceMessage {
    id: number;
    text: string;
    sender: "user" | "agent";
    model?: "flash" | "pro";
    timestamp: number;
}

interface VoiceAction {
    type: "NAVIGATE" | "ADD_TO_CART" | "SEARCH" | "FILTER";
    payload: string;
}

interface VoiceAgentState {
    messages: VoiceMessage[];
    isListening: boolean;
    isProcessing: boolean;
    isConnected: boolean;
    sessionId: string | null;
    transcript: string;
}

// ─── Hook ───────────────────────────────────────────────────

export function useVoiceAgent() {
    const router = useRouter();
    const { addItem } = useCart();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const [state, setState] = useState<VoiceAgentState>({
        messages: [
            {
                id: 0,
                text: "Welcome to Mohawk Medibles! I'm your AI shopping assistant. Ask me anything about our products, or tell me what you're looking for.",
                sender: "agent",
                timestamp: Date.now(),
            },
        ],
        isListening: false,
        isProcessing: false,
        isConnected: true,
        sessionId: null,
        transcript: "",
    });

    // Initialize session ID on mount
    useEffect(() => {
        const stored = sessionStorage.getItem("sage_session_id");
        if (stored) {
            setState((prev) => ({ ...prev, sessionId: stored }));
        }
    }, []);

    // ── Send message to API ────────────────────────────────

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            // Add user message
            const userMsg: VoiceMessage = {
                id: Date.now(),
                text: text.trim(),
                sender: "user",
                timestamp: Date.now(),
            };

            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, userMsg],
                isProcessing: true,
                transcript: "",
            }));

            try {
                const response = await fetch("/api/sage/voice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text.trim(),
                        sessionId: state.sessionId,
                        metadata: {
                            page: window.location.pathname,
                        },
                    }),
                });

                if (!response.ok) throw new Error("API error");

                const data = await response.json();

                // Persist session ID
                if (data.sessionId && !state.sessionId) {
                    sessionStorage.setItem("sage_session_id", data.sessionId);
                    setState((prev) => ({ ...prev, sessionId: data.sessionId }));
                }

                // Add agent response
                const agentMsg: VoiceMessage = {
                    id: Date.now() + 1,
                    text: data.text,
                    sender: "agent",
                    model: data.model,
                    timestamp: Date.now(),
                };

                setState((prev) => ({
                    ...prev,
                    messages: [...prev.messages, agentMsg],
                    isProcessing: false,
                }));

                // Execute actions
                if (data.actions?.length) {
                    executeActions(data.actions);
                }

                // Speak the response (if voice mode active)
                if (state.isListening || recognitionRef.current) {
                    speak(data.text);
                }
            } catch (error) {
                console.error("[VoiceAgent] Error:", error);
                const errorMsg: VoiceMessage = {
                    id: Date.now() + 1,
                    text: "I'm having trouble connecting right now. Please try again.",
                    sender: "agent",
                    timestamp: Date.now(),
                };
                setState((prev) => ({
                    ...prev,
                    messages: [...prev.messages, errorMsg],
                    isProcessing: false,
                }));
            }
        },
        [state.sessionId, state.isListening]
    );

    // ── Execute Actions ────────────────────────────────────

    const executeActions = useCallback(
        (actions: VoiceAction[]) => {
            for (const action of actions) {
                switch (action.type) {
                    case "NAVIGATE":
                        router.push(action.payload);
                        break;
                    case "ADD_TO_CART":
                        try {
                            const product = JSON.parse(action.payload);
                            addItem({ ...product, quantity: 1 });
                        } catch (e) {
                            console.error("[VoiceAgent] Failed to parse ADD_TO_CART payload", e);
                        }
                        break;
                    case "SEARCH":
                        router.push(`/shop?search=${encodeURIComponent(action.payload)}`);
                        break;
                    case "FILTER":
                        router.push(`/shop?category=${encodeURIComponent(action.payload)}`);
                        break;
                }
            }
        },
        [router, addItem]
    );

    // ── Speech Recognition ─────────────────────────────────

    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("[VoiceAgent] Speech Recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-CA";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setState((prev) => ({ ...prev, transcript }));

            // If final result, send to API
            if (event.results[event.results.length - 1].isFinal) {
                sendMessage(transcript);
            }
        };

        recognition.onend = () => {
            setState((prev) => ({ ...prev, isListening: false }));
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
            console.error("[VoiceAgent] Speech error:", event.error);
            setState((prev) => ({ ...prev, isListening: false }));
        };

        recognitionRef.current = recognition;
        recognition.start();
        setState((prev) => ({ ...prev, isListening: true }));
    }, [sendMessage]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setState((prev) => ({ ...prev, isListening: false }));
    }, []);

    // ── Text-to-Speech ─────────────────────────────────────

    const speak = useCallback((text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.lang = "en-CA";
        window.speechSynthesis.speak(utterance);
    }, []);

    // ── Clear Chat ─────────────────────────────────────────

    const clearChat = useCallback(() => {
        setState((prev) => ({
            ...prev,
            messages: [prev.messages[0]], // Keep welcome message
            sessionId: null,
        }));
        sessionStorage.removeItem("sage_session_id");
    }, []);

    return {
        ...state,
        sendMessage,
        startListening,
        stopListening,
        clearChat,
    };
}
