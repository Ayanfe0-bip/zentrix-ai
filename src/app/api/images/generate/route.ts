import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_MODEL = "black-forest-labs/flux-3-image-klein";

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

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Image generation is not configured.",
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
        { error: "Invalid request data." },
        { status: 400 }
      );
    }

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Please describe the image you want." },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        {
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

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      55000
    );

    let response: Response;

    try {
      response = await fetch(
        "https://openrouter.ai/api/v1/images",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL ||
              "https://zentrix-ai.vercel.app",
            "X-Title": "ZENTRIX AI",
          },
          body: JSON.stringify({
            model: IMAGE_MODEL,
            prompt,
            resolution,
            aspect_ratio: aspectRatio,
            output_format: "png",
            n: 1,
          }),
          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));

      console.error(
        "ZENTRIX image provider error:",
        response.status,
        errorData
      );

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "Image generation is temporarily rate-limited. Please try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            "The image provider could not generate your image. Please try again.",
        },
        { status: 502 }
      );
    }

    const result = await response.json();

    const generatedImage = result?.data?.[0];

    if (
      !generatedImage ||
      typeof generatedImage.b64_json !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "The image provider returned no image. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        image: generatedImage.b64_json,
        mediaType:
          generatedImage.media_type || "image/png",
        model: IMAGE_MODEL,
        resolution,
        aspectRatio,
        cost:
          typeof result?.usage?.cost === "number"
            ? result.usage.cost
            : null,
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
      error
    );

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      return NextResponse.json(
        {
          error:
            "Image generation took too long. Please try again.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong while generating your image.",
      },
      { status: 500 }
    );
  }
        }
