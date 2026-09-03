import { NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyze";
import { AnalyzeRequestSchema } from "@/lib/schemas";
import { normalizePublicUrl } from "@/lib/url";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = AnalyzeRequestSchema.parse(await request.json());
    const url = normalizePublicUrl(body.websiteUrl);
    const report = await analyzeWebsite(url.toString());
    return NextResponse.json(report);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Analysis failed unexpectedly.";
    const upstreamStatus = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status)
      : 0;
    const message = upstreamStatus === 401 || /incorrect api key/i.test(rawMessage)
      ? "OpenCode Go rejected the configured API key. Replace OPENCODE_API_KEY in .env.local with an active OpenCode Go key."
      : upstreamStatus === 429
        ? "The OpenCode Go account is currently rate-limited or has no available quota."
        : upstreamStatus >= 400
          ? "OpenCode Go could not complete the analysis request. Check the server log and try again."
          : rawMessage;
    const status = /OPENCODE_API_KEY|OpenCode Go rejected|rate-limited/i.test(message)
      ? 503
      : /URL|private|HTTP|website|hostname/i.test(message)
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
