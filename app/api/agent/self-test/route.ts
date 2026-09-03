import { createHash, timingSafeEqual } from "node:crypto";
import { executeAgent } from "@/app/lib/sabitx-agent";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

// Temporary preview-only verification route. Remove before merging to main.
const PROBE_HASH =
  "a9c2c4a5c18b812fd48432c9485d6e20aeea1953c8b0517ce24c412d78b8587c";

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
  if (!authorized(probe)) {
    return NextResponse.json(
      { error: "Not found." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const run = await executeAgent(
      "Verify the SABITX architect-to-operator pipeline is online. Return a minimal two-step verification plan and propose no external actions."
    );

    return NextResponse.json(
      {
        ok: true,
        runId: run.id,
        models: run.models,
        verification: run.verification,
        timingMs: run.timingMs,
        specification: {
          objective: run.specification.objective,
          requirements: run.specification.requirements,
        },
        operatorPlanPreview: run.operatorPlan.slice(0, 700),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown failure.";
    return NextResponse.json(
      { ok: false, error: message.slice(0, 300) },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
