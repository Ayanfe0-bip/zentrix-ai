import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Voice transcription is not configured." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "No voice recording was received." },
        { status: 400 }
      );
    }

    if (audio.size === 0 || audio.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Recording must be smaller than 20 MB." },
        { status: 413 }
      );
    }

    const upload = new FormData();

    upload.append("file", audio, audio.name || "voice.webm");
    upload.append("model", "whisper-large-v3-turbo");
    upload.append("response_format", "json");
    upload.append("temperature", "0");

    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: upload,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Groq transcription error:", result);

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "Could not transcribe your recording.",
        },
        { status: 502 }
      );
    }

    const text =
      typeof result.text === "string"
        ? result.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        { error: "No speech was detected in the recording." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("Voice transcription error:", error);

    return NextResponse.json(
      { error: "Voice transcription failed. Please try again." },
      { status: 500 }
    );
  }
        }
