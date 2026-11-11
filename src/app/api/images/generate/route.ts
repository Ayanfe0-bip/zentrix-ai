import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

const ALLOWED_RESOLUTIONS = [
  "768",
  "1K",
  "1.5K",
  "2K",
  "4K",
] as const;

const ALLOWED_RATIOS = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "3:2",
  "2:3",
  "4:5",
  "5:4",
  "21:9",
  "2:1",
  "7:5",
  "5:7",
  "1:2",
  "9:21",
  "auto",
] as const;

type Resolution = (typeof ALLOWED_RESOLUTIONS)[number];
type AspectRatio = (typeof ALLOWED_RATIOS)[number];

function getDimensions(
  resolution: Resolution,
  aspectRatio: AspectRatio
) {
  const sizes: Record<Resolution, number> = {
    "768": 768,
    "1K": 1024,
    "1.5K": 1536,
    "2K": 1792,
    "4K": 1792,
  };

  const ratios: Record<string, number> = {
    "1:1": 1,
    "16:9": 16 / 9,
    "9:16": 9 / 16,
    "4:3": 4 / 3,
    "3:4": 3 / 4,
    "3:2": 3 / 2,
    "2:3": 2 / 3,
    "4:5": 4 / 5,
    "5:4": 5 / 4,
    "21:9": 21 / 9,
    "2:1": 2,
    "7:5": 7 / 5,
    "5:7": 5 / 7,
    "1:2": 1 / 2,
    "9:21": 9 / 21,
  };

  const size = sizes[resolution];
  const ratio = ratios[aspectRatio] || 1;

  let width = size;
  let height = size;

  if (ratio >= 1) {
    height = Math.round(size / ratio);
  } else {
    width = Math.round(size * ratio);
  }

  width = Math.min(1920, Math.max(256, width));
  height = Math.min(1920, Math.max(256, height));

  width = Math.max(256, Math.round(width / 8) * 8);
  height = Math.max(256, Math.round(height / 8) * 8);

  return { width, height };
}

export async function POST(request: NextRequest) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudflare credentials are missing.",
        },
        { status: 503 }
      );
    }

    let body: {
      prompt?: string;
      resolution?: string;
      aspectRatio?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data.",
        },
        { status: 400 }
      );
    }

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Please describe the image you want.",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: "Your image description is too long.",
        },
        { status: 400 }
      );
    }

    const resolution = ALLOWED_RESOLUTIONS.includes(
      body.resolution as Resolution
    )
      ? (body.resolution as Resolution)
      : "768";

    const aspectRatio = ALLOWED_RATIOS.includes(
      body.aspectRatio as AspectRatio
    )
      ? (body.aspectRatio as AspectRatio)
      : "1:1";

    const { width, height } = getDimensions(
      resolution,
      aspectRatio
    );

    const formData = new FormData();

    formData.append("prompt", prompt);
    formData.append("width", String(width));
    formData.append("height", String(height));

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      55000
    );

    let response: Response;

    try {
      response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
          accountId
        )}/ai/run/${IMAGE_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          body: formData,
          signal: controller.signal,
          cache: "no-store",
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      const cloudflareError =
        Array.isArray(result?.errors)
          ? result.errors
              .map(
                (item: { message?: string }) =>
                  item.message
              )
              .filter(Boolean)
              .join(" ")
          : "";

      console.error(
        "Cloudflare image error:",
        response.status,
        cloudflareError
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cloudflare rejected the API token. Check its Workers AI permissions.",
          },
          { status: 502 }
        );
      }

      if (
        response.status === 429 ||
        response.status === 402 ||
        cloudflareError.toLowerCase().includes("neuron")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cloudflare Workers AI usage limit reached. Please try again after the quota resets. " +
              cloudflareError,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudflare could not generate your image. " +
            (cloudflareError || "Please try again."),
        },
        { status: 502 }
      );
    }

    const generatedImage = result?.result?.image;

    if (
      typeof generatedImage !== "string" ||
      !generatedImage
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudflare returned no generated image.",
        },
        { status: 502 }
      );
    }

    const image = generatedImage.startsWith("data:")
      ? generatedImage.slice(
          generatedImage.indexOf(",") + 1
        )
      : generatedImage;

    return NextResponse.json(
      {
        success: true,
        image,
        mediaType: "image/png",
        model: IMAGE_MODEL,
        resolution: `${width}x${height}`,
        aspectRatio,
        cost: null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ZENTRIX image generation error:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image generation took too long. Please try again.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Something went wrong while generating your image.",
      },
      { status: 500 }
    );
  }
                  }
