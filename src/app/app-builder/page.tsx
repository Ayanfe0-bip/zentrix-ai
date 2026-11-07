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

  const processLine = (line: string) => {
    const trimmed = line.trim();

    if (!trimmed.startsWith("data:")) return;

    const data = trimmed.slice(5).trim();

    if (!data || data === "[DONE]") return;

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
      // Ignore incomplete or non-JSON streaming events.
    }
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    buffer = buffer.replace(/\r\n/g, "\n");

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      processLine(line);
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    processLine(buffer);
  }

  if (!result.trim()) {
    throw new Error(
      "The AI returned an empty response. Please try again."
    );
  }

  return result;
}

function buildStagePrompt(
  projectDescription: string,
  projectType: string,
  technology: string,
  stageIndex: number
) {
  const stage = STAGES[stageIndex];

  return `
You are ZENTRIX AI, an expert senior software architect, database designer, security engineer and application development consultant.

Your task is to create PART ${stageIndex + 1} OF A COMPLETE PROFESSIONAL SOFTWARE PROJECT BLUEPRINT.

PROJECT DESCRIPTION:
${projectDescription}

PROJECT TYPE:
${projectType}

PREFERRED TECHNOLOGY:
${technology}

CURRENT BLUEPRINT PART:
${stage.title}

SECTIONS YOU MUST COMPLETE:
${stage.sections.join("\n")}

CORE REQUIREMENTS:

1. Study the project description carefully before designing anything.
2. Preserve the user's original requirements and intended features.
3. Do not silently remove important features.
4. Explain technical concepts in clear, beginner-friendly English.
5. Give practical implementation details, not vague descriptions.
6. Use professional software engineering standards.
7. Make reasonable assumptions where information is missing and clearly identify them.
8. Do not invent third-party integrations or claim that an integration has been approved.
9. Do not generate fake API keys, passwords, credentials or secrets.
10. Do not claim that code has been written, tested or deployed.
11. Use clear headings and organised bullet points.
12. Avoid decorative symbols, excessive emojis and unnecessary Markdown.
13. Do not use complicated tables when clear descriptions would work better.
14. Keep the architecture realistic, secure and affordable to maintain.
15. Complete every assigned section before ending your response.

DATABASE DESIGN REQUIREMENTS:

When database design is relevant:

- Identify every important database table.
- Explain the purpose of each table.
- List important fields and their data types.
- Identify primary keys and foreign keys.
- Explain relationships between tables.
- Identify unique constraints and useful indexes.
- Explain how related records are connected.
- Include created_at and updated_at where appropriate.
- Consider pagination and database performance.
- Avoid unnecessary duplication of information.

For applications using Supabase Auth:

- Use Supabase Auth for authentication.
- Do not create an unnecessary custom password_hash table.
- Explain how user profiles connect to authentication user IDs.
- Include appropriate Row Level Security policies.
- Ensure users cannot access another user's private records.

For marketplace and multi-vendor applications:

- Distinguish customers, vendors and administrators.
- Design vendor-specific order fulfilment.
- Explain how one customer order can contain items from multiple vendors.
- Include appropriate order items, vendor orders, payments and transaction records.
- Explain how vendor earnings, platform commissions and payouts are calculated.
- Never trust payment status supplied directly by the browser.

PAYMENT AND FINANCIAL SECURITY:

When payments or financial transactions are relevant:

- Explain server-side payment verification.
- Include payment reference and transaction status.
- Include idempotency to prevent duplicate transactions.
- Explain how payment webhooks are validated.
- Keep secret API keys on the server.
- Store money using integer minor units, such as kobo, where appropriate.
- Explain refunds and failed transaction handling.
- Never assume a payment succeeded merely because the frontend displays success.

SECURITY REQUIREMENTS:

- Explain authentication and authorization separately.
- Apply role-based permissions where necessary.
- Validate user input on the server.
- Protect private routes and sensitive operations.
- Use secure environment variables.
- Apply database access restrictions.
- Explain protection against common security vulnerabilities.
- Avoid exposing private user information.
- Include rate limiting where appropriate.
- Explain backup and recovery considerations.

API DESIGN REQUIREMENTS:

Where APIs are relevant:

- Identify the endpoint.
- Specify the HTTP method.
- Explain what the endpoint does.
- Identify the required authentication.
- Explain important request fields.
- Explain the expected response.
- Include validation and error handling.
- Identify which operations must run on the server.

TECHNOLOGY REQUIREMENTS:

- Recommend technologies that genuinely fit this project.
- Explain why each technology is needed.
- Consider the user's preferred technology.
- Avoid unnecessary paid services.
- Identify free or low-cost alternatives where practical.
- Do not recommend incompatible technologies.

OUTPUT RULES:

- Write ONLY the five sections assigned to this part.
- Do not repeat the entire previous part.
- Do not generate the next part.
- Do not skip any section.
- Give enough detail for a developer to use the blueprint.
- Use the exact section numbers and headings provided.
- Do not end halfway through a section.
- End with a short completion note identifying this as Part ${stageIndex + 1} of 3.

The result must be a practical, professional software development blueprint, not a shallow project description.
`;
}

export default function AppBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    String(DEFAULT_MODEL)
  );
  const [projectType, setProjectType] = useState("Web Application");
  const [technology, setTechnology] = useState(
    "Recommend the best stack"
  );
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

        const stagePrompt = buildStagePrompt(
          prompt,
          projectType,
          technology,
          i
        );

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
            setBlueprint(
              completedContent + "\n\n" + partial
            );
          }
        );

        completedContent +=
          (completedContent ? "\n\n" : "") + stageContent;

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
      setError(
        "Unable to copy. Please select and copy the text manually."
      );
    }
  };

  const clearWorkspace = () => {
    if (loading) return;

    setBlueprint("");
    setError("");
    setPrompt("");
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
                Transform your application idea into a complete,
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
                    ZENTRIX AI is working on your blueprint.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    AI Response Workspace
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Your generated application blueprint will appear here.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyBlueprint}
                    disabled={!blueprint}
                    className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Copy Response
                  </button>

                    <button
                    onClick={clearWorkspace}
                    disabled={loading || (!blueprint && !prompt && !error)}
                    className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {loading && (
                <p className="mt-4 rounded-lg bg-violet-500/10 p-3 text-sm text-violet-500">
                  ZENTRIX AI is generating Part {currentStage} of 3.
                  Your response will appear below as it is created.
                </p>
              )}

              <div className="mt-5 min-h-[300px] overflow-hidden rounded-xl border border-dashed border-[var(--border)] p-4 sm:p-6">
                {blueprint ? (
                  <BlueprintContent content={blueprint} />
                ) : (
                  <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-500">
                      ✦
                    </div>

                    <h3 className="font-semibold">
                      Your AI response will appear here
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                      Describe your application above and select
                      Generate Complete Blueprint. ZENTRIX AI will
                      create your project plan and display the
                      response in this workspace.
                    </p>
                  </div>
                )}
              </div>

              {!loading && blueprint && !error && (
                <div className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-600">
                  Blueprint generation completed successfully.
                </div>
              )}
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Project Planning",
                  description:
                    "Organise your idea into a structured project plan.",
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
