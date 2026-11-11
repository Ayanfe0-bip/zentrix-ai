"use client";

import { useMemo, useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";
import { useCallback, useEffect, useMemo, useState } from "react";
const plugins = [
  {
    name: "GitHub",
    category: "Development",
    icon: "🐙",
    description: "Read repositories, create files, edit code, commit changes and manage projects.",
    color: "from-gray-500/20 to-slate-500/10",
    status: "Integration setup",
  },
  {
    name: "Vercel",
    category: "Development",
    icon: "▲",
    description: "Deploy websites, manage projects, inspect build logs and monitor deployments.",
    color: "from-white/10 to-gray-500/10",
    status: "Integration setup",
  },
  {
    name: "Supabase",
    category: "Database",
    icon: "⚡",
    description: "Connect databases, inspect tables, manage storage and work with project data.",
    color: "from-emerald-500/20 to-green-500/10",
    status: "Integration setup",
  },
  {
    name: "Figma",
    category: "Design",
    icon: "🎨",
    description: "Inspect designs, access design references and translate interfaces into code.",
    color: "from-purple-500/20 to-pink-500/10",
    status: "Integration setup",
  },
  {
    name: "Canva",
    category: "Design",
    icon: "🖌️",
    description: "Connect creative projects and work with supported Canva design tools.",
    color: "from-cyan-500/20 to-blue-500/10",
    status: "Integration setup",
  },
  {
    name: "Canvas Editor",
    category: "Development",
    icon: "📝",
    description: "Create, edit and refine code and documents in an interactive workspace.",
    color: "from-blue-500/20 to-indigo-500/10",
    status: "Integration setup",
  },
  {
    name: "Google Drive",
    category: "Productivity",
    icon: "📁",
    description: "Access connected documents and files and use them in your AI workspace.",
    color: "from-yellow-500/20 to-green-500/10",
    status: "Integration setup",
  },
  {
    name: "GitLab",
    category: "Development",
    icon: "🦊",
    description: "Access repositories, manage source code and work with development projects.",
    color: "from-orange-500/20 to-red-500/10",
    status: "Integration setup",
  },
  {
    name: "Lovable",
    category: "Development",
    icon: "💜",
    description: "Connect website-building workflows and manage supported projects.",
    color: "from-pink-500/20 to-purple-500/10",
    status: "Integration setup",
  },
  {
    name: "Netlify",
    category: "Development",
    icon: "🌐",
    description: "Manage website projects and deployments through connected accounts.",
    color: "from-teal-500/20 to-cyan-500/10",
    status: "Integration setup",
  },
  {
    name: "Cloudflare",
    category: "Development",
    icon: "☁️",
    description: "Work with supported Cloudflare services, deployments and infrastructure.",
    color: "from-orange-500/20 to-amber-500/10",
    status: "Integration setup",
  },
  {
    name: "Web Search",
    category: "Research",
    icon: "🔎",
    description: "Search the web and retrieve useful information, images and research.",
    color: "from-blue-500/20 to-cyan-500/10",
    status: "Already integrated",
  },
];

const categories = [
  "All",
  "Development",
  "Design",
  "Database",
  "Productivity",
  "Research",
];

export default function PluginsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [githubConnected, setGithubConnected] = useState(false);
  const [githubLogin, setGithubLogin] = useState("");
  const [githubLoading, setGithubLoading] = useState(true);
  const [githubDisconnecting, setGithubDisconnecting] = useState(false);
  const [githubMessage, setGithubMessage] = useState("");

  const checkGitHubConnection = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/integrations/github/status",
        { cache: "no-store" }
      );

      const data = await response.json();

      setGithubConnected(Boolean(data.connected));
      setGithubLogin(data.githubLogin || "");
    } catch {
      setGithubConnected(false);
      setGithubLogin("");
    } finally {
      setGithubLoading(false);
    }
  }, []);

  useEffect(() => {
    checkGitHubConnection();

    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get("github");

    if (githubStatus === "connected") {
      setGithubMessage("GitHub connected successfully!");
    } else if (githubStatus) {
      setGithubMessage(
        "GitHub connection failed. Please try again."
      );
    }

    if (githubStatus) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname
      );
    }
  }, [checkGitHubConnection]);

  const disconnectGitHub = async () => {
    setGithubDisconnecting(true);
    setGithubMessage("");

    try {
      const response = await fetch(
        "/api/integrations/github/disconnect",
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to disconnect.");
      }

      setGithubConnected(false);
      setGithubLogin("");
      setGithubMessage("GitHub disconnected successfully!");
    } catch (error) {
      setGithubMessage(
        error instanceof Error
          ? error.message
          : "Unable to disconnect GitHub."
      );
    } finally {
      setGithubDisconnecting(false);
    }
  };

  const filteredPlugins = useMemo(() => {
    return plugins.filter((plugin) => {
      const matchesCategory =
        category === "All" || plugin.category === category;

      const matchesSearch =
        plugin.name.toLowerCase().includes(search.toLowerCase()) ||
        plugin.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--background)]">
      <AppSidebar
        activeItem="Plugins"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Plugin Marketplace"
          subtitle="Extend what ZENTRIX AI can do"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="flex-1 overflow-y-auto px-4 py-7 sm:px-7 lg:px-10">
          <div className="mx-auto max-w-6xl">

            <div className="relative mb-9 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-[#171338] via-[#10152d] to-[#071b2b] p-6 sm:p-9">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-cyan-500/10 blur-[80px]" />

              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                  ZENTRIX Ecosystem
                </span>

                <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Your AI. Your Tools.
                  <span className="block bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                    Unlimited Possibilities.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  Discover powerful integrations that will expand
                  your AI workspace. From research and coding to
                  productivity and creativity, build your own
                  intelligent toolkit.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                    <p className="text-xl font-bold text-white">12</p>
                     <p className="text-[10px] text-slate-400">Integrations & Tools</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                    <p className="text-xl font-bold text-white">6</p>
                    <p className="text-[10px] text-slate-400">Categories</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                    <p className="text-xl font-bold text-cyan-300">∞</p>
                    <p className="text-[10px] text-slate-400">Possibilities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  Explore Plugins
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Discover tools for your AI workspace.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ⌕
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search plugins..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-violet-500"
                />
              </div>
            </div>

            <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition ${
                    category === item
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-slate-500 hover:border-violet-500/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {filteredPlugins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
                <div className="text-3xl">🔎</div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">
                  No plugins found
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try another search or category.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPlugins.map((plugin) => (
                  <article
                    key={plugin.name}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-950/10"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${plugin.color} text-3xl`}
                      >
                        {plugin.icon}
                      </div>

                      <span
  className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
    plugin.name === "GitHub" && githubConnected
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-500"
      : "border-amber-400/20 bg-amber-400/10 text-amber-500"
  }`}
>
  {plugin.name === "GitHub"
    ? githubLoading
      ? "Checking..."
      : githubConnected
        ? "Connected"
        : "Not connected"
    : plugin.status}
</span>

                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                      {plugin.category}
                    </p>

                    <h4 className="mt-2 text-lg font-bold text-[var(--foreground)]">
                      {plugin.name}
                    </h4>

                    <p className="mt-2 min-h-[66px] text-sm leading-6 text-slate-500">
                      {plugin.description}
                    </p>

                 {plugin.name === "GitHub" ? (
  <div className="mt-5 space-y-2">
    {githubConnected && githubLogin && (
      <p className="text-center text-xs text-emerald-500">
        Connected as @{githubLogin}
      </p>
    )}

    <button
      type="button"
      disabled={githubLoading || githubDisconnecting}
      onClick={() => {
        window.location.href =
          "/api/integrations/github/connect";
      }}
      className="w-full rounded-xl bg-violet-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
    >
      {githubLoading
        ? "Checking connection..."
        : githubConnected
          ? "Reconnect GitHub"
          : "Connect GitHub"}
    </button>

    {githubConnected && (
      <button
        type="button"
        disabled={githubDisconnecting}
        onClick={disconnectGitHub}
        className="w-full rounded-xl border border-red-500/30 px-4 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
      >
        {githubDisconnecting
          ? "Disconnecting..."
          : "Disconnect GitHub"}
      </button>
    )}
  </div>
) : (
  <button
    type="button"
    disabled
    className="mt-5 w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--surface-light)] px-4 py-3 text-xs font-semibold text-slate-500"
  >
    {plugin.status === "Already integrated"
      ? "Available in Chat"
      : "Connection Setup in Progress"}
  </button>
)}
          
                    <div className="mt-10 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6 text-center">
              <div className="text-2xl">🚀</div>

              <h3 className="mt-3 text-lg font-bold text-[var(--foreground)]">
                Have an idea for a plugin?
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                The ZENTRIX ecosystem will continue to grow.
                More integrations and intelligent tools are planned.
              </p>

              <p className="mt-4 text-xs font-semibold text-violet-400">
                THINK BEYOND. BUILD WITHOUT LIMITS.
              </p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
  }
