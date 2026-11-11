import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(
        new URL("/auth", process.env.NEXT_PUBLIC_APP_URL || "https://zentrix-ai-opal.vercel.app")
      );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json(
        { error: "GitHub integration is not configured." },
        { status: 500 }
      );
    }

    const state = randomBytes(32).toString("hex");

    const callbackUrl =
      "https://zentrix-ai-opal.vercel.app/api/integrations/github/callback";

    const githubUrl = new URL(
      "https://github.com/login/oauth/authorize"
    );

    githubUrl.searchParams.set("client_id", clientId);
    githubUrl.searchParams.set("redirect_uri", callbackUrl);
    githubUrl.searchParams.set("state", state);
    githubUrl.searchParams.set("allow_signup", "false");

    const response = NextResponse.redirect(githubUrl);

    response.cookies.set("github_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/integrations/github",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error("GitHub connection error:", error);

    return NextResponse.json(
      { error: "Unable to start GitHub connection." },
      { status: 500 }
    );
  }
}
