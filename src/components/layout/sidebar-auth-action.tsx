"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SidebarAuthAction() {
  const router = useRouter();

  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null);
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);

    client.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    if (!supabase) return;

    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setSigningOut(false);
      return;
    }

    router.replace("/auth");
    router.refresh();
  }

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/auth"
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-black/[0.04] hover:text-violet-500"
      >
        <span>Sign In / Create Account</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      {signingOut ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
