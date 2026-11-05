"use client";

import { useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import { DEFAULT_MODEL } from "@/lib/ai/models";

export default function CodeAssistantPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState("");
  const [task, setTask] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleAskAI() {
    if (!task.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    const prompt = [
      "You are ZENTRIX AI's expert programming assistant.",
      `Programming language: ${language}.`,
      `User's request: ${task}`,
      code.trim()
        ? `Existing code:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``
        : "No existing code was provided.",
      "Provide a clear, practical solution. Include corrected or complete code where appropriate.",
    ].join("\n\n");

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
        throw new Error(
          data.error || "Unable to get a response. Please try again."
        );
      }

      setResult(data.reply || "No response was returned.");
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

  async function copyResponse() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy. Please select and copy the response manually.");
    }
  }

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <AppSidebar
        activeItem="Code Assistant"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <section className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Code Assistant"
          subtitle="Your intelligent programming workspace"
          modelName={selectedModel}
          onModelChange={setSelectedModel}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-7 sm:px-7 lg:px-10">
            <div className="mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">
                ZENTRIX Developer Studio
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Build something
                <span className="gradient-text"> extraordinary.</span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                Write code, debug errors, understand programming concepts,
                and bring your software ideas to life with ZENTRIX AI.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Code editor */}
              <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                    <h3 className="text-sm font-semibold">Code Editor</h3>
                  </div>

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    aria-label="Programming language"
                    className="max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface-light)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-violet-500"
                  >
                    <option>JavaScript</option>
                    <option>TypeScript</option>
                    <option>Python</option>
                    <option>HTML</option>
                    <option>CSS</option>
                    <option>React</option>
                    <option>Java</option>
                    <option>C++</option>
                    <option>PHP</option>
                    <option>SQL</option>
                  </select>
                </div>

                <div className="p-3">
                  <textarea
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    spellCheck={false}
                    aria-label="Code editor"
                    placeholder={`// Paste or write your ${language} code here...`}
                    className="min-h-[300px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-7 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-violet-500/50"
                  />
                </div>

                <div className="flex items-center justify-between px-4 pb-4">
                  <span className="text-[11px] text-[var(--muted)]">
                    {code.length} characters
                  </span>

                  <button
                    type="button"
                    onClick={() => setCode("")}
                    disabled={!code}
                    className="rounded-lg px-3 py-2 text-xs text-[var(--muted)] transition hover:bg-violet-500/10 hover:text-violet-500 disabled:opacity-40"
                  >
                    Clear editor
                  </button>
                </div>
              </section>

              {/* AI task panel */}
              <section className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <h3 className="text-sm font-semibold">Ask ZENTRIX</h3>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <label
                    htmlFor="developer-task"
                    className="mb-3 text-xs font-medium text-[var(--muted)]"
                  >
                    What would you like to accomplish?
                  </label>

                  <textarea
                    id="developer-task"
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                    placeholder="Example: Find and fix the errors in my code. Explain what went wrong..."
                    className="min-h-[130px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-violet-500/50"
                  />

                  <button
                    type="button"
                    onClick={handleAskAI}
                    disabled={!task.trim() || loading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ZENTRIX is working...
                      </>
                    ) : (
                      <>✦ Ask ZENTRIX AI</>
                    )}
                  </button>

                  <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
                    Your selected AI model will process this request.
                  </p>
                </div>
              </section>
            </div>

            {/* AI response */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold">AI Response</h3>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={copyResponse}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition hover:border-violet-500/40 hover:text-violet-500"
                  >
                    {copied ? "Copied!" : "Copy response"}
                  </button>
                )}
              </div>

              <div className="min-h-[180px] p-5">
                {loading ? (
                  <div className="flex items-center gap-3 py-8 text-sm text-violet-500">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-500" />
                    Analyzing your request...
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-sm leading-7 text-red-500">
                      {error}
                    </p>
                  </div>
                ) : result ? (
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-[var(--foreground)]">
                    {result}
                  </pre>
                ) : (
                  <div className="flex min-h-[130px] flex-col items-center justify-center text-center">
                    <span className="mb-3 text-3xl text-violet-500">✦</span>

                    <p className="text-sm font-medium text-[var(--foreground)]">
                      Your AI response will appear here.
                    </p>

                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Ask a programming question to get started.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Developer tip */}
            <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5">
              <p className="text-sm font-semibold text-violet-500">
                Developer tip
              </p>

              <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                Give ZENTRIX your code and describe the problem clearly.
                You can ask it to explain, debug, improve, or rewrite your
                code.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
