/**
 * MedAgent Sentiment Analysis & Emotional Intelligence
 * ═════════════════════════════════════════════════════
 * Lightweight, zero-dependency sentiment engine that:
 *   1. Detects user mood from message text
 *   2. Tracks emotional trajectory across a session
 *   3. Suggests response tone adjustments
 *
 * No external API call — runs in <1ms via lexicon scoring.
 */

// ─── Mood Types ────────────────────────────────────────────

export type Mood =
    | "happy"       // excited, grateful, satisfied
    | "curious"     // exploring, asking questions, learning
    | "frustrated"  // confused by process, impatient, annoyed
    | "anxious"     // worried about quality, legality, dosing
    | "confused"    // doesn't understand, needs guidance
    | "neutral";    // standard browsing, no strong emotion

export interface SentimentResult {
    mood: Mood;
    confidence: number;   // 0–1 how confident we are in the classification
    intensity: number;    // 0–1 how strong the emotion is
    signals: string[];    // which words/patterns triggered
}

export interface EmotionalContext {
    currentMood: Mood;
    moodHistory: Mood[];
    frustrationLevel: number;  // 0–5, escalates with repeated frustration
    rapport: number;           // 0–10, builds with positive interactions
    needsEmpathy: boolean;     // true if user seems to need extra care
    toneSuggestion: ToneSuggestion;
}

export type ToneSuggestion =
    | "warm-and-friendly"      // default for happy/neutral
    | "extra-patient"          // for confused users
    | "reassuring"             // for anxious users
    | "empathetic-recovery"    // for frustrated users
    | "match-enthusiasm"       // for excited/happy users
    | "gently-humorous";       // when rapport is high

// ─── Lexicon ───────────────────────────────────────────────

const HAPPY_SIGNALS = [
    /\b(love|amazing|awesome|perfect|great|excellent|wonderful|fantastic|beautiful|incredible|best)\b/i,
    /\b(thank|thanks|thx|ty|appreciate|grateful)\b/i,
    /\b(excited|can't wait|stoked|pumped|thrilled|hyped)\b/i,
    /!{2,}/,  // multiple exclamation marks
    /\b(yay|woohoo|hell\s*yeah|nice|sweet)\b/i,
    /[😊🥰😍🎉👏❤️💚🔥✨🙌💯]{1,}/,
];

const FRUSTRATED_SIGNALS = [
    /\b(frustrated|annoying|annoyed|irritated|upset|angry|mad|ridiculous)\b/i,
    /\b(doesn't work|not working|broken|stuck|can't|won't let me)\b/i,
    /\b(terrible|horrible|worst|awful|useless|stupid|dumb|trash)\b/i,
    /\b(waste of|rip\s*off|scam|fake)\b/i,
    /\b(again|still|already told you|already said)\b/i,
    /\?{2,}/,  // multiple question marks (impatience)
    /[😤😡🙄😒]{1,}/,
];

const ANXIOUS_SIGNALS = [
    /\b(worried|nervous|scared|afraid|concern|safe|legal|legit|trustworthy)\b/i,
    /\b(first time|never (tried|ordered|used)|new to (this|cannabis|weed))\b/i,
    /\b(is it safe|will it|what if|side effect|overdose|too much|too strong)\b/i,
    /\b(discreet|private|privacy|someone find out|neighbors)\b/i,
    /\b(health|medical|condition|interact|medication)\b/i,
    /[😰😟😨🥺]{1,}/,
];

const CONFUSED_SIGNALS = [
    /\b(confused|don't understand|what does|what is|how do|what's the difference)\b/i,
    /\b(huh|what\??|i'm lost|makes no sense|wdym|idk)\b/i,
    /\b(explain|help me understand|not sure|unclear|which one)\b/i,
    /\b(beginner|newbie|noob|starter|first timer)\b/i,
    /[🤔😵💫🫤]{1,}/,
];

const CURIOUS_SIGNALS = [
    /\b(tell me (about|more)|what('s| is) .+\?|how .+\?|why .+\?)\b/i,
    /\b(recommend|suggest|best for|good for|which .+ (for|should))\b/i,
    /\b(curious|wondering|interested|want to (know|learn|try))\b/i,
    /\b(compare|vs|versus|difference|better)\b/i,
    /\b(any .+ for|options for|looking for)\b/i,
];

// ─── Sentiment Analysis ───────────────────────────────────

export function analyzeSentiment(message: string): SentimentResult {
    const scores: Record<Mood, { score: number; signals: string[] }> = {
        happy: { score: 0, signals: [] },
        frustrated: { score: 0, signals: [] },
        anxious: { score: 0, signals: [] },
        confused: { score: 0, signals: [] },
        curious: { score: 0, signals: [] },
        neutral: { score: 1, signals: [] }, // baseline
    };

    // Score each mood
    for (const pattern of HAPPY_SIGNALS) {
        const match = message.match(pattern);
        if (match) {
            scores.happy.score += 2;
            scores.happy.signals.push(match[0]);
        }
    }

    for (const pattern of FRUSTRATED_SIGNALS) {
        const match = message.match(pattern);
        if (match) {
            scores.frustrated.score += 3; // weight frustration higher — important to catch
            scores.frustrated.signals.push(match[0]);
        }
    }

    for (const pattern of ANXIOUS_SIGNALS) {
        const match = message.match(pattern);
        if (match) {
            scores.anxious.score += 2.5;
            scores.anxious.signals.push(match[0]);
        }
    }

    for (const pattern of CONFUSED_SIGNALS) {
        const match = message.match(pattern);
        if (match) {
            scores.confused.score += 2;
            scores.confused.signals.push(match[0]);
        }
    }

    for (const pattern of CURIOUS_SIGNALS) {
        const match = message.match(pattern);
        if (match) {
            scores.curious.score += 1.5;
            scores.curious.signals.push(match[0]);
        }
    }

    // ALL CAPS detection (frustration amplifier)
    const upperRatio = (message.replace(/[^A-Z]/g, "").length) / Math.max(message.replace(/[^A-Za-z]/g, "").length, 1);
    if (upperRatio > 0.7 && message.length > 5) {
        scores.frustrated.score += 2;
        scores.frustrated.signals.push("ALL_CAPS");
    }

    // Short, curt messages can indicate frustration
    if (message.length < 10 && /^(no|nope|ugh|whatever|fine|ok|k)$/i.test(message.trim())) {
        scores.frustrated.score += 1;
        scores.frustrated.signals.push("curt_response");
    }

    // Find winning mood
    const entries = Object.entries(scores) as [Mood, { score: number; signals: string[] }][];
    entries.sort((a, b) => b[1].score - a[1].score);
    const [topMood, topData] = entries[0];
    const totalScore = entries.reduce((sum, [, d]) => sum + d.score, 0);

    return {
        mood: topMood,
        confidence: Math.min(topData.score / Math.max(totalScore, 1), 1),
        intensity: Math.min(topData.score / 6, 1),
        signals: topData.signals,
    };
}

// ─── Emotional Context Tracking ───────────────────────────

const sessionEmotions = new Map<string, EmotionalContext>();
const emotionLastActiveAt = new Map<string, number>();

const EMOTION_TTL_MS = 35 * 60 * 1000; // 35 minutes
const EMOTION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Cleanup stale emotion entries to prevent memory leaks
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [id, lastActive] of emotionLastActiveAt) {
            if (now - lastActive > EMOTION_TTL_MS) {
                sessionEmotions.delete(id);
                emotionLastActiveAt.delete(id);
            }
        }
    }, EMOTION_CLEANUP_INTERVAL_MS);
}

export function getEmotionalContext(sessionId: string): EmotionalContext {
    return sessionEmotions.get(sessionId) || {
        currentMood: "neutral",
        moodHistory: [],
        frustrationLevel: 0,
        rapport: 3, // start at baseline warmth
        needsEmpathy: false,
        toneSuggestion: "warm-and-friendly",
    };
}

export function updateEmotionalContext(
    sessionId: string,
    sentiment: SentimentResult
): EmotionalContext {
    const ctx = getEmotionalContext(sessionId);

    // Update mood history (keep last 10)
    ctx.moodHistory.push(sentiment.mood);
    if (ctx.moodHistory.length > 10) ctx.moodHistory.shift();
    ctx.currentMood = sentiment.mood;

    // Track frustration escalation
    if (sentiment.mood === "frustrated") {
        ctx.frustrationLevel = Math.min(ctx.frustrationLevel + 1, 5);
    } else if (sentiment.mood === "happy") {
        ctx.frustrationLevel = Math.max(ctx.frustrationLevel - 1, 0);
    }

    // Build rapport over time
    if (sentiment.mood === "happy" || sentiment.mood === "curious") {
        ctx.rapport = Math.min(ctx.rapport + 0.5, 10);
    } else if (sentiment.mood === "frustrated") {
        ctx.rapport = Math.max(ctx.rapport - 0.5, 0);
    } else {
        ctx.rapport = Math.min(ctx.rapport + 0.1, 10); // slow passive build
    }

    // Empathy trigger: frustrated 2+ times, or anxious + high intensity
    ctx.needsEmpathy = ctx.frustrationLevel >= 2 || (sentiment.mood === "anxious" && sentiment.intensity > 0.5);

    // Determine tone suggestion
    ctx.toneSuggestion = suggestTone(ctx, sentiment);

    sessionEmotions.set(sessionId, ctx);
    emotionLastActiveAt.set(sessionId, Date.now());
    return ctx;
}

function suggestTone(ctx: EmotionalContext, sentiment: SentimentResult): ToneSuggestion {
    // Frustrated users need empathetic recovery
    if (sentiment.mood === "frustrated" || ctx.frustrationLevel >= 2) {
        return "empathetic-recovery";
    }

    // Anxious users need reassurance
    if (sentiment.mood === "anxious") {
        return "reassuring";
    }

    // Confused users need patience
    if (sentiment.mood === "confused") {
        return "extra-patient";
    }

    // Happy users with high rapport — match their energy, sprinkle humor
    if (sentiment.mood === "happy" && ctx.rapport >= 5) {
        return "match-enthusiasm";
    }

    // High rapport neutral = room for gentle humor
    if (ctx.rapport >= 6 && sentiment.mood === "neutral") {
        return "gently-humorous";
    }

    return "warm-and-friendly";
}

// ─── Tone Instructions for System Prompt ──────────────────

export function buildToneInstruction(ctx: EmotionalContext): string {
    const base = `\n\nCURRENT EMOTIONAL CONTEXT:
- Customer mood: ${ctx.currentMood} (frustration level: ${ctx.frustrationLevel}/5, rapport: ${Math.round(ctx.rapport)}/10)
- Needs empathy: ${ctx.needsEmpathy ? "YES — be extra gentle and acknowledging" : "no"}`;

    const toneMap: Record<ToneSuggestion, string> = {
        "warm-and-friendly": `
TONE: Warm and friendly. Be your natural helpful self — conversational, knowledgeable, with genuine warmth. A light touch of humour is welcome.`,

        "extra-patient": `
TONE: Extra patient. This customer is confused or learning. Break things down simply. Use analogies. Don't assume knowledge. Encourage questions. "No worries, let me break that down for you..."`,

        "reassuring": `
TONE: Reassuring and calm. This customer has concerns. Validate their feelings first ("That's a totally fair question..."). Provide clear, factual reassurance. Mention lab testing, discreet packaging, and safety practices proactively.`,

        "empathetic-recovery": `
TONE: Empathetic recovery mode. This customer is frustrated. FIRST acknowledge their frustration genuinely ("I hear you, that's not the experience we want for you"). Then focus on solving their problem directly. Be concise and action-oriented. No fluff.`,

        "match-enthusiasm": `
TONE: Match their enthusiasm! This customer is excited and engaged. Mirror their energy. Use exclamation marks naturally. Share in their excitement about products. Light humour and personality are encouraged.`,

        "gently-humorous": `
TONE: Gently humorous. You've built good rapport with this customer. Feel free to be a bit playful and witty while staying helpful. Cannabis-culture-appropriate humour is fine. Keep it tasteful and warm.`,
    };

    return base + toneMap[ctx.toneSuggestion];
}

// ─── Cleanup ──────────────────────────────────────────────

export function clearEmotionalContext(sessionId: string): void {
    sessionEmotions.delete(sessionId);
}
