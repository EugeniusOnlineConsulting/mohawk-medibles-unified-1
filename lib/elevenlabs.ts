/**
 * Mohawk Medibles — ElevenLabs TTS Client
 * ════════════════════════════════════════
 * Streaming text-to-speech via ElevenLabs HTTP API.
 * Pipes audio stream directly — zero buffering for instant playback.
 *
 * Model: eleven_v3 (latest, best quality, 70+ languages)
 * Output: mp3_44100_128 (high quality, native browser support)
 */

// ─── Configuration ──────────────────────────────────────────

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = "eleven_v3";
const OUTPUT_FORMAT = "mp3_44100_128";

// ─── Persona Voice Mapping ──────────────────────────────────

interface VoiceConfig {
    voiceId: string;
    voiceName: string;
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
}

const PERSONA_VOICES: Record<string, VoiceConfig> = {
    medagent: {
        voiceId: "XrExE9yKIg1WjnnlVkGX", // Matilda — warm, conversational, modern
        voiceName: "Matilda",
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.35,
        speed: 1.0,
    },
    turtle: {
        voiceId: "pqHfZKP75CvOlQylNhV4", // Bill — deep, calm elder
        voiceName: "Bill",
        stability: 0.65,
        similarity_boost: 0.8,
        style: 0.15,
        speed: 0.9,
    },
    trickster: {
        voiceId: "iP95p4xoKVk53GoZ742B", // Chris — energetic, natural
        voiceName: "Chris",
        stability: 0.4,
        similarity_boost: 0.7,
        style: 0.6,
        speed: 1.1,
    },
};

// ─── Streaming TTS (pipes directly — no buffering) ──────────

export async function getAudioStream(
    text: string,
    persona: string = "medagent"
): Promise<{ stream: ReadableStream; contentType: string } | null> {
    if (!ELEVENLABS_API_KEY) {
        console.error("[ElevenLabs] No API key configured");
        return null;
    }

    const config = PERSONA_VOICES[persona] || PERSONA_VOICES.medagent;

    // eleven_v3 does NOT support optimize_streaming_latency — omit it
    const response = await fetch(
        `${BASE_URL}/${config.voiceId}/stream?output_format=${OUTPUT_FORMAT}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: MODEL_ID,
                voice_settings: {
                    stability: config.stability,
                    similarity_boost: config.similarity_boost,
                    style: config.style,
                    speed: config.speed,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ElevenLabs] TTS error (${response.status}):`, errorText);
        return null;
    }

    if (!response.body) {
        console.error("[ElevenLabs] No response body");
        return null;
    }

    return {
        stream: response.body as unknown as ReadableStream,
        contentType: response.headers.get("content-type") || "audio/mpeg",
    };
}

// ─── Legacy buffer method (kept for compatibility) ──────────

export async function streamAudio(
    text: string,
    persona: string = "medagent"
): Promise<Buffer | null> {
    const result = await getAudioStream(text, persona);
    if (!result) return null;

    const reader = (result.stream as any).getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    return Buffer.concat(chunks);
}
