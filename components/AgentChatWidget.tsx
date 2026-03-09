"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    MessageCircle, X, Send, Mic, MicOff, Leaf,
    Truck, Sparkles, ChevronDown, Heart,
    Zap, Volume2, VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { getBehavior, trackPageVisit } from "@/lib/sage/behavioral";
import {
    getMemory, recordSessionStart, rememberName, rememberPreference,
    rememberTopic, recordMood, acknowledgePrivacy, clearMemory,
    detectNameInMessage, detectPreferences,
} from "@/lib/sage/memory";

// ─── Types ──────────────────────────────────────────────────

interface Message {
    id: number;
    text: string;
    sender: "user" | "medagent";
    mood?: string;
}

interface MedAgentProduct {
    id: string;
    name: string;
    shortName: string;
    category: string;
    price: number;
    slug: string;
    path: string;
}

interface MedAgentAction {
    type: "NAVIGATE" | "ADD_TO_CART" | "REMOVE_FROM_CART" | "CLEAR_CART" | "SEARCH" | "FILTER" | "CHECKOUT";
    payload: string;
}

// ─── Persona Definitions ───────────────────────────────────

type PersonaId = "medagent" | "turtle" | "trickster";

interface Persona {
    id: PersonaId;
    name: string;
    tagline: string;
    icon: React.ReactNode;
    greeting: string;
    inputPlaceholder: string;
    headerGradient: string;
}

const PERSONAS: Record<PersonaId, Persona> = {
    "medagent": {
        id: "medagent",
        name: "MedAgent",
        tagline: "Cannabis Guide",
        icon: <Leaf className="h-4 w-4 text-green-300" />,
        greeting: "Hey there! I'm MedAgent, your personal cannabis guide at Mohawk Medibles. What are you looking for today?",
        inputPlaceholder: "Ask MedAgent anything...",
        headerGradient: "from-green-900 to-green-800",
    },
    "turtle": {
        id: "turtle",
        name: "Wise Turtle",
        tagline: "Ancient Wisdom, Modern Herb",
        icon: <span className="text-base leading-none">🐢</span>,
        greeting: "Ah, welcome, young one. I am Turtle — I have watched these lands for many seasons, and I have learned a thing or two about the medicine plants. Come, tell me what your spirit needs today.",
        inputPlaceholder: "Speak to the Turtle...",
        headerGradient: "from-emerald-900 to-teal-800",
    },
    "trickster": {
        id: "trickster",
        name: "Coyote",
        tagline: "Chaotic Good Vibes Only",
        icon: <Zap className="h-4 w-4 text-orange-300" />,
        greeting: "YOOO what's good?! Coyote in the building! I'm the fun one around here — MedAgent's cool but they follow the rules. Me? I follow the VIBES. So what are we getting into today?",
        inputPlaceholder: "What are we getting into?",
        headerGradient: "from-orange-900 to-amber-800",
    },
};

// ─── Suggestion Chips ───────────────────────────────────────

const SUGGESTION_CHIPS = [
    { label: "Browse Flower", icon: Leaf, message: "Show me your best flower strains" },
    { label: "What's Popular", icon: Zap, message: "What are your most popular products?" },
    { label: "Delivery Info", icon: Truck, message: "What are your delivery zones and shipping times?" },
    { label: "Help Me Choose", icon: Heart, message: "I'm not sure what to get — can you help me pick something?" },
];

// ─── Streaming Text Hook ───────────────────────────────────

function useStreamingText(text: string, speed = 8) {
    const [displayed, setDisplayed] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        if (!text) return;
        setIsStreaming(true);
        setDisplayed("");
        let i = 0;
        // Adaptive speed: faster chunks for longer text to stay in sync with audio
        const chunkSize = text.length > 200 ? 5 : text.length > 100 ? 4 : 3;
        const interval = setInterval(() => {
            const variance = Math.random() > 0.5 ? 1 : 0;
            const chunk = text.slice(i, i + chunkSize + variance);
            setDisplayed((prev) => prev + chunk);
            i += chunk.length;
            if (i >= text.length) {
                clearInterval(interval);
                setDisplayed(text);
                setIsStreaming(false);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayed, isStreaming };
}

function StreamingMessage({ text, isLatest }: { text: string; isLatest: boolean }) {
    const { displayed, isStreaming } = useStreamingText(isLatest ? text : "", 8);
    return (
        <span>
            {isLatest ? displayed : text}
            {isStreaming && <span className="inline-block w-1 h-3.5 bg-green-600 ml-0.5 animate-pulse rounded-sm" />}
        </span>
    );
}

// ─── Welcome Popup (first visit) ────────────────────────────

function WelcomePopup({ onDismiss, onOpen }: { onDismiss: () => void; onOpen: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-3 w-[280px] rounded-2xl bg-card border border-border shadow-xl p-4"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                    <Leaf className="h-4 w-4 text-green-700 dark:text-green-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-foreground">Hey! I&apos;m MedAgent</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Your personal cannabis guide</p>
                </div>
            </div>
            <ul className="space-y-1.5 mb-3 text-xs text-foreground">
                <li className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-green-600 shrink-0" /> Find products by effects or category</li>
                <li className="flex items-center gap-2"><Truck className="h-3 w-3 text-green-600 shrink-0" /> Check delivery zones & shipping</li>
                <li className="flex items-center gap-2"><Mic className="h-3 w-3 text-green-600 shrink-0" /> Voice input — just tap the mic</li>
                <li className="flex items-center gap-2"><Heart className="h-3 w-3 text-green-600 shrink-0" /> Personalized recommendations</li>
            </ul>
            <div className="flex gap-2">
                <button
                    onClick={onOpen}
                    className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-green-800 text-white hover:bg-green-700 transition-colors"
                >
                    Chat Now
                </button>
                <button
                    onClick={onDismiss}
                    className="text-xs px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                    Later
                </button>
            </div>
        </motion.div>
    );
}

// ─── Component ──────────────────────────────────────────────

export default function AgentChatWidget() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [activePersona, setActivePersona] = useState<PersonaId>("medagent");
    const [showPersonaSelector, setShowPersonaSelector] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [latestMsgId, setLatestMsgId] = useState<number | null>(null);
    const [ttsEnabled, setTtsEnabled] = useState(true);

    // Voice input state
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const sendMessageRef = useRef<(msg: string) => Promise<void>>(undefined);
    const { items: cartItems, addItem, removeItem, clearCart, total: cartTotal } = useCart();

    const persona = PERSONAS[activePersona];

    // Track page visit for behavioral intelligence
    useEffect(() => {
        if (typeof window !== "undefined") {
            trackPageVisit(window.location.pathname);
        }
    }, []);

    // Show welcome popup for first-time visitors (after 3s delay)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const dismissed = localStorage.getItem("mm_welcome_dismissed");
        if (dismissed) return;
        const timer = setTimeout(() => {
            if (!isOpen) setShowWelcome(true);
        }, 3000);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initialize greeting with memory-aware personalization
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const memory = recordSessionStart();
            let greeting = persona.greeting;

            // Personalize greeting for returning customers
            if (memory.sessionCount > 1 && memory.preferredName) {
                greeting = `Welcome back, ${memory.preferredName}! Great to see you again. What can I help you with today?`;
            } else if (memory.sessionCount > 1) {
                greeting = `Hey, welcome back! Good to see you again. What are you looking for today?`;
            }

            const msgs: Message[] = [{ id: 0, text: greeting, sender: "medagent" }];

            // Show privacy notice on first interaction
            if (!memory.privacyAcknowledged && memory.sessionCount <= 1) {
                msgs.push({
                    id: 1,
                    text: "Your conversations with me are completely private. I don't share your information with anyone — I'm just here to help you find what you need. Your privacy matters to us.",
                    sender: "medagent",
                });
                acknowledgePrivacy();
            }

            setMessages(msgs);
            setLatestMsgId(msgs[msgs.length - 1].id);
        }
    }, [isOpen, persona.greeting, messages.length]);

    // ── Text-to-Speech with Gemini TTS (browser fallback) ──
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speakWithBrowser = useCallback((text: string, onEnd?: () => void) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            onEnd?.();
            return;
        }
        window.speechSynthesis.cancel();
        const clean = text.replace(/\*\*/g, "").replace(/\n/g, ". ").replace(/•/g, "").replace(/[#_~`]/g, "");
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.85;
        utterance.lang = "en-CA";
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
        utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
        window.speechSynthesis.speak(utterance);
    }, []);

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!ttsEnabled) { onEnd?.(); return; }

        // Stop any current playback
        window.speechSynthesis?.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setIsSpeaking(true);

        const currentPersona = localStorage.getItem("medagent_persona") || "medagent";
        const clean = text.replace(/\*\*/g, "").replace(/\n/g, ". ").replace(/•/g, "").replace(/[#_~`]/g, "");

        // Use streaming approach: pipe audio chunks directly to a MediaSource
        // for near-instant playback as ElevenLabs generates speech
        const controller = new AbortController();

        fetch("/api/sage/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: clean, persona: currentPersona }),
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok || !res.body) throw new Error(`tts-${res.status}`);

                // Collect chunks and start playback as soon as we have data
                const reader = res.body.getReader();
                const chunks: BlobPart[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }

                // Create blob from all chunks and play
                const blob = new Blob(chunks, { type: "audio/mpeg" });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audioRef.current = audio;

                audio.onended = () => {
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    setIsSpeaking(false);
                    onEnd?.();
                };
                audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    setIsSpeaking(false);
                    speakWithBrowser(text, onEnd);
                };

                await audio.play().catch(() => {
                    URL.revokeObjectURL(url);
                    audioRef.current = null;
                    setIsSpeaking(false);
                    speakWithBrowser(text, onEnd);
                });
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                speakWithBrowser(text, onEnd);
            });
    }, [ttsEnabled, speakWithBrowser]);

    // ── Session persistence ─────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = sessionStorage.getItem("medagent_session_id");
        if (saved) setSessionId(saved);
        const savedPersona = localStorage.getItem("medagent_persona");
        if (savedPersona && savedPersona in PERSONAS) setActivePersona(savedPersona as PersonaId);
    }, []);

    useEffect(() => {
        if (sessionId && typeof window !== "undefined") {
            sessionStorage.setItem("medagent_session_id", sessionId);
        }
    }, [sessionId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // ── Switch persona ──────────────────────────────────────
    const switchPersona = useCallback((id: PersonaId) => {
        setActivePersona(id);
        localStorage.setItem("medagent_persona", id);
        setShowPersonaSelector(false);
        const p = PERSONAS[id];
        const greetId = Date.now();
        setMessages([{ id: greetId, text: p.greeting, sender: "medagent" }]);
        setLatestMsgId(greetId);
        setSessionId(null);
        sessionStorage.removeItem("medagent_session_id");
    }, []);

    // ── Handle actions (with streaming-aware delay) ─────────
    const handleActions = useCallback((actions: MedAgentAction[], responseTextLength: number = 0) => {
        // Calculate delay to sync with streaming text completion
        // Streaming: ~3-5 chars per chunk at 8ms intervals ≈ 2.5ms per char + 500ms buffer for reading
        const streamingDuration = Math.max(800, Math.round(responseTextLength * 2.5) + 500);

        for (const action of actions) {
            switch (action.type) {
                case "ADD_TO_CART":
                    try {
                        const product = JSON.parse(action.payload);
                        addItem({ ...product, quantity: 1 });
                    } catch { /* invalid payload */ }
                    break;
                case "REMOVE_FROM_CART": {
                    // Fuzzy-match product name from payload to a cart item
                    const query = action.payload.trim().toLowerCase();
                    const match = cartItems.find((item) =>
                        item.name.toLowerCase().includes(query) ||
                        query.includes(item.name.toLowerCase()) ||
                        item.name.toLowerCase().split(/\s+/).some((w) => query.includes(w) && w.length > 3)
                    );
                    if (match) removeItem(match.id);
                    break;
                }
                case "CLEAR_CART":
                    clearCart();
                    break;
                case "NAVIGATE":
                    setTimeout(() => router.push(action.payload.trim()), streamingDuration);
                    break;
                case "SEARCH":
                    setTimeout(() => router.push(`/shop?search=${encodeURIComponent(action.payload.trim())}`), streamingDuration);
                    break;
                case "FILTER":
                    setTimeout(() => router.push(`/shop?category=${encodeURIComponent(action.payload.trim())}`), streamingDuration);
                    break;
                case "CHECKOUT":
                    setTimeout(() => router.push("/checkout"), streamingDuration);
                    break;
            }
        }
    }, [addItem, removeItem, clearCart, cartItems, router]);

    // ── Start listening (single round) ──────────────────────
    const startListeningRound = useCallback(() => {
        if (typeof window === "undefined") return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        // Abort any in-flight recognition to prevent double instances
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }

        // Cancel TTS so mic doesn't pick it up
        window.speechSynthesis?.cancel();
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        setIsSpeaking(false);

        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-CA";

        let finalTranscript = "";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInputValue(transcript);

            if (event.results[event.results.length - 1].isFinal) {
                finalTranscript = transcript;
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-send if we got a final transcript (use ref for latest version)
            if (finalTranscript.trim()) {
                sendMessageRef.current?.(finalTranscript.trim());
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (e: any) => {
            console.error("[MedAgent Voice]", e.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Send message (direct, no input dependency) ──────────
    const sendMessageDirect = useCallback(async (msg: string) => {
        if (!msg.trim()) return;

        setMessages((prev) => [...prev, { id: Date.now(), text: msg, sender: "user" }]);
        setInputValue("");
        setIsTyping(true);

        try {
            const currentSessionId = sessionStorage.getItem("medagent_session_id");
            const currentPersona = localStorage.getItem("medagent_persona") || "medagent";

            // Attach behavioral + memory context (PIPEDA-compliant, localStorage only)
            const behavior = getBehavior();
            const customerMemory = getMemory();

            // Detect name/preferences in user message and persist
            const detectedName = detectNameInMessage(msg);
            if (detectedName) rememberName(detectedName);
            const detectedPrefs = detectPreferences(msg);
            detectedPrefs.forEach(p => rememberPreference(p));

            const res = await fetch("/api/sage/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msg,
                    sessionId: currentSessionId,
                    persona: currentPersona,
                    behavioralData: behavior,
                    cartTotal: cartTotal > 0 ? cartTotal : undefined,
                    cartItems: cartItems.length > 0 ? cartItems : undefined,
                    memory: customerMemory,
                }),
            });

            const data = await res.json();

            if (data.sessionId) {
                setSessionId(data.sessionId);
                sessionStorage.setItem("medagent_session_id", data.sessionId);
            }

            // Record mood for persistent memory
            if (data.sentiment?.mood) {
                recordMood(data.sentiment.mood);
            }

            // Remember conversation topic (extract key words from message)
            if (msg.length > 5) {
                const topicWords = msg.replace(/[^\w\s]/g, "").trim().slice(0, 60);
                if (topicWords) rememberTopic(topicWords);
            }

            const responseId = Date.now();
            setMessages((prev) => [...prev, {
                id: responseId,
                text: data.text,
                sender: "medagent",
                mood: data.sentiment?.mood,
            }]);
            setLatestMsgId(responseId);

            // Execute actions (synced to streaming text completion)
            if (data.actions?.length > 0) {
                handleActions(data.actions, data.text?.length || 0);
            }

            // Show products
            if (data.products?.length > 0) {
                const productList = data.products
                    .slice(0, 4)
                    .map((p: MedAgentProduct) => `• ${p.shortName || p.name} — $${p.price}`)
                    .join("\n");
                const productMsgId = Date.now() + 1;
                setMessages((prev) => [...prev, {
                    id: productMsgId,
                    text: `Here are some picks:\n${productList}\n\nWant me to add any to your cart?`,
                    sender: "medagent",
                }]);
                setLatestMsgId(productMsgId);
            }

            // TTS playback
            speak(data.text);

        } catch {
            const errId = Date.now();
            setMessages((prev) => [...prev, {
                id: errId,
                text: "I'm having a moment — please try again shortly.",
                sender: "medagent",
            }]);
            setLatestMsgId(errId);
        } finally {
            setIsTyping(false);
        }
    }, [handleActions, speak, cartTotal, cartItems]);

    // Keep sendMessageRef in sync so startListeningRound always calls the latest
    useEffect(() => { sendMessageRef.current = sendMessageDirect; }, [sendMessageDirect]);

    // ── Send from text input ────────────────────────────────
    const sendMessage = useCallback(async (text?: string) => {
        const msg = (text || inputValue).trim();
        if (!msg) return;
        setInputValue("");
        await sendMessageDirect(msg);
    }, [inputValue, sendMessageDirect]);

    // ── Single tap mic (one-shot voice input) ─────────────
    const toggleMic = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            startListeningRound();
        }
    }, [isListening, startListeningRound]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            window.speechSynthesis?.cancel();
            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="medagent-chat-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${persona.name} chat assistant`}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
                    >
                        {/* ── Header ─────────────────────────────────── */}
                        <div className={cn("flex items-center justify-between p-4 text-white bg-gradient-to-r", persona.headerGradient)}>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                    {persona.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-tight leading-none">{persona.name}</h3>
                                    <span className="text-[10px] uppercase tracking-widest opacity-70 font-medium">
                                        {isListening ? "Listening..." : isSpeaking ? "Speaking..." : persona.tagline}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                                    <span className="text-[9px] uppercase tracking-wider font-bold opacity-80">Live</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => {
                                        setTtsEnabled(!ttsEnabled);
                                        if (ttsEnabled) {
                                            window.speechSynthesis?.cancel();
                                            if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
                                            setIsSpeaking(false);
                                        }
                                    }}
                                    title={ttsEnabled ? "Mute voice" : "Unmute voice"}
                                    aria-label={ttsEnabled ? "Mute voice" : "Unmute voice"}
                                >
                                    {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 opacity-50" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => setShowPersonaSelector(!showPersonaSelector)}
                                    title="Switch personality"
                                    aria-label="Switch personality"
                                    aria-expanded={showPersonaSelector}
                                >
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showPersonaSelector && "rotate-180")} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                                    onClick={() => { setIsOpen(false); recognitionRef.current?.abort(); window.speechSynthesis?.cancel(); setIsListening(false); setIsSpeaking(false); }}
                                    aria-label="Close chat"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* ── Persona Selector ──────────────────────── */}
                        <AnimatePresence>
                            {showPersonaSelector && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-b border-border"
                                >
                                    <div className="bg-muted p-3 space-y-1.5">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">Choose your guide</p>
                                        {(Object.values(PERSONAS) as Persona[]).map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => switchPersona(p.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200",
                                                    activePersona === p.id
                                                        ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 text-green-900 dark:text-green-200"
                                                        : "bg-card border border-border text-foreground hover:bg-muted hover:border-border"
                                                )}
                                            >
                                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
                                                    {p.icon}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold leading-tight">{p.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{p.tagline}</div>
                                                </div>
                                                {activePersona === p.id && (
                                                    <div className="ml-auto text-green-600 text-xs font-bold">Active</div>
                                                )}
                                            </button>
                                        ))}
                                        <div className="border-t border-border pt-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    clearMemory();
                                                    localStorage.removeItem("mm_browsing_behavior");
                                                    setMessages([{ id: Date.now(), text: "Your conversation data has been cleared. Fresh start!", sender: "medagent" }]);
                                                    setShowPersonaSelector(false);
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                aria-label="Clear all conversation data"
                                            >
                                                Clear My Data
                                                <span className="block text-[10px] text-muted-foreground/60 mt-0.5">Remove all saved preferences and history</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Messages ────────────────────────────────── */}
                        <div className="h-[340px] sm:h-[380px] overflow-y-auto bg-muted p-4 space-y-3">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-line",
                                        msg.sender === "user"
                                            ? "ml-auto bg-green-800 text-white rounded-br-none"
                                            : "mr-auto bg-card text-foreground rounded-bl-none border border-border"
                                    )}
                                >
                                    {msg.sender === "medagent" ? (
                                        <StreamingMessage text={msg.text} isLatest={msg.id === latestMsgId} />
                                    ) : (
                                        msg.text
                                    )}
                                </motion.div>
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Suggestion Chips ────────────────────────── */}
                        {messages.length <= 2 && !isTyping && (
                            <div className="bg-muted px-3 py-2.5 border-t border-border">
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1.5 px-1">Quick actions</p>
                                <div className="flex flex-wrap gap-1.5 overflow-x-auto">
                                    {SUGGESTION_CHIPS.map((chip) => (
                                        <button
                                            key={chip.label}
                                            onClick={() => sendMessage(chip.message)}
                                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-green-200 dark:border-green-800 bg-card text-green-800 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                                        >
                                            <chip.icon className="h-3 w-3" />
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Input Bar ──────────────────────────────── */}
                        <div className="bg-card p-3 border-t border-border">
                            <div className="flex gap-2">
                                {/* Mic Button (one-shot voice input) */}
                                <Button
                                    size="icon"
                                    variant={isListening ? "destructive" : "outline"}
                                    className={cn(
                                        "rounded-full h-9 w-9 flex-shrink-0 transition-all",
                                        isListening && "animate-pulse"
                                    )}
                                    onClick={toggleMic}
                                    title={isListening ? "Stop listening" : "Voice input"}
                                    aria-label={isListening ? "Stop listening" : "Voice input"}
                                >
                                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                </Button>

                                <label htmlFor="medagent-input" className="sr-only">Message {persona.name}</label>
                                <input
                                    id="medagent-input"
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder={isListening ? "Listening..." : persona.inputPlaceholder}
                                    className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-green-600/50"
                                    aria-label={`Message ${persona.name}`}
                                />
                                <Button
                                    size="icon"
                                    className="rounded-full h-9 w-9 bg-green-800 hover:bg-green-700"
                                    onClick={() => sendMessage()}
                                    disabled={isTyping}
                                    aria-label="Send message"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Listening Status Indicator */}
                            {isListening && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground"
                                >
                                    <span className="flex gap-0.5">
                                        <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                                        <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: "100ms" }} />
                                        <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
                                    </span>
                                    <span>Listening — speak now</span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Welcome Popup ─────────────────────────────── */}
            <AnimatePresence>
                {showWelcome && !isOpen && (
                    <WelcomePopup
                        onDismiss={() => {
                            setShowWelcome(false);
                            localStorage.setItem("mm_welcome_dismissed", "1");
                        }}
                        onOpen={() => {
                            setShowWelcome(false);
                            localStorage.setItem("mm_welcome_dismissed", "1");
                            setIsOpen(true);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ── FAB ────────────────────────────────────────── */}
            <Button
                size="lg"
                data-medagent-fab
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-green-800 hover:bg-green-700 text-white"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
                aria-expanded={isOpen}
                aria-controls="medagent-chat-panel"
            >
                <div className="absolute -top-1 -right-1 bg-green-400 text-green-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5" aria-hidden="true">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI
                </div>
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
}
