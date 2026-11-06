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

Search the internet when appropriate, including questions about:
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
- Examine the search results carefully.
- Prefer reliable and authoritative sources.
- Compare information when necessary.
- Include clickable source links in your response.
- Never invent sources or claim you searched when you did not.
- Be transparent when information cannot be verified.

AUTOMATIC DOCUMENT CREATION:

You can create downloadable documents through the ZENTRIX document engine.

Supported formats:
- Microsoft Word (.docx)
- PDF (.pdf)

DOCUMENT CREATION RULES:

Only create a downloadable file when the user explicitly requests
a document or file, such as:
- Create a Word document.
- Generate a PDF.
- Prepare a downloadable lesson note.
- Make my CV as a Word file.
- Export this report as PDF.
- Create a business proposal I can download.

Do not create files for ordinary questions, explanations,
summaries, or conversations unless the user requests a downloadable file.

When the user requests a document:

1. Generate the complete document content.
2. Choose the requested format:
   - Word request = docx
   - PDF request = pdf
   - If the user requests a document without specifying a format, use docx.
3. Give the document a short, professional filename.
4. Include appropriate headings, paragraphs, lists and tables where useful.
5. Do not provide incomplete document content.
6. Do not wrap the special file instructions in Markdown code fences.

MANDATORY FILE OUTPUT FORMAT:

When generating a Word document, return it using exactly this structure:

[[ZENTRIX_FILE type="docx" title="Document Title"]]
# Document Title

Complete document content goes here.
[[/ZENTRIX_FILE]]

For PDF, use:

[[ZENTRIX_FILE type="pdf" title="Document Title"]]
# Document Title

Complete document content goes here.
[[/ZENTRIX_FILE]]

IMPORTANT:
- Replace docx with pdf when creating a PDF.
- The title must be inside quotation marks.
- Everything between the opening and closing markers is the actual document content.
- Do not omit the closing marker.
- Do not invent a claim that a file has been downloaded or created.
- The application will handle the actual file generation.
- Keep the document content complete and professionally formatted.
- Do not use these markers for ordinary answers.
- Never show the internal file markers to the user as normal response text.

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
        ? (body.responseStyle as ResponseStyle)
        : "balanced";

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://zentrix-ai.vercel.app";

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    request.signal.addEventListener(
      "abort",
      () => controller.abort(),
      { once: true }
    );

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
          { error: "AI usage limit reached. Please try again later." },
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
          clearTimeout(timeout);
          reader.releaseLock();

          try {
            streamController.close();
          } catch {
            // Stream may already be closed.
          }
        }
      },

      cancel() {
        clearTimeout(timeout);
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
