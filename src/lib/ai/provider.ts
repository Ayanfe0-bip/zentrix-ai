import { DEFAULT_MODEL, getAIModel } from "./models";

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

interface ProviderPayload {
  error?: {
    message?: string;
  };
  message?: string;
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usageMetadata?: unknown;
  usage?: unknown;
  model?: string;
}

const TIMEOUT = 60000;

async function requestJSON(
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<ProviderPayload> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT),
  });

  const data = (await response.json()) as ProviderPayload;

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        `Provider request failed: ${response.status}`
    );
  }

  return data;
}

export async function createAICompletion({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
  maxTokens = 2000,
}: AICompletionOptions) {
  const selected = getAIModel(model);

  if (!selected) {
    throw new Error("The selected AI model is unavailable.");
  }

  const provider = selected.provider;

  let data: ProviderPayload;

  // GOOGLE GEMINI
  if (provider === "Gemini") {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is missing.");
    }

    const systemMessage = messages.find(
      (message) => message.role === "system"
    );

    const contents = messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    data = await requestJSON(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        "Content-Type": "application/json",
      },
      {
        systemInstruction: systemMessage
          ? {
              parts: [{ text: systemMessage.content }],
            }
          : undefined,
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }
    );

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

    if (!reply) {
      throw new Error("Gemini returned an empty response.");
    }

    return {
      reply,
      model,
      usage: data.usageMetadata || null,
    };
  }

  // GROQ
  if (provider === "Groq") {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("Groq API key is missing.");
    }

    data = await requestJSON(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }
    );
  }

  // MISTRAL
  else if (provider === "Mistral") {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      throw new Error("Mistral API key is missing.");
    }

    data = await requestJSON(
      "https://api.mistral.ai/v1/chat/completions",
      {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }
    );
  }

  // CLOUDFLARE WORKERS AI
  else if (provider === "Cloudflare") {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error("Cloudflare credentials are missing.");
    }

    data = await requestJSON(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
      {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }
    );
  }

  // OPENROUTER
  else {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OpenRouter API key is missing.");
    }

    data = await requestJSON(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://zentrix-ai.vercel.app",
        "X-Title": "ZENTRIX AI",
      },
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }
    );
  }

  const reply = data.choices?.[0]?.message?.content;

  if (!reply || typeof reply !== "string") {
    throw new Error("The AI provider returned an empty response.");
  }

  return {
    reply,
    model: data.model || model,
    usage: data.usage || null,
  };
}
