import { configureRuntimeModels } from "@/app/lib/sabitx-runtime-config";
import { withVercelGatewayCredentials } from "@/app/lib/vercel-runtime-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  configureRuntimeModels();

  try {
    return await withVercelGatewayCredentials(async () => {
      const { POST: runAgentRoute } = await import("@/app/api/agent/route");
      return runAgentRoute(request);
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Gateway authentication failed.";
    return NextResponse.json(
      { error: "Runtime clearance bridge failed.", detail: detail.slice(0, 300) },
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
