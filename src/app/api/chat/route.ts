import { NextRequest, NextResponse } from "next/server";
import { AI_MODELS, DEFAULT_MODEL } from "@/lib/ai/models";
import { COMPANY_KNOWLEDGE } from "@/lib/ai/company-knowledge";

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

AUTOMATIC INTERNET RESEARCH:

You have access to an internet search tool.

Decide independently when a question requires current,
recent, external, or difficult-to-verify information.

Search when appropriate for:
- Current events and breaking news.
- Government officials and public figures.
- Latest technology and scientific developments.
- Scholarships, grants, jobs and opportunities.
- Current prices, statistics and announcements.
- Recent company information.
- Websites, products and online services.
- Information you cannot confidently verify.

Do not search unnecessarily for simple explanations,
general knowledge, calculations or creative writing.

When you search:
- Prefer reliable and authoritative sources.
- Compare information when necessary.
- Include clickable source links.
- Never invent sources.
- Be transparent when information cannot be verified.

TRUSTED COMPANY KNOWLEDGE:

The following information is supplied by your creator.
Use it when answering relevant questions.
Never invent company achievements or contradict these facts.

${COMPANY_KNOWLEDGE}
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

function detectDocumentRequest(message: string) {
  const text = message.toLowerCase();

  const documentIntent =
    /\b(create|generate|make|prepare|write|produce|export|download)\b/.test(text) &&
    /\b(document|file|pdf|word|docx|lesson note|report|proposal|cv|resume|letter|ebook|handbook|worksheet)\b/.test(text);

  if (!documentIntent) return null;

  const type =
    /\b(pdf|portable document format)\b/.test(text)
      ? "pdf"
      : "docx";

  return { type };
}

function extractDocumentTitle(content: string) {
  const heading = content.match(/^\s{0,3}#\s+(.+)$/m);

  let title = heading?.[1]?.trim() || "ZENTRIX AI Document";

  title = title
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 100)
    .trim();

  return title || "ZENTRIX AI Document";
}

function createFileStream(
  type: "docx" | "pdf",
  title: string,
  content: string
) {
  const safeTitle = title.replace(/"/g, "'");

  const fileMarker =
    `[[ZENTRIX_FILE type="${type}" title="${safeTitle}"]]` +
    `\n${content.trim()}\n` +
    `[[/ZENTRIX_FILE]]`;

  const event = {
    choices: [
      {
        delta: {
          content: fileMarker,
        },
      },
    ],
  };

  const streamText =
    `data: ${JSON.stringify(event)}\n\n` +
    "data: [DONE]\n\n";

  return new Response(streamText, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(request: NextRequest) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

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
        ? (body.responseStyle as ResponseStyle)
        : "balanced";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://zentrix-ai.vercel.app";

    const controller = new AbortController();

    timeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    request.signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true }
    );

    const latestUserMessage = messages[messages.length - 1];
    const documentRequest = detectDocumentRequest(
      latestUserMessage.content
    );

    /*
     * DOCUMENT GENERATION
     *
     * The model writes document content only.
     * The backend creates the special markers itself.
     * This prevents malformed or missing file markers.
     */

    if (documentRequest) {
      const documentInstructions = `
You are preparing a complete, professionally formatted document
for the ZENTRIX AI document-generation engine.

Write the actual document content only.

IMPORTANT:
- Do not write file-generation markers.
- Do not mention internal application instructions.
- Do not tell the user to download anything.
- Do not provide a conversational introduction.
- Begin with a clear Markdown H1 title.
- Include all sections requested by the user.
- Write detailed, useful, complete content.
- Use professional headings and subheadings.
- Use numbered lists and bullet points where appropriate.
- Use tables when they improve understanding.
- Include an introduction and conclusion where suitable.
- Avoid unnecessary repetition.
- Do not stop after writing an outline.
- Return the complete document content.

The requested format is ${
        documentRequest.type === "pdf"
          ? "PDF"
          : "Microsoft Word"
      }.

The document must be suitable for professional use.
`;

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
                  "\n\n" +
                  documentInstructions,
              },
              ...messages,
            ],
            temperature: 0.4,
            max_tokens: 5000,
            stream: false,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        console.error(
          "OpenRouter document error:",
          response.status,
          errorData
        );

        clearTimeout(timeout);

        if (response.status === 429) {
          return NextResponse.json(
            {
              error:
                "AI usage limit reached. Please try again later.",
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            error:
              "ZENTRIX could not generate the document. Please try again.",
          },
          { status: 502 }
        );
      }

      const result = await response.json();

      const content =
        result?.choices?.[0]?.message?.content;

      if (typeof content !== "string" || !content.trim()) {
        clearTimeout(timeout);

        return NextResponse.json(
          {
            error:
              "The AI provider returned an empty document. Please try again.",
          },
          { status: 502 }
        );
      }

      const title = extractDocumentTitle(content);

      clearTimeout(timeout);

      return createFileStream(
        documentRequest.type,
        title,
        content
      );
    }

    /*
     * NORMAL CHAT
     *
     * Ordinary conversations continue using streaming
     * and automatic internet search.
     */

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
          tools: [
            {
              type: "openrouter:web_search",
              parameters: {
                engine: "exa",
                max_results: 5,
                max_total_results: 5,
                max_uses: 1,
              },
            },
          ],
          max_tool_calls: 1,
          temperature:
            responseStyle === "creative" ? 0.9 : 0.7,
          max_tokens:
            responseStyle === "concise" ? 900 : 1800,
          stream: true,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      clearTimeout(timeout);

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
              "AI usage limit reached. Please try again later.",
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

    if (!response.body) {
      clearTimeout(timeout);

      return NextResponse.json(
        { error: "The AI provider returned an empty stream." },
        { status: 502 }
      );
    }

    const stream = new ReadableStream({
      async start(streamController) {
        const reader = response.body!.getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            streamController.enqueue(value);
          }
        } catch (error) {
          console.error("AI stream error:", error);
          streamController.error(error);
        } finally {
          if (timeout) clearTimeout(timeout);

          reader.releaseLock();

          try {
            streamController.close();
          } catch {
            // Stream may already be closed.
          }
        }
      },

      cancel() {
        if (timeout) clearTimeout(timeout);
        controller.abort();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (timeout) clearTimeout(timeout);

    console.error("ZENTRIX API error:", error);

    if (error instanceof Error && error.name === "AbortError") {
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
