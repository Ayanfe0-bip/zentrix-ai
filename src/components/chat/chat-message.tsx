"use client";

import { useState, type ReactNode } from "react";
import katex from "katex";
import ZentrixLogo from "@/components/zentrix-logo";
import MessageSources from "@/components/chat/message-sources";
import StoredGeneratedImage from "@/components/chat/stored-generated-image";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  image?: {
    id: string;
    prompt: string;
    mediaType: string;
  };
    attachments?: string[];
  agentProgress?: string[];
}


interface ChatMessageProps {
  message: ChatMessageData;
}

function extractSources(content: string) {
  const sources: { title: string; url: string }[] = [];

  const lines = content.split("\n");

  for (const line of lines) {
    const start = line.indexOf("[");
    const middle = line.indexOf("](", start);
    const end = line.indexOf(")", middle);

    if (start === -1 || middle === -1 || end === -1) {
      continue;
    }

    const title = line.slice(start + 1, middle);
    const url = line.slice(middle + 2, end);

    if (
      title &&
      (url.startsWith("https://") || url.startsWith("http://"))
    ) {
      sources.push({ title, url });
    }
  }

  return Array.from(
    new Map(sources.map((source) => [source.url, source])).values()
  );
}

function renderInline(text: string): ReactNode[] {
  // Normalize escaped dollar signs from AI responses.
  const normalized = text.replace(/\\\$/g, "$");

  const mathPattern =
    /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;

  const parts = normalized.split(mathPattern);

  return parts.map((part, index) => {
    const isDisplay =
      (part.startsWith("$$") && part.endsWith("$$")) ||
      (part.startsWith("\\[") && part.endsWith("\\]"));

    const isMath =
      isDisplay ||
      (part.startsWith("\\(") && part.endsWith("\\)")) ||
      (part.startsWith("$") && part.endsWith("$"));

    if (isMath) {
      let expression = part;

      if (part.startsWith("$$")) {
        expression = part.slice(2, -2);
      } else if (
        part.startsWith("\\[") ||
        part.startsWith("\\(")
      ) {
        expression = part.slice(2, -2);
      } else {
        expression = part.slice(1, -1);
      }

      try {
        const html = katex.renderToString(expression.trim(), {
          displayMode: isDisplay,
          throwOnError: false,
          strict: "ignore",
          trust: false,
          output: "htmlAndMathml",
        });

        return (
          <span
            key={index}
            className={
              isDisplay
                ? "my-3 block max-w-full overflow-x-auto py-2"
                : "inline-block align-middle"
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <span key={index}>
            {expression}
          </span>
        );
      }
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-[var(--foreground)]"
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md bg-[var(--surface-light)] px-1.5 py-0.5 font-mono text-[var(--secondary)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return <span key={index}>{part}</span>;
  });
}
    

function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  const elements: ReactNode[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index++;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "Code";
      const codeLines: string[] = [];

      index++;

      while (
        index < lines.length &&
        !lines[index].trim().startsWith("```")
      ) {
        codeLines.push(lines[index]);
        index++;
      }

      if (index < lines.length) {
        index++;
      }

      const code = codeLines.join("\n");

      elements.push(
        <div
          key={`code-${index}`}
          className="my-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
        >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-xs text-[var(--muted)]">
              {language}
            </span>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-xs text-[var(--muted)] hover:text-white"
            >
              Copy code
            </button>
          </div>

          <pre className="overflow-x-auto p-4 text-xs leading-6 text-[var(--foreground)] sm:text-sm">
            <code>{code}</code>
          </pre>
        </div>
      );

      continue;
    }
    const imageMatch = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);

    if (imageMatch) {
      elements.push(
        <a
          key={`image-${index}`}
          href={imageMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 block overflow-hidden rounded-xl"
        >
          <img
            src={imageMatch[2]}
            alt={imageMatch[1] || "Web search image"}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-[420px] w-full rounded-xl object-contain"
          />
        </a>
      );

      index++;
      continue;
  }
    if (line.startsWith("#")) {
      const headingText = line.replace(/^#+\s*/, "");
      const level = line.match(/^#+/)?.[0].length || 1;

      const HeadingTag = (
        level === 1 ? "h1" :
        level === 2 ? "h2" :
        level === 3 ? "h3" : "h4"
      ) as "h1" | "h2" | "h3" | "h4";

      elements.push(
        <HeadingTag
          key={`heading-${index}`}
          className="my-4 text-xl font-bold text-[var(--foreground)]"
        >
          {renderInline(headingText)}
        </HeadingTag>
      );

      index++;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = line.replace(/^>\s*/, "");

      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="my-4 border-l-2 border-violet-400 bg-violet-500/[0.06] py-3 pl-4 text-[var(--foreground)]"
        >
          {renderInline(quote)}
        </blockquote>
      );

      index++;
      continue;
    }

    if (
      line.startsWith("- ") ||
      line.startsWith("* ") ||
      line.startsWith("+ ")
    ) {
      const items: string[] = [];

      while (index < lines.length) {
        const item = lines[index].trim();

        if (
          !item.startsWith("- ") &&
          !item.startsWith("* ") &&
          !item.startsWith("+ ")
        ) {
          break;
        }

        items.push(item.slice(2));
        index++;
      }

      elements.push(
        <ul
          key={`list-${index}`}
          className="my-3 list-disc space-y-2 pl-6 marker:text-violet-400"
        >
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1 text-[var(--foreground)]"
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );

      continue;
    }

    const paragraph: string[] = [line];
    index++;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith("```") &&
      !lines[index].trim().startsWith("- ") &&
      !lines[index].trim().startsWith("* ") &&
      !lines[index].trim().startsWith(">")
    ) {
      paragraph.push(lines[index].trim());
      index++;
    }

    elements.push(
      <p
        key={`paragraph-${index}`}
        className="my-3 leading-7 text-[var(--foreground)]"
      >
        {paragraph.map((part, partIndex) => (
          <span key={partIndex}>
            {partIndex > 0 && " "}
            {renderInline(part)}
          </span>
        ))}
      </p>
    );
  }

  return <div className="w-full">{elements}</div>;
}

export default function ChatMessage({
  message,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  const sources = isUser
    ? []
    : extractSources(message.content);

  async function copyMessage() {
  try {
    const plainText = message.content
      // Remove code block markers
      .replace(/```[a-zA-Z]*\n?/g, "")

      // Remove Markdown headings
      .replace(/^#{1,6}\s+/gm, "")

      // Remove bold formatting
      .replace(/\*\*([\s\S]*?)\*\*/g, "$1")

      // Remove italic formatting
      .replace(/\*([^*\n]+)\*/g, "$1")

      // Remove inline code formatting
      .replace(/`([^`]+)`/g, "$1")

      // Convert LaTeX fractions into readable fractions
      .replace(
        /\\(?:dfrac|tfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g,
        "$1/$2"
      )

      // Convert common mathematical symbols
      .replace(/\\times/g, "×")
      .replace(/\\div/g, "÷")
      .replace(/\\cdot/g, "·")
      .replace(/\\pm/g, "±")
      .replace(/\\leq/g, "≤")
      .replace(/\\geq/g, "≥")
      .replace(/\\neq/g, "≠")
      .replace(/\\pi/g, "π")

      // Remove LaTeX delimiters
      .replace(/\\\(|\\\)|\\\[|\\\]|\$\$/g, "")
      .replace(/\$([^$\n]+)\$/g, "$1")

      // Clean remaining LaTeX braces
      .replace(/[{}]/g, "")

      // Remove unnecessary Markdown symbols
      .replace(/^\s*>\s?/gm, "")

      // Preserve readable spacing
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    await navigator.clipboard.writeText(plainText);

    setCopied(true);

    window.setTimeout(() => setCopied(false), 1800);
  } catch {
    setCopied(false);
  }
  }

  return (
    <article
      className={`group flex w-full gap-3 py-5 sm:gap-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-400/20 bg-violet-500/10">
          <ZentrixLogo size="small" showName={false} />
        </div>
      )}

      <div
        className={`flex min-w-0 flex-col ${
          isUser
            ? "max-w-[88%] items-end sm:max-w-[80%]"
            : "max-w-[95%] flex-1 items-start"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? "You" : "ZENTRIX"}
          </span>

          {message.timestamp && (
            <span className="text-[10px] text-slate-500">
              {message.timestamp}
            </span>
          )}
        </div>

        <div
          className={`w-full text-sm leading-7 sm:text-[15px] ${
  isUser && message.attachments?.length
    ? "text-white"
    : isUser
      ? "rounded-2xl rounded-tr-sm border border-violet-400/20 bg-violet-500/15 px-4 py-3 text-white"
      : "text-slate-200"
}`}
        >
          {isUser ? (
  <div className="space-y-3">
    {message.attachments && message.attachments.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {message.attachments.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Uploaded image ${index + 1}`}
            className="max-h-72 max-w-full rounded-xl object-contain"
          />
        ))}
      </div>
    )}

    {message.content && (
      <div className="whitespace-pre-wrap break-words">
        {message.content}
      </div>
    )}
  </div>
) : (
            <>
  {message.agentProgress && message.agentProgress.length > 0 && (
    <div className="mb-4 space-y-2 rounded-xl border border-violet-400/15 bg-violet-500/[0.05] p-3">
      <div className="text-xs font-semibold text-violet-300">
        ZENTRIX is working
      </div>

      {message.agentProgress.map((step, index) => (
        <div
          key={index}
          className="flex items-start gap-2 text-xs text-slate-400"
        >
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span>{step}</span>
        </div>
      ))}
    </div>
  )}

  <MarkdownContent content={message.content} />

              {message.image && (
                <StoredGeneratedImage
                  imageId={message.image.id}
                  prompt={message.image.prompt}
                  mediaType={message.image.mediaType}
                />
              )}

              <MessageSources sources={sources} />
            </>
          )}
        </div>

        {!isUser && (
          <div className="mt-3 flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={copyMessage}
              className="rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white">
          U
        </div>
      )}
    </article>
  );
}
