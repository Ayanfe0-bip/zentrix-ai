"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Topbar from "@/components/layout/topbar";

interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: "ZENTRIX User",
  username: "zentrix-user",
  bio: "Exploring ideas, learning new things, and building without limits.",
};

const PROFILE_KEY = "zentrix-ai-profile";

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] =
    useState<UserProfile>(DEFAULT_PROFILE);
  const [form, setForm] =
    useState<UserProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        const loaded: UserProfile = {
          displayName:
            typeof parsed.displayName === "string"
              ? parsed.displayName
              : DEFAULT_PROFILE.displayName,
          username:
            typeof parsed.username === "string"
              ? parsed.username
              : DEFAULT_PROFILE.username,
          bio:
            typeof parsed.bio === "string"
              ? parsed.bio
              : DEFAULT_PROFILE.bio,
        };

        setProfile(loaded);
        setForm(loaded);
      }
    } catch {
      setProfile(DEFAULT_PROFILE);
      setForm(DEFAULT_PROFILE);
    }

    setReady(true);
  }, []);

  function updateField(
    field: keyof UserProfile,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function saveProfile() {
    const cleaned: UserProfile = {
      displayName: form.displayName.trim(),
      username: form.username
        .trim()
        .replace(/\s+/g, "-")
        .replace(/^@/, ""),
      bio: form.bio.trim(),
    };

    if (!cleaned.displayName || !cleaned.username) {
      setNotice("Display name and username are required.");
      return;
    }

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(cleaned)
      );

      setProfile(cleaned);
      setForm(cleaned);
      setEditing(false);
      setNotice("Your profile has been saved successfully.");
    } catch {
      setNotice("Unable to save your profile on this device.");
    }
  }

  function cancelEditing() {
    setForm(profile);
    setEditing(false);
    setNotice("");
  }

  const initials = profile.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#070817]">
      <AppSidebar
        activeItem="Profile"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="My Profile"
          subtitle="Manage your personal workspace identity"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <section className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                Personal Workspace
              </p>

              <h1 className="text-3xl font-bold text-white">
                Your Profile
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Personalize how you appear inside ZENTRIX AI.
              </p>
            </div>

            {notice && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-300"
              >
                {notice}
              </div>
            )}

            {!ready ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
                Loading your profile...
              </div>
            ) : (
              <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                  <div className="h-32 bg-gradient-to-r from-violet-700/50 via-purple-600/30 to-cyan-500/30" />

                  <div className="px-6 pb-7">
                    <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#101529] bg-gradient-to-br from-violet-500 to-cyan-500 text-3xl font-bold text-white shadow-xl">
                        {initials || "Z"}
                      </div>

                      <span className="mb-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        Local Profile
                      </span>
                    </div>

                    <div className="mt-5">
                      <h2 className="text-2xl font-bold text-white">
                        {profile.displayName}
                      </h2>

                      <p className="mt-1 text-sm text-violet-300">
                        @{profile.username}
                      </p>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                        {profile.bio || "No bio added yet."}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Profile Information
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Update your personal details.
                      </p>
                    </div>

                    {!editing && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(profile);
                          setEditing(true);
                          setNotice("");
                        }}
                        className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Display Name
                      </label>

                      <input
                        type="text"
                        value={
                          editing
                            ? form.displayName
                            : profile.displayName
                        }
                        onChange={(event) =>
                          updateField(
                            "displayName",
                            event.target.value
                          )
                        }
                        readOnly={!editing}
                        maxLength={50}
                        placeholder="Enter your display name"
                        className="w-full rounded-xl border border-white/10 bg-[#0c1022] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 read-only:opacity-75"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Username
                      </label>

                      <div className="flex items-center rounded-xl border border-white/10 bg-[#0c1022] px-4 focus-within:border-violet-400/50">
                        <span className="text-sm text-violet-400">
                          @
                        </span>

                        <input
                          type="text"
                          value={
                            editing
                              ? form.username
                              : profile.username
                          }
                          onChange={(event) =>
                            updateField(
                              "username",
                              event.target.value
                            )
                          }
                          readOnly={!editing}
                          maxLength={30}
                          placeholder="your-username"
                          className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-600 read-only:opacity-75"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        About You
                      </label>

                      <textarea
                        value={
                          editing ? form.bio : profile.bio
                        }
                        onChange={(event) =>
                          updateField("bio", event.target.value)
                        }
                        readOnly={!editing}
                        maxLength={250}
                        rows={4}
                        placeholder="Tell us a little about yourself..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-[#0c1022] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 read-only:opacity-75"
                      />

                      {editing && (
                        <p className="mt-2 text-right text-xs text-slate-500">
                          {form.bio.length}/250 characters
                        </p>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="mt-7 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={saveProfile}
                        className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110"
                      >
                        Save Changes
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/[0.07] to-violet-500/[0.07] p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-xl text-cyan-300">
                      ✦
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        Your ZENTRIX Identity
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        This profile is currently stored in your
                        browser. It is not yet connected to a
                        registered account or cloud synchronization.
                        Your information remains on this device.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
