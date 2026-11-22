import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const API_URL = "https://apihub.agnes-ai.com";
const MODEL = "agnes-video-2.5-flash";

function getApiKey() {
  return process.env.AGNES_API_KEY;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Agnes AI API key is missing." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Please enter a video description." },
        { status: 400 }
      );
    }

    if (prompt.length > 3000) {
      return NextResponse.json(
        { success: false, error: "Video description is too long." },
        { status: 400 }
      );
    }

    const seconds = Math.min(
      12,
      Math.max(4, Number(body.seconds) || 5)
    );

    const allowedRatios = [
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4",
      "21:9",
    ];

    const aspectRatio = allowedRatios.includes(body.aspectRatio)
      ? body.aspectRatio
      : "16:9";

    const response = await fetch(`${API_URL}/v1/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        mode: "text",
        seconds: String(seconds),
        size: "720P",
        aspect_ratio: aspectRatio,
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Agnes video creation error:", response.status, data);

      return NextResponse.json(
        {
          success: false,
          error:
            data?.error?.message ||
            data?.message ||
            "Agnes AI could not start video generation.",
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const videoId = data?.video_id || data?.id;

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Agnes AI returned no video ID." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId,
      model: MODEL,
      status: data.status || "processing",
    });
  } catch (error) {
    console.error("ZENTRIX video error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to start video generation." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Agnes AI API key is missing." },
        { status: 503 }
      );
    }

    const videoId = request.nextUrl.searchParams.get("video_id");

    if (!videoId || videoId.length > 200) {
      return NextResponse.json(
        { success: false, error: "A valid video ID is required." },
        { status: 400 }
      );
    }

    const url = new URL(`${API_URL}/agnesapi`);
    url.searchParams.set("video_id", videoId);
    url.searchParams.set("model_name", MODEL);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data?.message || "Unable to check video progress.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      status: data?.status || "processing",
      progress: data?.progress ?? 0,
      videoUrl: data?.url || null,
      error: data?.error || null,
    });
  } catch (error) {
    console.error("ZENTRIX video status error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to retrieve video status." },
      { status: 500 }
    );
  }
}
