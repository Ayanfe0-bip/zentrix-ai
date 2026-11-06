"use client";

import { useState, ReactNode } from "react";
import { InlineMath, BlockMath } from "react-katex";
import ZentrixLogo from "@/components/zentrix-logo";
import MessageSources from "@/components/chat/message-sources";

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

function extractSources(content: string) {
  const matches = content.matchAll(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  );

  const sources = Array.from(matches, (match) => ({
    title: match[1],
    url: match[2],
  }));

  return Array.from(
    new Map(sources.map((source) => [source.url, source])).values()
  );
}

function renderInline(text: string): ReactNode[] {
  const pattern =
    /(\\\([\s\S]+?\\\)|(?<!\\)\$(?!\$)(?=[^$\n]*[\\_^{}=])[^\n$]+?\$(?!\$)|\*\*.*?\*\*|__.*?__|~~.*?~~|\*.*?\*|_.*?_|`[^`]+`|\[.*?\]\(.*?\))/g;

  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (part.startsWith("\\(") && part.endsWith("\\)")) {
      return (
        <InlineMath
          key={index}
          math={part.slice(2, -2).trim()}
          renderError={() => <span>{part}</span>}
        />
      );
    }

    if (
      part.startsWith("$") &&
      part.endsWith("$") &&
      !part.startsWith("$$")
    ) {
      return (
        <InlineMath
          key={index}
          math={part.slice(1, -1).trim()}
          renderError={() => <span>{part}</span>}
        />
      );
    }

    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <del key={index}>{part.slice(2, -2)}</del>;
    }

    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = part.match(/^\[(.*?)\]\((.*?)\)$/);

    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
        >
          {link[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function MathDisplay({ math }: { math: string }) {
  return (
    <div className="my-5 w-full overflow-x-auto rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-4 py-5 text-center text-white">
      <BlockMath
        math={math.trim()}
        renderError={() => (
          <code className="whitespace-pre-wrap break-words text-sm text-cyan-200">
            {math}
          </code>
        )}
      />
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const elements: ReactNode[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Display math: \[ ... \]
    if (trimmed.startsWith("\\[")) {
      let math = trimmed.slice(2);
      i++;

      while (i < lines.length && !lines[i].trim().includes("\\]")) {
        math += "\n" + lines[i];
        i++;
      }

      if (i < lines.length) {
        math += "\n" + lines[i].trim().replace("\\]", "");
        i++;
      }

      elements.push(<MathDisplay key={i} math={math} />);
      continue;
    }

    // Display math: $$ ... $$
    if (trimmed.startsWith("$$")) {
      let math = trimmed.slice(2);

      if (math.endsWith("$$") && math.length > 2) {
        math = math.slice(0, -2);
        i++;
      } else {
        i++;

        while (i < lines.length && !lines[i].trim().includes("$$")) {
          math += "\n" + lines[i];
          i++;
        }

        if (i < lines.length) {
          math += "\n" + lines[i].trim().replace("$$", "");
          i++;
        }
      }

      elements.push(<MathDisplay key={i} math={math} />);
      continue;
    }

    // Code blocks
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "Code";
      const codeLines: string[] = [];

      i++;

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }

      if (i < lines.length) i++;

      const code = codeLines.join("\n");

      elements.push(
        <div
          key={i}
          className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#080b18]"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-xs text-slate-400">{language}</span>

            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(code)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Copy code
            </button>
          </div>

          <pre className="overflow-x-auto p-4 text-xs leading-6 text-cyan-100 sm:text-sm">
            <code>{code}</code>
          </pre>
        </div>
      );

      continue;
    }

    // Headings
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      const level = heading[1].length;

      const classes = [
        "my-5 text-2xl font-bold text-white",
        "my-4 text-xl font-bold text-white",
        "my-3 text-lg font-semibold text-white",
        "my-3 text-base font-semibold text-white",
        "my-2 text-sm font-semibold text-white",
        "my-2 text-sm font-medium text-slate-200",
      ];

      const HeadingTag = `h${level}` as
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6";

      elements.push(
        <HeadingTag key={i} className={classes[level - 1]}>
          {renderInline(heading[2])}
        </HeadingTag>
      );

      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(
        <hr key={i} className="my-6 border-white/10" />
      );

      i++;
      continue;
    }

    // Tables
    if (trimmed.startsWith("|") && i + 1 < lines.length) {
      const separator = lines[i + 1].trim();

      if (/^\|?[\s:|-]+\|?$/.test(separator) && separator.includes("-")) {
        const parseRow = (row: string) =>
          row
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim());

        const headers = parseRow(trimmed);

        i += 2;

        const rows: string[][] = [];

        while (i < lines.length && lines[i].trim().startsWith("|")) {
          rows.push(parseRow(lines[i]));
          i++;
        }

        elements.push(
          <div
            key={i}
            className="my-5 overflow-x-auto rounded-xl border border-white/10"
          >
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-violet-500/15">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="border-b border-white/10 px-4 py-3 font-semibold text-white"
                    >
                      {renderInline(header)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]"
                  >
                    {headers.map((_, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-4 py-3 text-slate-300"
                      >
                        {renderInline(row[cellIndex] || "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

        continue;
      }
    }

    // Blockquotes
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];

      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(
          lines[i].trim().replace(/^>\s?/, "")
        );

        i++;
      }

      elements.push(
        <blockquote
          key={i}
          className="my-4 border-l-2 border-violet-400 bg-violet-500/[0.06] py-3 pl-4 text-slate-300"
        >
          {quoteLines.map((item, index) => (
            <p key={index}>{renderInline(item)}</p>
          ))}
        </blockquote>
      );

      continue;
    }

    // Bullet lists
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];

      while (i < lines.length && /^(\s*)[-*+]\s+/.test(lines[i])) {
        items.push(
          lines[i].trim().replace(/^[-*+]\s+/, "")
        );

        i++;
      }

      elements.push(
        <ul
          key={i}
          className="my-3 list-disc space-y-2 pl-6 marker:text-violet-400"
        >
          {items.map((item, index) => (
            <li key={index} className="pl-1 text-slate-300">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );

      continue;
    }

    // Numbered lists
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];

      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(
          lines[i].trim().replace(/^\d+[.)]\s+/, "")
        );

        i++;
      }

      elements.push(
        <ol
          key={i}
          className="my-3 list-decimal space-y-2 pl-6 marker:font-semibold marker:text-violet-400"
        >
          {items.map((item, index) => (
            <li key={index} className="pl-1 text-slate-300">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );

      continue;
    }

    // Paragraphs
    const paragraph: string[] = [];

    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|```|\\\[|\$\$|>|[-*+]\s|\d+[.)]\s)/.test(
        lines[i].trim()
      )
    ) {
      paragraph.push(lines[i].trim());
      i++;
    }

    if (paragraph.length > 0) {
      elements.push(
        <p key={i} className="my-3 leading-7 text-slate-300">
          {paragraph.map((part, index) => (
            <span key={index}>
              {index > 0 && " "}
              {renderInline(part)}
            </span>
          ))}
        </p>
      );

      continue;
    }

    i++;
  }

  return <div className="w-full">{elements}</div>;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  const sources = isUser
    ? []
    : extractSources(message.content);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);

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
          <ZentrixLogo />
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
            isUser
              ? "rounded-2xl rounded-tr-sm border border-violet-400/20 bg-violet-500/15 px-4 py-3 text-white"
              : "text-slate-200"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <>
              <MarkdownContent content={message.content} />

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
