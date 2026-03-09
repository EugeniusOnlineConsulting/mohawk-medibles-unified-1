import { NextRequest, NextResponse } from "next/server";
import { getAudioStream } from "@/lib/elevenlabs";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const VALID_PERSONAS = new Set(["medagent", "turtle", "trickster"]);

export async function POST(req: NextRequest) {
    // Rate limit: 10 TTS requests per minute per IP
    const limited = applyRateLimit(req, RATE_LIMITS.tts);
    if (limited) return limited;

    try {
        const { text, persona } = await req.json();

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Missing text" },
                { status: 400 }
            );
        }

        // Validate persona — default to medagent if unknown
        const safePersona = VALID_PERSONAS.has(persona) ? persona : "medagent";

        // Trim to ~800 chars max for TTS
        const trimmed = text.slice(0, 800);

        const result = await getAudioStream(trimmed, safePersona);

        if (!result) {
            console.error("[TTS Route] getAudioStream returned null — check ELEVENLABS_API_KEY and voice config");
            return NextResponse.json(
                { error: "TTS generation failed" },
                { status: 502 }
            );
        }

        // Pipe the stream directly — zero buffering for instant playback
        return new Response(result.stream, {
            status: 200,
            headers: {
                "Content-Type": result.contentType,
                "Transfer-Encoding": "chunked",
                "Cache-Control": "public, max-age=3600",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("[TTS Route]", error);
        return NextResponse.json(
            { error: "TTS error" },
            { status: 500 }
        );
    }
}
