"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight, Code2, Copy, Download, Eye, FileCode2, Folder,
  Layers3, Loader2, Monitor, Play, RefreshCw, Smartphone, Sparkles, Tablet
} from "lucide-react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import { DEFAULT_MODEL } from "@/lib/ai/models";

type ProjectFile = { path: string; language: string; content: string };
type Project = {
  projectName: string;
  summary: string;
  files: ProjectFile[];
  previewHtml: string;
  createdAt: string;
};
type PreviewSize = "desktop" | "tablet" | "mobile";

const STORAGE_KEY = "zentrix-code-studio-project-v1";

function parseProjectJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error(
      "The AI response was incomplete. Please try again."
    );
  }

  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (/unterminated string|unexpected end|end of json/i.test(message)) {
      throw new Error(
        "The AI response was cut off before the project finished. Try a shorter project description."
      );
    }

    throw new Error(
      "The AI returned an invalid project format. Please try again."
    );
  }
}

async function readAIStream(response: Response) {
  if (!response.body) throw new Error("The AI response stream was empty.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true }).replace(/\r\n/g, "\n");
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      for (const line of event.split("\n").filter((item) => item.startsWith("data:"))) {
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          output += parsed?.choices?.[0]?.delta?.content || parsed?.choices?.[0]?.message?.content || "";
        } catch {
          output += data;
        }
      }
    }
  }

  buffer += decoder.decode();
  for (const line of buffer.split("\n").filter((item) => item.startsWith("data:"))) {
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data);
      output += parsed?.choices?.[0]?.delta?.content || parsed?.choices?.[0]?.message?.content || "";
    } catch {
      output += data;
    }
  }
  return output;
}

function buildPreviewFromFiles(files: ProjectFile[]) {
  const htmlFile =
    files.find((file) => /(^|\/)index\.html$/i.test(file.path)) ||
    files.find((file) => file.path.toLowerCase().endsWith(".html"));
  const css = files.filter((file) => file.path.toLowerCase().endsWith(".css")).map((file) => file.content).join("\n");
  const js = files.filter((file) => file.path.toLowerCase().endsWith(".js")).map((file) => file.content).join("\n");
  let html = htmlFile?.content || "<!doctype html><html><body><h1>Preview unavailable</h1></body></html>";
  if (css && !/<style[\s>]/i.test(html)) html = html.replace("</head>", "<style>" + css + "</style></head>");
  if (js && !/<script[\s>]/i.test(html)) html = html.replace("</body>", "<script>" + js + "</script></body>");
  return html;
}

function cleanFileName(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-");
}

export default function CodeGenerationStudioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [idea, setIdea] = useState("");
  const [projectType, setProjectType] = useState("Responsive website");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Project;
      if (parsed && Array.isArray(parsed.files) && parsed.files.length) {
        setProject(parsed);
        setSelectedFile(parsed.files[0].path);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const currentFile = useMemo(
    () => project?.files.find((file) => file.path === selectedFile) || project?.files[0] || null,
    [project, selectedFile]
  );

  async function buildProject() {
    if (!idea.trim() || loading) return;
    setLoading(true);
    setError("");
    setProject(null);
    setSelectedFile("");
    setTab("preview");

    const prompt = [
        `Project type: ${projectType}`,
  `User's project idea: ${idea.trim()}`,
  "Return ONLY one valid JSON object. Do not use Markdown fences or explanations outside JSON.",
  'Use this exact structure: {"projectName":"Name","summary":"Short description","files":[{"path":"index.html","language":"html","content":"complete source"},{"path":"styles.css","language":"css","content":"complete source"},{"path":"script.js","language":"javascript","content":"complete source"}]}.',
  "IMPORTANT: Do not include previewHtml or duplicate any source code. The Studio creates the preview from the files automatically.",
  "Generate complete connected source files, not snippets or TODO placeholders.",
  "For this first version, build a browser-ready HTML, CSS and vanilla JavaScript app. Use separate index.html, styles.css and script.js files where useful.",
  "Do not require npm, build tools, external scripts, API keys or backend services.",
  "Use local demo data for backend-dependent features. Clearly label demo-only payments, authentication and database actions; never pretend they are real.",
  "Create a polished, responsive, accessible, mobile-first interface with working interactions, validation and useful empty states.",
  "Keep the project compact but complete. Include every file needed for this runnable first version. Do not include secrets or credentials. Escape all JSON string values correctly."
];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  messages: [{ role: "user", content: prompt.join("\n") }],
  model: selectedModel,
  mode: "app-builder",
  responseStyle: "balanced"
})
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "ZENTRIX could not build this project. Please try again.");
      }

      const raw = await readAIStream(response);
      const result = parseProjectJson(raw);
      if (!Array.isArray(result.files) || !result.files.length) {
        throw new Error("The generated project did not contain any source files.");
      }

      const files: ProjectFile[] = result.files
  .filter((file: unknown): file is {
    path: string;
    content: string;
    language?: string;
  } => {
    if (!file || typeof file !== "object") return false;

    const item = file as Record<string, unknown>;

    return (
      typeof item.path === "string" &&
      typeof item.content === "string"
    );
  })
  .map((file: {
  path: string;
  content: string;
  language?: string;
}) => ({
    path: file.path.replace(/^\/+/, "").replace(/\.\./g, ""),
    language: file.language || "text",
    content: file.content
  }));

      if (!files.length) throw new Error("No usable source files were returned.");

      const nextProject: Project = {
        projectName: typeof result.projectName === "string" ? result.projectName : "My ZENTRIX Project",
        summary: typeof result.summary === "string" ? result.summary : "Generated project",
        files,
        previewHtml: typeof result.previewHtml === "string" && result.previewHtml.trim()
          ? result.previewHtml
          : buildPreviewFromFiles(files),
        createdAt: new Date().toISOString()
      };

      setProject(nextProject);
      setSelectedFile(files[0].path);
      setPreviewKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while building the project.");
    } finally {
      setLoading(false);
    }
  }

  function saveProject() {
    if (!project) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("This project is too large to save in this browser. Download a project backup instead.");
    }
  }

  async function copyCurrentFile() {
    if (!currentFile) return;
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access was blocked. Select and copy the code manually.");
    }
  }

  function downloadCurrentFile() {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = cleanFileName(currentFile.path.split("/").pop() || "source.txt");
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadProjectBackup() {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = cleanFileName(project.projectName) + "-project.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const previewWidth =
    previewSize === "mobile" ? "max-w-[390px]" :
    previewSize === "tablet" ? "max-w-[820px]" : "max-w-full";

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <AppSidebar
        activeItem="Code Generation Studio"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
      <section className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Code Generation Studio"
          subtitle="Build and preview browser-ready projects with ZENTRIX AI"
          modelName={selectedModel}
          onModelChange={setSelectedModel}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 lg:px-9">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold text-violet-400">
                  <Sparkles className="h-3.5 w-3.5" /> ZENTRIX BUILD & PREVIEW
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Turn ideas into <span className="gradient-text">working apps.</span>
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  Describe your idea. ZENTRIX generates project files and opens a live, isolated browser preview.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Browser preview sandbox
              </div>
            </div>

            <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-violet-400" />
                <h3 className="text-sm font-semibold">Start a new project</h3>
              </div>
              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_190px]">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Project type
                  <select value={projectType} onChange={(event) => setProjectType(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm text-[var(--foreground)] outline-none focus:border-violet-500">
                    <option>Responsive website</option>
                    <option>Business dashboard</option>
                    <option>Online store prototype</option>
                    <option>Portfolio website</option>
                    <option>Landing page</option>
                    <option>Web application prototype</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-[var(--muted)]">
                  Describe your project
                  <textarea value={idea} onChange={(event) => setIdea(event.target.value)}
                    placeholder="Example: Build a modern online marketplace with a homepage, product cards, search, category filters, shopping cart and a mobile-friendly design..."
                    className="mt-2 min-h-[112px] w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-violet-500" />
                </label>
                <div className="flex flex-col justify-end">
                  <button type="button" onClick={buildProject} disabled={!idea.trim() || loading}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Building...</> : <><Play className="h-4 w-4" /> Build project</>}
                  </button>
                  <p className="mt-2 text-center text-[10px] text-[var(--muted)]">Uses your selected ZENTRIX AI model.</p>
                </div>
              </div>
              {loading && (
                <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-3">
                  <p className="text-xs font-medium text-violet-400">Generating source files and live preview. Keep this page open.</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-500/10">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                  </div>
                </div>
              )}
              {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm leading-6 text-red-400">{error}</p>}
            </section>

            {project ? (
              <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-violet-400" />
                      <h3 className="truncate text-sm font-semibold">{project.projectName}</h3>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-500">Built</span>
                    </div>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted)]">{project.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={saveProject} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium hover:border-violet-500/40">{saved ? "Saved" : "Save project"}</button>
                    <button type="button" onClick={downloadProjectBackup} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium hover:border-violet-500/40">
                      <Download className="h-3.5 w-3.5" /> Project backup
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-1 rounded-xl bg-[var(--background)] p-1">
                    <button type="button" onClick={() => setTab("preview")} className={"inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold " + (tab === "preview" ? "bg-violet-600 text-white" : "text-[var(--muted)]")}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button type="button" onClick={() => setTab("code")} className={"inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold " + (tab === "code" ? "bg-violet-600 text-white" : "text-[var(--muted)]")}>
                      <Code2 className="h-3.5 w-3.5" /> Source code
                    </button>
                  </div>

                  {tab === "preview" ? (
                    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] p-1">
                      <button type="button" aria-label="Desktop preview" onClick={() => setPreviewSize("desktop")} className={"rounded-lg p-2 " + (previewSize === "desktop" ? "bg-violet-500/15 text-violet-400" : "text-[var(--muted)]")}><Monitor className="h-4 w-4" /></button>
                      <button type="button" aria-label="Tablet preview" onClick={() => setPreviewSize("tablet")} className={"rounded-lg p-2 " + (previewSize === "tablet" ? "bg-violet-500/15 text-violet-400" : "text-[var(--muted)]")}><Tablet className="h-4 w-4" /></button>
                      <button type="button" aria-label="Mobile preview" onClick={() => setPreviewSize("mobile")} className={"rounded-lg p-2 " + (previewSize === "mobile" ? "bg-violet-500/15 text-violet-400" : "text-[var(--muted)]")}><Smartphone className="h-4 w-4" /></button>
                      <button type="button" aria-label="Refresh preview" onClick={() => setPreviewKey((value) => value + 1)} className="rounded-lg p-2 text-[var(--muted)] hover:text-violet-400"><RefreshCw className="h-4 w-4" /></button>
                    </div>
                  ) : currentFile ? (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={copyCurrentFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs hover:border-violet-500/40"><Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy file"}</button>
                      <button type="button" onClick={downloadCurrentFile} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs hover:border-violet-500/40"><Download className="h-3.5 w-3.5" /> Download</button>
                    </div>
                  ) : null}
                </div>

                {tab === "preview" ? (
                  <div className="bg-[#11111a] p-3 sm:p-5">
                    <div className={"mx-auto overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl transition-all " + previewWidth}>
                      <div className="flex h-9 items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <div className="mx-auto max-w-[65%] truncate rounded-md bg-white px-4 py-1 text-[10px] text-slate-500">zentrix-preview.local</div>
                      </div>
                      <iframe key={previewKey} title={project.projectName + " live preview"} srcDoc={project.previewHtml}
                        sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" className="h-[620px] w-full bg-white" />
                    </div>
                    <p className="mt-3 text-center text-[10px] leading-5 text-slate-400">Preview runs in an isolated sandbox. Backend features and real payments remain demo-only until connected to services.</p>
                  </div>
                ) : (
                  <div className="grid min-h-[500px] lg:grid-cols-[250px_minmax(0,1fr)]">
                    <aside className="border-b border-[var(--border)] p-3 lg:border-b-0 lg:border-r">
                      <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Project files ({project.files.length})</p>
                      <div className="space-y-1">
                        {project.files.map((file) => (
                          <button key={file.path} type="button" onClick={() => { setSelectedFile(file.path); setCopied(false); }}
                            className={"flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs " + (currentFile?.path === file.path ? "bg-violet-500/10 text-violet-400" : "text-[var(--muted)] hover:bg-[var(--background)]")}>
                            <FileCode2 className="h-4 w-4 shrink-0" /><span className="truncate">{file.path}</span>
                            {currentFile?.path === file.path && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </div>
                    </aside>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                        <span className="truncate text-xs font-medium text-[var(--muted)]">{currentFile?.path}</span>
                        <span className="text-[10px] uppercase text-[var(--muted)]">{currentFile?.language}</span>
                      </div>
                      <pre className="max-h-[650px] min-h-[450px] overflow-auto p-4 text-xs leading-6 text-[var(--foreground)]"><code>{currentFile?.content}</code></pre>
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <section className="flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400"><Code2 className="h-7 w-7" /></div>
                <h3 className="text-base font-semibold">Your project workspace is ready</h3>
                <p className="mt-2 max-w-md text-xs leading-6 text-[var(--muted)]">Describe your idea above and select Build project. Your generated files and live preview will appear here.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-[10px] text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--border)] px-3 py-1.5">HTML / CSS / JavaScript</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1.5">Responsive preview</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1.5">File-by-file source</span>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
