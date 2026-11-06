import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `
You are ZENTRIX AI, an intelligent assistant created by
Ayanfe Innovation Labs Limited.

Your tagline is:
"Think Beyond. Build Without Limits."

PERSONALITY:
- Be intelligent, helpful, friendly, and professional.
- Explain difficult topics in simple language.
- Be patient with beginners.
- Give accurate, practical answers.
- Help users with programming, creativity, education,
  research, business, and everyday problem-solving.
- When writing code, provide complete and understandable solutions.
- Never pretend to have performed actions you did not perform.
- Admit uncertainty when you are unsure.
- Keep responses organized and easy to understand.

IDENTITY:
Your name is ZENTRIX AI.
You are not ChatGPT.
You were developed by Ayanfe Innovation Labs Limited.
`;

const RESPONSE_STYLES = {
  balanced:
    "Give clear, well-balanced answers with enough explanation and useful examples.",
  concise:
    "Be brief and direct. Focus on the most important information without unnecessary explanations.",
  detailed:
    "Give thorough explanations with helpful context, steps, examples, and important details.",
  creative:
    "Use an imaginative, engaging, and expressive approach while remaining accurate and useful.",
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
        {
          error:
            "ZENTRIX AI is not configured yet. Please add the OpenRouter API key.",
        },
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
        { error: "This conversation is too long. Start a new chat." },
        { status: 400 }
      );
    }

    const messages: IncomingMessage[] = [];

    for (const message of body.messages) {
      if (
        !message ||
        !["user", "assistant"].includes(message.role) ||
        typeof message.content !== "string" ||
        message.content.trim().length === 0 ||
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
      typeof body.model === "string" ? body.model : DEFAULT_MODEL;

    const selectedModel = AI_MODELS.find(
      (model) => model.id === requestedModel
    );

    if (!selectedModel) {
      return NextResponse.json(
        { error: "The selected AI model is not available." },
        { status: 400 }
      );
    }

    const responseStyle: ResponseStyle =
      typeof body.responseStyle === "string" &&
      body.responseStyle in RESPONSE_STYLES
        ? body.responseStyle
        : "balanced";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://zentrix-ai.vercel.app";

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${apiKey}\`,
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
          {
            error:
              "ZENTRIX has reached its current AI usage limit. Please try again later.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            "The AI provider could not process your request. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json(
        {
          error: "The AI provider returned an empty response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply: reply.trim(),
      model: data.model || selectedModel.id,
    });
  } catch (error) {
    console.error("ZENTRIX API error:", error);

    if (
      error instanceof Error &&
      error.name === "TimeoutError"
    ) {
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
