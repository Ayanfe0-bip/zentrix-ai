import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const AGNES_URL = "https://apihub.agnes-ai.com";
const AGNES_MODEL = "agnes-video-2.5-flash";

const MAGIC_HOUR_URL = "https://api.magichour.ai";
const MAGIC_HOUR_MODEL = "ltx-2.5";

function jsonError(message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

function isAgnesQueueFull(message: string) {
  return message.toLowerCase().includes("queue is full");
}

async function createAgnesVideo(
  apiKey: string,
  prompt: string,
  seconds: number,
  aspectRatio: string
) {
  const response = await fetch(`${AGNES_URL}/v1/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AGNES_MODEL,
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
    const message =
      data?.error?.message ||
      data?.message ||
      "Agnes AI could not start video generation.";

    return { success: false as const, message };
  }

  const videoId = data?.video_id || data?.id;

  if (!videoId) {
    return {
      success: false as const,
      message: "Agnes AI returned no video ID.",
    };
  }

  return {
    success: true as const,
    videoId,
    status: data?.status || "processing",
  };
}

async function createMagicHourVideo(
  apiKey: string,
  prompt: string,
  seconds: number,
  aspectRatio: string
) {
  const response = await fetch(
    `${MAGIC_HOUR_URL}/v1/text-to-video`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "ZENTRIX AI Video",
        end_seconds: Math.min(5, Math.max(3, seconds)),
        aspect_ratio: aspectRatio,
        style: {
          prompt,
        },
        model: MAGIC_HOUR_MODEL,
        resolution: "480p",
        audio: true,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(
      "Magic Hour creation error:",
      response.status,
      data
    );

    return {
      success: false as const,
      message:
        data?.message ||
        data?.error?.message ||
        (response.status === 402
          ? "Magic Hour credits are insufficient. No further attempt was made."
          : "Magic Hour could not start video generation."),
    };
  }

  if (!data?.id) {
    return {
      success: false as const,
      message: "Magic Hour returned no video project ID.",
    };
  }

  return {
    success: true as const,
    videoId: data.id,
    status: "queued",
  };
}

export async function POST(request: NextRequest) {
  try {
    const agnesKey = process.env.AGNES_API_KEY;
    const magicHourKey = process.env.MAGIC_HOUR_API_KEY;

    if (!agnesKey) {
      return jsonError("Agnes AI API key is missing.", 503);
    }

    const body = await request.json();

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return jsonError("Please enter a video description.", 400);
    }

    if (prompt.length > 3000) {
      return jsonError("Video description is too long.", 400);
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

    // Try Agnes first.
    const agnes = await createAgnesVideo(
      agnesKey,
      prompt,
      seconds,
      aspectRatio
    );

    if (agnes.success) {
      return NextResponse.json({
        success: true,
        videoId: agnes.videoId,
        provider: "agnes",
        status: agnes.status,
      });
    }

    console.error("Agnes video error:", agnes.message);

    // Only consider Magic Hour when Agnes reports a full queue.
    if (!isAgnesQueueFull(agnes.message)) {
      return jsonError(agnes.message, 502);
    }

    // Backup is disabled unless explicitly enabled in Vercel.
    if (
      process.env.MAGIC_HOUR_FREE_FALLBACK_ENABLED !== "true"
    ) {
      return jsonError(
        "Agnes AI's queue is full. The Magic Hour backup is currently disabled.",
        503
      );
    }

    if (!magicHourKey) {
      return jsonError(
        "Agnes AI's queue is full and the Magic Hour API key is missing.",
        503
      );
    }

    // Submit to Magic Hour.
    const magicHour = await createMagicHourVideo(
      magicHourKey,
      prompt,
      seconds,
      aspectRatio
    );

    if (!magicHour.success) {
      return jsonError(magicHour.message, 502);
    }

    return NextResponse.json({
      success: true,
      videoId: `mh:${magicHour.videoId}`,
      provider: "magic-hour",
      status: magicHour.status,
    });
  } catch (error) {
    console.error("ZENTRIX video creation error:", error);

    return jsonError(
      "Unable to start video generation.",
      500
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get("video_id");

    if (!videoId || videoId.length > 250) {
      return jsonError("A valid video ID is required.", 400);
    }

    // Magic Hour status check.
    if (videoId.startsWith("mh:")) {
      const apiKey = process.env.MAGIC_HOUR_API_KEY;

      if (!apiKey) {
        return jsonError(
          "Magic Hour API key is missing.",
          503
        );
      }

      const projectId = videoId.slice(3);

      if (!projectId) {
        return jsonError("Invalid Magic Hour project ID.", 400);
      }

      const response = await fetch(
        `${MAGIC_HOUR_URL}/v1/video-projects/${encodeURIComponent(projectId)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return jsonError(
          data?.message || "Unable to check Magic Hour progress.",
          502
        );
      }

      const status = String(data?.status || "queued").toLowerCase();

      const videoUrl =
        data?.downloads?.[0]?.url ||
        data?.download?.url ||
        null;

      const progress =
        status === "complete"
          ? 100
          : status === "rendering"
            ? 60
            : status === "queued"
              ? 10
              : 0;

      return NextResponse.json({
        success: true,
        provider: "magic-hour",
        status,
        progress,
        videoUrl,
        error:
          data?.error?.message ||
          data?.error?.code ||
          null,
      });
    }

    // Agnes status check.
    const apiKey = process.env.AGNES_API_KEY;

    if (!apiKey) {
      return jsonError("Agnes AI API key is missing.", 503);
    }

    const url = new URL(`${AGNES_URL}/agnesapi`);

    url.searchParams.set("video_id", videoId);
    url.searchParams.set("model_name", AGNES_MODEL);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return jsonError(
        data?.message || "Unable to check video progress.",
        502
      );
    }

    return NextResponse.json({
      success: true,
      provider: "agnes",
      status: data?.status || "processing",
      progress: data?.progress ?? 0,
      videoUrl: data?.url || null,
      error: data?.error || null,
    });
  } catch (error) {
    console.error("ZENTRIX video status error:", error);

    return jsonError(
      "Unable to retrieve video status.",
      500
    );
  }
    }
