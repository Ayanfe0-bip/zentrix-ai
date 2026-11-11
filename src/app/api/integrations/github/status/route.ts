import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { connected: false, error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("github_connections")
      .select("github_login, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("GitHub status error:", error.message);

      return NextResponse.json(
        { connected: false, error: "Unable to check connection." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        connected: Boolean(data),
        githubLogin: data?.github_login ?? null,
        connectedAt: data?.updated_at ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GitHub status failed:", error);

    return NextResponse.json(
      { connected: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
