"use client";

import { useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import { DEFAULT_MODEL } from "@/lib/ai/models";

const STAGES = [
  {
    title: "Project Foundation",
    sections: [
      "1. PROJECT NAME AND SUMMARY",
      "2. PROBLEM THE APPLICATION SOLVES",
      "3. CORE FEATURES",
      "4. ADVANCED FEATURES",
      "5. USER TYPES AND PERMISSIONS",
    ],
  },
  {
    title: "Technical Design",
    sections: [
      "6. RECOMMENDED TECHNOLOGY STACK",
      "7. DATABASE DESIGN AND TABLES",
      "8. APPLICATION ARCHITECTURE",
      "9. API ENDPOINTS",
      "10. SECURITY AND PRIVACY",
    ],
  },
  {
    title: "Building and Launch",
    sections: [
      "11. USER INTERFACE AND DESIGN DIRECTION",
      "12. DEVELOPMENT ROADMAP",
      "13. TESTING STRATEGY",
      "14. DEPLOYMENT PLAN",
      "15. POSSIBLE FUTURE IMPROVEMENTS",
    ],
  },
];

function formatText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{part.replace(/`/g, "")}</span>
    )
  );
}

function BlueprintContent({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-7">
      {content.split("\n").map((raw, index) => {
        const line = raw.trim();

        if (!line) {
          return <div key={index} className="h-1" />;
        }

        if (line.startsWith("# ")) {
          return (
            <h2
              key={index}
              className="border-b border-[var(--border)] pb-2 pt-5 text-xl font-bold"
            >
              {formatText(line.slice(2))}
            </h2>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h3
              key={index}
              className="pt-3 text-lg font-semibold text-violet-500"
            >
              {formatText(line.slice(3))}
            </h3>
          );
        }

        if (line.startsWith("### ")) {
          return (
            <h4 key={index} className="pt-2 text-base font-semibold">
              {formatText(line.slice(4))}
            </h4>
          );
        }

        if (/^[-*]\s+/.test(line)) {
          return (
            <div key={index} className="flex gap-3 pl-2">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              <p className="min-w-0 flex-1">
                {formatText(line.replace(/^[-*]\s+/, ""))}
              </p>
            </div>
          );
        }

        if (/^\d+[.)]\s+/.test(line)) {
          return (
            <div key={index} className="flex gap-3 pl-2">
              <span className="font-semibold text-violet-500">
                {line.match(/^\d+/)?.[0]}.
              </span>
              <p className="min-w-0 flex-1">
                {formatText(line.replace(/^\d+[.)]\s+/, ""))}
              </p>
            </div>
          );
        }

        if (/^\|?\s*:?-{3,}/.test(line)) {
          return null;
        }

        if (line.includes("|")) {
          return (
            <p
              key={index}
              className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs"
            >
              {formatText(
                line.replace(/^\||\|$/g, "").replace(/\s*\|\s*/g, " • ")
              )}
            </p>
          );
        }

        return <p key={index}>{formatText(line.replace(/^>\s*/, ""))}</p>;
      })}
    </div>
  );
}

async function readAIResponse(
  response: Response,
  onUpdate: (text: string) => void
) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "The AI request failed.");
  }

  if (!response.body) {
    throw new Error("No response stream was received.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) continue;

      const data = trimmed.slice(5).trim();

      if (!data || data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);

        const content =
          parsed.choices?.[0]?.delta?.content ??
          parsed.choices?.[0]?.message?.content ??
          parsed.content ??
          "";

        if (typeof content === "string" && content) {
          result += content;
          onUpdate(result);
        }
      } catch {
        // Ignore incomplete streaming events.
      }
    }
  }

  if (!result.trim()) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  return result;
}

export default function AppBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    String(DEFAULT_MODEL)
  );
  const [projectType, setProjectType] = useState("Web Application");
  const [technology, setTechnology] = useState("Recommend the best stack");
  const [blueprint, setBlueprint] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState("");

  const generateBlueprint = async () => {
    if (!prompt.trim()) {
      setError("Please describe the application you want to build.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");
    setBlueprint("");
    setCurrentStage(0);

    let completedContent = "";

    try {
      for (let i = 0; i < STAGES.length; i++) {
        setCurrentStage(i + 1);

        const stage = STAGES[i];

        const stagePrompt = `
You are ZENTRIX AI, an expert software architect and application development assistant.

Create PART ${i + 1} OF A COMPLETE APPLICATION BLUEPRINT.

PROJECT DESCRIPTION:
${prompt}

PROJECT TYPE:
${projectType}

PREFERRED TECHNOLOGY:
${technology}

YOUR TASK:
Write only these five sections:
${stage.sections.join("\n")}

IMPORTANT INSTRUCTIONS:

1. Explain everything in simple, beginner-friendly English.
2. Give detailed and practical explanations.
3. Do not skip any requested section.
4. Do not stop halfway through a section.
5. Use clear headings and readable bullet points.
6. Avoid decorative symbols, emojis, and unnecessary Markdown.
7. Avoid complicated tables. Describe database tables using their names, purposes, and fields.
8. Explain technical terms when they first appear.
9. Include realistic features suitable for the project.
10. Do not write the other parts of the blueprint.
11. Finish all five sections before ending your response.

Make this section detailed enough for a developer to use as a practical project guide.
`;

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: stagePrompt,
              },
            ],
            model: selectedModel,
            mode: "app-builder",
          }),
        });

        const stageContent = await readAIResponse(
          response,
          (partial) => {
            setBlueprint(completedContent + "\n\n" + partial);
          }
        );

        completedContent += "\n\n" + stageContent;
        setBlueprint(completedContent);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the blueprint."
      );

      if (completedContent.trim()) {
        setBlueprint(completedContent);
      }
    } finally {
      setLoading(false);
      setCurrentStage(0);
    }
  };

  const copyBlueprint = async () => {
    if (!blueprint) return;

    try {
      await navigator.clipboard.writeText(blueprint);
      alert("Blueprint copied successfully!");
    } catch {
      setError("Unable to copy. Please select and copy the text manually.");
    }
  };

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <AppSidebar
        activeItem="AI App Builder"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="AI App Builder"
          subtitle="Turn your ideas into real software projects"
          modelName={selectedModel}
          onModelChange={setSelectedModel}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            <div>
              <div className="text-sm font-medium text-violet-500">
                ZENTRIX AI
              </div>

              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                AI App Builder
              </h1>

              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Turn your application idea into a complete,
                professionally structured development blueprint.
              </p>
            </div>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
              <h2 className="text-lg font-semibold">
                Describe your application
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Explain what you want to build and the features
                you expect it to have.
              </p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Build a multi-vendor marketplace where sellers can register, upload products, manage orders, and receive payments..."
                rows={7}
                disabled={loading}
                className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm outline-none focus:border-violet-500"
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Project type
                  </label>

                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                  >
                    <option>Web Application</option>
                    <option>Mobile Application</option>
                    <option>E-commerce Platform</option>
                    <option>AI Application</option>
                    <option>Social Media Platform</option>
                    <option>SaaS Platform</option>
                    <option>Desktop Application</option>
                    <option>Game Application</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Technology preference
                  </label>

                  <select
                    value={technology}
                    onChange={(e) => setTechnology(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                  >
                    <option>Recommend the best stack</option>
                    <option>Next.js, React and TypeScript</option>
                    <option>React and Supabase</option>
                    <option>Node.js and PostgreSQL</option>
                    <option>Flutter and Firebase</option>
                    <option>React Native and Supabase</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">
                  AI Model
                </label>

                <input
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <button
                onClick={generateBlueprint}
                disabled={loading || !prompt.trim()}
                className="mt-6 w-full rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? `Generating Part ${currentStage} of 3...`
                  : "Generate Complete Blueprint"}
              </button>

              {loading && (
                <div className="mt-4 space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all duration-500"
                      style={{
                        width: `${(currentStage / 3) * 100}%`,
                      }}
                    />
                  </div>

                  <p className="text-center text-xs text-[var(--muted-foreground)]">
                    {STAGES[currentStage - 1]?.title}
                    {" — "}
                    Please wait while ZENTRIX AI generates your blueprint.
                  </p>
                </div>
              )}
            </section>

            {blueprint && (
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      Your Application Blueprint
                    </h2>

                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Generated by ZENTRIX AI
                    </p>
                  </div>

                  <button
                    onClick={copyBlueprint}
                    className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--background)]"
                  >
                    Copy Blueprint
                  </button>
                </div>

                {loading && (
                  <p className="mt-4 rounded-lg bg-violet-500/10 p-3 text-sm text-violet-500">
                    Generating Part {currentStage} of 3.
                    Your completed sections are displayed below.
                  </p>
                )}

                <div className="mt-5 overflow-hidden">
                  <BlueprintContent content={blueprint} />
                </div>

                {!loading && !error && (
                  <div className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-600">
                    Blueprint generation completed.
                    You can now copy and review your project plan.
                  </div>
                )}
              </section>
            )}

            <section className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Project Planning",
                  description:
                    "Organize your idea into a structured project plan.",
                },
                {
                  title: "Technical Architecture",
                  description:
                    "Understand the database, technologies and system design.",
                },
                {
                  title: "Development Roadmap",
                  description:
                    "Follow practical steps from development to launch.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
