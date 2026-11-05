import { DEFAULT_MODEL } from "./models";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AICompletionOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function createAICompletion({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxTokens = 2000,
}: AICompletionOptions) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenRouter API key is missing. Please configure it in your environment variables."
    );
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "https://vercel.com",
        "X-Title": "ZENTRIX AI",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(60000),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      `AI provider request failed with status ${response.status}.`;

    throw new Error(message);
  }

  const reply = data?.choices?.[0]?.message?.content;

  if (!reply || typeof reply !== "string") {
    throw new Error("The AI provider returned an empty response.");
  }

  return {
    reply,
    model: data?.model || model,
    usage: data?.usage || null,
  };
          }
