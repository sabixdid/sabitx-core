import { createHash, timingSafeEqual } from "node:crypto";
import { withVercelGatewayCredentials } from "@/app/lib/vercel-runtime-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PROBE_HASH =
  "a9c2c4a5c18b812fd48432c9485d6e20aeea1953c8b0517ce24c412d78b8587c";

const ALLOWED_MODELS = new Set([
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "openai/gpt-4.1-nano",
  "openai/gpt-4.1-mini",
  "google/gemini-3.5-flash-lite",
  "alibaba/qwen-3-14b",
  "alibaba/qwen3-coder-30b-a3b",
  "anthropic/claude-haiku-4.5",
  "moonshotai/kimi-k2.5",
  "minimax/minimax-m2.1",
]);

function authorized(value: string) {
  const actual = Buffer.from(
    createHash("sha256").update(value, "utf8").digest("hex"),
    "hex"
  );
  const expected = Buffer.from(PROBE_HASH, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: NextRequest) {
  const probe = request.nextUrl.searchParams.get("probe") || "";
  const model = request.nextUrl.searchParams.get("model") || "";

  if (!authorized(probe) || !ALLOWED_MODELS.has(model)) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  return withVercelGatewayCredentials(async () => {
    const token =
      process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "";
    const startedAt = Date.now();
    const response = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ai-reporting-tags": "system:sabitx,surface:model-probe",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Reply only with OK." }],
          stream: false,
          max_tokens: 12,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      }
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          model?: string;
          choices?: Array<{ message?: { content?: string } }>;
          error?: { message?: string };
        }
      | null;

    return NextResponse.json(
      {
        ok: response.ok,
        requestedModel: model,
        resolvedModel: payload?.model || null,
        answer: payload?.choices?.[0]?.message?.content || null,
        error: payload?.error?.message || null,
        status: response.status,
        durationMs: Date.now() - startedAt,
      },
      { status: response.ok ? 200 : response.status, headers: { "Cache-Control": "no-store" } }
    );
  });
}
