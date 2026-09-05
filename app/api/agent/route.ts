import { hasRunAccess } from "@/app/lib/runtime-access";
import { executeAgent } from "@/app/lib/sabitx-agent";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const MAX_OBJECTIVE_LENGTH = 4_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT_MAX_RUNS = 5;

type RateBucket = { count: number; resetAt: number };
type GlobalRateState = typeof globalThis & {
  __sabitxRateBuckets?: Map<string, RateBucket>;
};

const globalRateState = globalThis as GlobalRateState;
const rateBuckets =
  globalRateState.__sabitxRateBuckets ?? new Map<string, RateBucket>();
globalRateState.__sabitxRateBuckets = rateBuckets;

function getClientId(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function consumeRateLimit(clientId: string) {
  const now = Date.now();
  const current = rateBuckets.get(clientId);

  if (!current || current.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateBuckets.set(clientId, bucket);
    return { allowed: true, remaining: RATE_LIMIT_MAX_RUNS - 1, ...bucket };
  }

  if (current.count >= RATE_LIMIT_MAX_RUNS) {
    return { allowed: false, remaining: 0, ...current };
  }

  current.count += 1;
  rateBuckets.set(clientId, current);
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_RUNS - current.count,
    ...current,
  };
}

export async function POST(request: NextRequest) {
  if (!hasRunAccess(request)) {
    return NextResponse.json(
      { error: "Clearance denied." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let objective = "";
  try {
    const body = (await request.json()) as { objective?: unknown };
    objective =
      typeof body.objective === "string" ? body.objective.trim() : "";
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!objective) {
    return NextResponse.json(
      { error: "Objective required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (objective.length > MAX_OBJECTIVE_LENGTH) {
    return NextResponse.json(
      { error: `Objective exceeds ${MAX_OBJECTIVE_LENGTH} characters.` },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rate = consumeRateLimit(getClientId(request));
  if (!rate.allowed) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rate.resetAt - Date.now()) / 1_000)
    );
    return NextResponse.json(
      {
        error: "Run limit reached. Signal resets shortly.",
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfterSeconds),
        },
      }
    );
  }

  try {
    const run = await executeAgent(objective);
    return NextResponse.json(
      { run, rateLimitRemaining: rate.remaining },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("SABITX agent run failed", error);
    const message =
      error instanceof Error ? error.message : "Unknown runtime failure.";

    return NextResponse.json(
      {
        error: "Run failed before verification.",
        detail: message.slice(0, 300),
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Use POST to create a run." },
    {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    }
  );
}
