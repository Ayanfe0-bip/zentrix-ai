import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Image understanding is not configured." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an image." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are supported." },
        { status: 415 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 5 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const imageUrl =
      `data:${file.type};base64,${base64}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `
Carefully examine this uploaded image.

1. Describe what is visible.
2. Extract all readable text exactly as it appears.
3. Explain diagrams, tables and important details.
4. Preserve numbers, names and headings.
5. If something is unclear, say so.
6. Organize the result clearly.

Make the extracted information useful for answering
follow-up questions about this image.
                  `,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          temperature: 0.2,
          max_completion_tokens: 2000,
          stream: false,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Groq vision error:", result);

      return NextResponse.json(
        {
          error:
            result?.error?.message ||
            "The image could not be analyzed.",
        },
        { status: 502 }
      );
    }

    const text =
      result?.choices?.[0]?.message?.content;

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "No readable information was extracted." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      text,
    });
  } catch (error) {
    console.error("Vision API error:", error);

    return NextResponse.json(
      { error: "Image analysis failed. Please try again." },
      { status: 500 }
    );
  }
      }
