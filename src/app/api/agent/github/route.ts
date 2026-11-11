import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptGitHubToken } from "@/lib/integrations/github-crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_API = "https://api.github.com";

function githubHeaders(token: string) {
return {
 Authorization: `Bearer ${token}`,
Accept: "application/vnd.github+json",
"X-GitHub-Api-Version": "2022-11-28",
};
}

function sendEvent(
controller: ReadableStreamDefaultController,
encoder: TextEncoder,
event: Record<string, unknown>
) {
controller.enqueue(
encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
);
}

export async function POST(request: NextRequest) {
try {
const supabase = await createClient();

const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
  return Response.json(
    { error: "Please sign in to ZENTRIX first." },
    { status: 401 }
  );
}

const { data: connection, error: connectionError } =
  await supabase
    .from("github_connections")
    .select(
      "github_login, encrypted_access_token"
    )
    .eq("user_id", user.id)
    .maybeSingle();

if (connectionError || !connection) {
  return Response.json(
    { error: "Connect your GitHub account first." },
    { status: 403 }
  );
}

const token = decryptGitHubToken(
  connection.encrypted_access_token
);

const body = await request.json().catch(() => ({}));

const requestedRepository =
  typeof body.repository === "string"
    ? body.repository.trim()
    : "zentrix-ai";

const encoder = new TextEncoder();

const stream = new ReadableStream({
  async start(controller) {
    const progress = (message: string) => {
      sendEvent(controller, encoder, {
        type: "progress",
        message,
      });
    };

    try {
      progress("Connecting securely to GitHub...");

      const profileResponse = await fetch(
        `${GITHUB_API}/user`,
        {
          headers: githubHeaders(token),
          cache: "no-store",
        }
      );

      if (!profileResponse.ok) {
        throw new Error(
          "GitHub authentication could not be verified."
        );
      }

      const profile = await profileResponse.json();

      progress(
        `Authenticated as @${profile.login}.`
      );

      progress("Retrieving accessible repositories...");

      const repositoriesResponse = await fetch(
        `${GITHUB_API}/user/repos?per_page=100&sort=updated`,
        {
          headers: githubHeaders(token),
          cache: "no-store",
        }
      );

      if (!repositoriesResponse.ok) {
        throw new Error(
          "Unable to retrieve your GitHub repositories."
        );
      }

      const repositories =
        await repositoriesResponse.json();

      if (!Array.isArray(repositories)) {
        throw new Error(
          "GitHub returned an unexpected repository list."
        );
      }

      progress(
        `Found ${repositories.length} accessible repositories.`
      );

      const target = repositories.find(
        (repo: { full_name?: string; name?: string }) =>
          repo.full_name?.toLowerCase() ===
            requestedRepository.toLowerCase() ||
          repo.name?.toLowerCase() ===
            requestedRepository.toLowerCase()
      );

      if (!target) {
        sendEvent(controller, encoder, {
          type: "result",
          content: [
            "# GitHub inspection completed",
            "",
            `**GitHub account:** @${profile.login}`,
            `**Repositories found:** ${repositories.length}`,
            "",
            `I could not find the repository **${requestedRepository}** among the repositories returned by GitHub.`,
            "",
            "Here are some accessible repositories:",
            ...repositories.slice(0, 15).map(
              (repo: {
                full_name: string;
                private: boolean;
              }) =>
                `- ${repo.full_name} (${repo.private ? "Private" : "Public"})`
            ),
          ].join("\n"),
        });

        controller.close();
        return;
      }

      progress(
        `Opening repository ${target.full_name}...`
      );

      const repoResponse = await fetch(
        `${GITHUB_API}/repos/${target.full_name}`,
        {
          headers: githubHeaders(token),
          cache: "no-store",
        }
      );

      if (!repoResponse.ok) {
        throw new Error(
          "Unable to inspect the selected repository."
        );
      }

      const repo = await repoResponse.json();

      progress("Inspecting repository README...");

      const readmeResponse = await fetch(
        `${GITHUB_API}/repos/${target.full_name}/readme`,
        {
          headers: githubHeaders(token),
          cache: "no-store",
        }
      );

      let readme = "This repository does not have a README file.";

      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();

        if (readmeData.content) {
          readme = Buffer.from(
            readmeData.content,
            "base64"
          ).toString("utf8");
        }
      }

      progress("Preparing repository analysis...");

      const result = [
        "# GitHub repository inspection",
        "",
        "## GitHub account",
        `- Username: @${profile.login}`,
        `- Name: ${profile.name || "Not provided"}`,
        `- Accessible repositories: ${repositories.length}`,
        "",
        "## Repository details",
        `- Repository: ${repo.full_name}`,
        `- Description: ${repo.description || "No description"}`,
        `- Visibility: ${repo.private ? "Private" : "Public"}`,
        `- Default branch: ${repo.default_branch}`,
        `- Primary language: ${repo.language || "Not specified"}`,
        `- Stars: ${repo.stargazers_count}`,
        `- Last updated: ${repo.updated_at}`,
        "",
        "## README contents",
        readme,
        "",
        "## Inspection status",
        "- GitHub authentication: Successful",
        "- Repository listing: Successful",
        "- Repository details: Retrieved",
        "- README access: Completed",
        "",
        "This was a read-only inspection. No repository files were changed.",
      ].join("\n");

      sendEvent(controller, encoder, {
        type: "result",
        content: result,
      });

      controller.close();
    } catch (error) {
      console.error(
        "GitHub agent error:",
        error instanceof Error
          ? error.message
          : "Unknown error"
      );

      sendEvent(controller, encoder, {
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "GitHub inspection failed.",
      });

      controller.close();
    }
  },
});

return new Response(stream, {
  status: 200,
  headers: {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  },
});

} catch (error) {
console.error("GitHub agent setup failed:", error);

return Response.json(
  { error: "Unable to start the GitHub agent." },
  { status: 500 }
);

}
  }
