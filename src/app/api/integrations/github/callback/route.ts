import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptGitHubToken } from "@/lib/integrations/github-crypto";

export const runtime = "nodejs";

const CALLBACK_URL =
  "https://zentrix-ai-opal.vercel.app/api/integrations/github/callback";

export async function GET(request: NextRequest) {
  const redirectTo = new URL("/plugins", request.url);

  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const savedState = request.cookies.get("github_oauth_state")?.value;

  const response = (status: string) => {
    const url = new URL(redirectTo);
    url.searchParams.set("github", status);

    const result = NextResponse.redirect(url);

    result.cookies.set("github_oauth_state", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/integrations/github",
      maxAge: 0,
    });

    return result;
  };

  try {
    if (!state || !savedState || state !== savedState || !code) {
      return response("authorization_failed");
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return response("login_required");
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return response("configuration_error");
    }

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: CALLBACK_URL,
        }),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      return response("token_exchange_failed");
    }

    const tokens = await tokenResponse.json();

    if (tokens.error || !tokens.access_token) {
      return response("token_exchange_failed");
    }

    const profileResponse = await fetch(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      }
    );

    if (!profileResponse.ok) {
      return response("profile_fetch_failed");
    }

    const profile = await profileResponse.json();

    if (!profile.login) {
      return response("profile_fetch_failed");
    }

    const encryptedAccessToken = encryptGitHubToken(
      tokens.access_token
    );

    const encryptedRefreshToken = tokens.refresh_token
      ? encryptGitHubToken(tokens.refresh_token)
      : null;

    const expiresAt = tokens.expires_in
      ? new Date(
          Date.now() + Number(tokens.expires_in) * 1000
        ).toISOString()
      : null;

    const scopes =
      typeof tokens.scope === "string" && tokens.scope.length > 0
        ? tokens.scope.split(",").filter(Boolean)
        : [];

    const { error: saveError } = await supabase
      .from("github_connections")
      .upsert(
        {
          user_id: user.id,
          github_login: profile.login,
          encrypted_access_token: encryptedAccessToken,
          encrypted_refresh_token: encryptedRefreshToken,
          token_expires_at: expiresAt,
          scopes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      console.error("GitHub connection save failed:", saveError.message);
      return response("connection_save_failed");
    }

    return response("connected");
  } catch (error) {
    console.error("GitHub callback failed:", error);
    return response("connection_failed");
  }
}
