import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
You are ZENTRIX AI, created by Ayanfe Innovation Labs Limited.

Your tagline is: "Think Beyond. Build Without Limits."

You are intelligent, friendly, professional, patient, and helpful.
Explain difficult topics simply.
Help with programming, creativity, education, research, business,
and everyday problem-solving.
Provide complete and understandable code solutions.
Never pretend to perform actions you did not perform.
Admit uncertainty when necessary.

Your name is ZENTRIX AI.
You are not ChatGPT.
`;

const RESPONSE_STYLES = {
  balanced: "Give clear, balanced answers with useful examples.",
  concise: "Be brief and direct. Avoid unnecessary explanations.",
  detailed: "Give thorough explanations, steps, context, and examples.",
  creative: "Be imaginative and engaging while remaining accurate.",
};

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 12000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

type ResponseStyle = keyof typeof RESPONSE_STYLES;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one message." },
        { status: 400 }
      );
    }

    if (body.messages.length > MAX_MESSAGES) {
      return NextResponse.json(
        { error: "This conversation is too long." },
        { status: 400 }
      );
    }

    const messages: IncomingMessage[] = [];

    for (const message of body.messages) {
      if (
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        !message.content.trim() ||
        message.content.length > MAX_MESSAGE_LENGTH
      ) {
        return NextResponse.json(
          { error: "One or more messages are invalid." },
          { status: 400 }
        );
      }

      messages.push({
        role: message.role,
        content: message.content.trim(),
      });
    }

    if (messages[messages.length - 1].role !== "user") {
      return NextResponse.json(
        { error: "The latest message must be from the user." },
        { status: 400 }
      );
    }

    const requestedModel =
      typeof body.model === "string"
        ? body.model
        : DEFAULT_MODEL;

    const selectedModel = AI_MODELS.find(
      (model) => model.id === requestedModel
    );

    if (!selectedModel) {
      return NextResponse.json(
        { error: "The selected AI model is unavailable." },
        { status: 400 }
      );
    }

    const responseStyle: ResponseStyle =
      typeof body.responseStyle === "string" &&
      body.responseStyle in RESPONSE_STYLES
        ? body.responseStyle as ResponseStyle
        : "balanced";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://zentrix-ai.vercel.app";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": appUrl,
          "X-Title": "ZENTRIX AI",
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [
            {
              role: "system",
              content:
                SYSTEM_PROMPT +
                "\n\nRESPONSE STYLE:\n" +
                RESPONSE_STYLES[responseStyle],
            },
            ...messages,
          ],
          temperature: responseStyle === "creative" ? 0.9 : 0.7,
          max_tokens: responseStyle === "concise" ? 900 : 1800,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.error(
        "OpenRouter error:",
        response.status,
        errorData
      );

      if (response.status === 429) {
        return NextResponse.json(
          { error: "AI usage limit reached. Please try again later." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "The AI provider could not process your request." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json(
        { error: "The AI provider returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply: reply.trim(),
      model: data.model || selectedModel.id,
    });
  } catch (error) {
    console.error("ZENTRIX API error:", error);

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "The AI request timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
  }
