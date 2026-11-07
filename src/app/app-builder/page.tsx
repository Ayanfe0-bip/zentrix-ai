"use client";

import { useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export default function AppBuilderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [idea, setIdea] = useState("");
  const [projectType, setProjectType] = useState("Web Application");
  const [technology, setTechnology] = useState("Recommend the best stack");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState("");
  const [error, setError] = useState("");

  async function generateBlueprint() {
    if (!idea.trim() || loading) return;

    setLoading(true);
    setError("");
    setBlueprint("");

    const prompt = `
You are ZENTRIX AI, an expert software architect and autonomous app-building assistant.

Create a professional, technically realistic project blueprint using the information below.

PROJECT IDEA:
${idea}

PROJECT TYPE:
${projectType}

PREFERRED TECHNOLOGY:
${technology}

Produce a detailed but practical blueprint with these sections:

1. PROJECT NAME AND SUMMARY
2. PROBLEM THE APPLICATION SOLVES
3. CORE FEATURES
4. ADVANCED FEATURES
5. USER TYPES AND PERMISSIONS
6. RECOMMENDED TECHNOLOGY STACK
7. DATABASE DESIGN AND TABLES
8. APPLICATION ARCHITECTURE
9. API ENDPOINTS
10. SECURITY AND PRIVACY
11. USER INTERFACE AND DESIGN DIRECTION
12. DEVELOPMENT ROADMAP
13. TESTING STRATEGY
14. DEPLOYMENT PLAN
15. POSSIBLE FUTURE IMPROVEMENTS

Important instructions:
- Make the architecture realistic and implementable.
- Explain important technical decisions.
- Avoid imaginary integrations or unsupported capabilities.
- Prioritise affordable and free technologies where practical.
- Organise the response using clear headings and bullet points.
- Do not generate the actual source code yet.
`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate the project blueprint.");
      }

      setBlueprint(data.reply || "No blueprint was returned.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyBlueprint() {
    if (!blueprint) return;

    try {
      await navigator.clipboard.writeText(blueprint);
    } catch {
      setError("Unable to copy the blueprint. Please copy it manually.");
    }
  }

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <AppSidebar
        activeItem="AI App Builder"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-7 lg:px-10">

            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                ZENTRIX Autonomous Development Studio
              </span>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Your idea.
                <span className="gradient-text"> Our starting point.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Describe the software you want to build. ZENTRIX will analyse
                your idea and develop a professional technical blueprint
                before we begin generating the actual application.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">

                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-500">
                    ✦
                  </div>

                  <div>
                    <h2 className="text-base font-semibold">
                      Describe your application
                    </h2>
                    <p className="text-xs text-[var(--muted)]">
                      Tell ZENTRIX what you want to create.
                    </p>
                  </div>
                </div>

                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                  What application do you want to build?
                </label>

                <textarea
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  placeholder="Example: I want to build a global online marketplace where customers can purchase products, vendors can manage their shops, and administrators can monitor the entire platform..."
                  className="min-h-[190px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 outline-none transition placeholder:text-[var(--muted)] focus:border-violet-500/50"
                />

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                      Project type
                    </label>

                    <select
                      value={projectType}
                      onChange={(event) => setProjectType(event.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none focus:border-violet-500"
                    >
                      <option>Web Application</option>
                      <option>Mobile Application</option>
                      <option>AI Application</option>
                      <option>E-commerce Platform</option>
                      <option>SaaS Platform</option>
                      <option>Website</option>
                      <option>Desktop Application</option>
                      <option>Game</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-[var(--muted)]">
                      Preferred technology
                    </label>

                    <select
                      value={technology}
                      onChange={(event) => setTechnology(event.target.value)}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none focus:border-violet-500"
                    >
                      <option>Recommend the best stack</option>
                      <option>Next.js and TypeScript</option>
                      <option>React and Node.js</option>
                      <option>React Native</option>
                      <option>Flutter</option>
                      <option>Python</option>
                      <option>HTML, CSS and JavaScript</option>
                      <option>Other</option>
                    </select>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={generateBlueprint}
                  disabled={!idea.trim() || loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Analysing your idea...
                    </>
                  ) : (
                    <>✦ Generate Project Blueprint</>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
                  Uses your currently selected ZENTRIX AI model.
                </p>

              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">

                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">
                      Development capabilities
                    </h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Our planned development workspace.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-500">
                    BUILDING
                  </span>
                </div>

                {[
                  ["01", "Project planning", "Analyse ideas and design software architecture."],
                  ["02", "AI code generation", "Generate application code and project files."],
                  ["03", "Debugging assistant", "Identify errors and propose corrections."],
                  ["04", "Project workspace", "Organise and manage generated files."],
                  ["05", "GitHub integration", "Connect repositories and manage changes."],
                  ["06", "Vercel deployment", "Prepare and deploy supported projects."],
                ].map(([number, title, description]) => (
                  <div
                    key={number}
                    className="flex gap-3 border-b border-[var(--border)] py-4 last:border-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-500">
                      {number}
                    </span>

                    <div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-1 text-xs leading-6 text-[var(--muted)]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}

              </section>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-500">
                {error}
              </div>
            )}

            <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">
                    Project Blueprint
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Your application&apos;s technical plan
                  </p>
                </div>

                {blueprint && (
                  <button
                    type="button"
                    onClick={copyBlueprint}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs transition hover:border-violet-500 hover:text-violet-500"
                  >
                    Copy blueprint
                  </button>
                )}
              </div>

              <div className="min-h-[250px] p-5">

                {loading ? (
                  <div className="flex items-center gap-3 py-10 text-sm text-violet-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-500" />
                    ZENTRIX is designing your project architecture...
                  </div>
                ) : blueprint ? (
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7">
                    {blueprint}
                  </pre>
                ) : (
                  <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
                    <span className="mb-4 text-4xl text-violet-500">✦</span>
                    <p className="text-sm font-medium">
                      Ready to build something?
                    </p>
                    <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--muted)]">
                      Describe your application and generate its technical
                      blueprint to begin.
                    </p>
                  </div>
                )}

              </div>
            </section>

            <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
              <p className="text-sm font-semibold text-violet-500">
                Development note
              </p>
              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                This is the first stage. We will progressively add code
                generation, project files, testing, GitHub connectivity,
                and deployment. These integrations are not active yet.
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
  }
