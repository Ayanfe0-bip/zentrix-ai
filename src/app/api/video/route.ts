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

function isQueueFull(message: string) {
  return message.toLowerCase().includes("queue is full");
}

async function createAgnesVideo(
  apiKey: string,
  prompt: string,
  seconds: number,
  aspectRatio: string,
  imageDataUrl?: string
) {
  const payload: Record<string, unknown> = {
    model: AGNES_MODEL,
    prompt,
    mode: imageDataUrl ? "img2video" : "text",
    seconds: String(seconds),
    size: "720P",
    aspect_ratio: aspectRatio,
    n: 1,
  };

  if (imageDataUrl) {
    payload.first_frame = imageDataUrl;
  }

  const response = await fetch(`${AGNES_URL}/v1/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false as const,
      message:
        data?.error?.message ||
        data?.message ||
        "Agnes AI could not start video generation.",
    };
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

async function uploadMagicHourImage(
  apiKey: string,
  imageBuffer: Buffer,
  mimeType: string
) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensions[mimeType];

  if (!extension) {
    throw new Error("Please use a JPG, PNG, or WebP image.");
  }

  const uploadResponse = await fetch(
    `${MAGIC_HOUR_URL}/v1/files/upload-urls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            type: "image",
            extension,
          },
        ],
      }),
      cache: "no-store",
    }
  );

  const uploadData = await uploadResponse.json().catch(() => null);

  if (!uploadResponse.ok) {
    throw new Error(
      uploadData?.message ||
      "Magic Hour could not prepare the image upload."
    );
  }

  const uploadItem = uploadData?.items?.[0];

  if (!uploadItem?.upload_url || !uploadItem?.file_path) {
    throw new Error("Magic Hour returned an invalid upload URL.");
  }

  const putResponse = await fetch(uploadItem.upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!putResponse.ok) {
    throw new Error("Unable to upload your image to Magic Hour.");
  }

  return uploadItem.file_path;
}
async function createMagicHourTextVideo(
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
        name: "ZENTRIX AI Text-to-Video",
        end_seconds: seconds,
        resolution: "480p",
        model: MAGIC_HOUR_MODEL,
        aspect_ratio: aspectRatio,
        audio: true,
        style: {
          prompt,
        },
      }),
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false as const,
      message:
        data?.message ||
        data?.error?.message ||
        "Magic Hour could not start text-to-video generation.",
    };
  }

  if (!data?.id) {
    return {
      success: false as const,
      message: "Magic Hour returned no project ID.",
    };
  }

  return {
    success: true as const,
    videoId: data.id,
    status: data.status || "queued",
  };
      }
async function createMagicHourVideo(
  apiKey: string,
  prompt: string,
  seconds: number,
  aspectRatio: string,
  imageBuffer: Buffer,
  mimeType: string
) {
  const filePath = await uploadMagicHourImage(
    apiKey,
    imageBuffer,
    mimeType
  );

  const response = await fetch(
    `${MAGIC_HOUR_URL}/v1/image-to-video`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "ZENTRIX AI Image-to-Video",
        end_seconds: Math.min(5, Math.max(3, seconds)),
        resolution: "480p",
        model: MAGIC_HOUR_MODEL,
        aspect_ratio: aspectRatio,
        assets: {
          image_file_path: filePath,
        },
        style: {
          prompt,
        },
      }),
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false as const,
      message:
        data?.message ||
        data?.error?.message ||
        "Magic Hour could not start image-to-video generation.",
    };
  }

  if (!data?.id) {
    return {
      success: false as const,
      message: "Magic Hour returned no project ID.",
    };
  }

  return {
    success: true as const,
    videoId: data.id,
    status: data.status || "queued",
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

    let imageDataUrl: string | undefined;
    let imageBuffer: Buffer | undefined;
    let mimeType = "image/jpeg";

    if (body.imageDataUrl) {
      if (typeof body.imageDataUrl !== "string") {
        return jsonError("Invalid image upload.", 400);
      }

      const match = body.imageDataUrl.match(
        /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/
      );

      if (!match) {
        return jsonError(
          "Please upload a JPG, PNG, or WebP image.",
          400
        );
      }

      mimeType = match[1];

      imageBuffer = Buffer.from(match[2], "base64");

      if (imageBuffer.length > 3 * 1024 * 1024) {
        return jsonError(
          "Please upload an image smaller than 3MB.",
          400
        );
      }

      imageDataUrl = body.imageDataUrl;
    }

    const agnes = await createAgnesVideo(
      agnesKey,
      prompt,
      seconds,
      aspectRatio,
      imageDataUrl
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

    if (!isQueueFull(agnes.message)) {
      return jsonError(agnes.message, 502);
    }

    if (
      process.env.MAGIC_HOUR_FREE_FALLBACK_ENABLED !== "true"
    ) {
          const magicHour = await createMagicHourTextVideo(
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
    }

    if (!magicHourKey) {
      return jsonError(
        "Magic Hour API key is missing.",
        503
      );
    }

    if (imageBuffer) {
      const magicHour = await createMagicHourVideo(
        magicHourKey,
        prompt,
        seconds,
        aspectRatio,
        imageBuffer,
        mimeType
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
    }

    return jsonError(
      "Agnes AI's queue is full. Please try again later.",
      503
    );
  } catch (error) {
    console.error("ZENTRIX video creation error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unable to start video generation.",
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

    if (videoId.startsWith("mh:")) {
      const apiKey = process.env.MAGIC_HOUR_API_KEY;

      if (!apiKey) {
        return jsonError("Magic Hour API key is missing.", 503);
      }

      const projectId = videoId.slice(3);

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
