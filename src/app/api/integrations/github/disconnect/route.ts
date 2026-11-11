import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("github_connections")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("GitHub disconnect error:", error.message);

      return NextResponse.json(
        { error: "Unable to disconnect GitHub." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "GitHub account disconnected successfully.",
    });
  } catch (error) {
    console.error("GitHub disconnect failed:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
