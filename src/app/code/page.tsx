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

  async function handleAskAI() {
    if (!task.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult("");

    const prompt = [
      `You are ZENTRIX AI's expert programming assistant.`,
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

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[#070817] text-white">
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
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                ZENTRIX Developer Studio
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Build something
                <span className="gradient-text"> extraordinary.</span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Write code, debug errors, understand programming concepts,
                and bring your software ideas to life with ZENTRIX AI.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1023]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                    <h3 className="text-sm font-semibold">Code Editor</h3>
                  </div>

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="rounded-lg border border-white/10 bg-[#171b32] px-3 py-2 text-xs text-slate-200 outline-none"
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
                    placeholder={`// Paste or write your ${language} code here...`}
                    className="min-h-[300px] w-full resize-y rounded-xl border border-white/[0.06] bg-[#080b18] p-4 font-mono text-sm leading-7 text-cyan-100 outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
                  />
                </div>

                <div className="flex items-center justify-between px-4 pb-4">
                  <span className="text-[11px] text-slate-500">
                    {code.length} characters
                  </span>

                  <button
                    type="button"
                    onClick={() => setCode("")}
                    className="rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    Clear editor
                  </button>
                </div>
              </section>

              <section className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1023]">
                <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  <h3 className="text-sm font-semibold">Ask ZENTRIX</h3>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <label className="mb-3 text-xs font-medium text-slate-400">
                    What would you like to accomplish?
                  </label>

                  <textarea
                    value={task}
                    onChange={(event) => setTask(event.target.value)}
                    placeholder="Example: Find and fix the errors in my code. Explain what went wrong..."
                    className="min-h-[130px] w-full resize-y rounded-xl border border-white/[0.07] bg-[#080b18] p-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/40"
                  />

                  <button
                    type="button"
                    onClick={handleAskAI}
                    disabled={!task.trim() || loading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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

                  <p className="mt-3 text-center text-[11px] text-slate-500">
                    Your selected AI model will process this request.
                  </p>
                </div>
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1023]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-semibold">AI Response</h3>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard.writeText(result)
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5"
                  >
                    Copy response
                  </button>
                )}
              </div>

              <div className="min-h-[180px] p-5">
                {loading ? (
                  <div className="flex items-center gap-3 py-8 text-sm text-violet-300">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
                    Analyzing your request...
                  </div>
                ) : error ? (
                  <p className="py-6 text-sm leading-7 text-rose-400">
                    {error}
                  </p>
                ) : result ? (
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-slate-300">
                    {result}
                  </pre>
                ) : (
                  <div className="flex min-h-[130px] flex-col items-center justify-center text-center">
                    <span className="mb-3 text-3xl text-violet-400">✦</span>
                    <p className="text-sm font-medium text-slate-300">
                      Your AI response will appear here.
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Ask a programming question to get started.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <div className="mt-6 rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-5">
              <p className="text-sm font-semibold text-violet-300">
                Developer tip
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-400">
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
