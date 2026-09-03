import { configureRuntimeModels } from "@/app/lib/sabitx-runtime-config";
import { withVercelGatewayCredentials } from "@/app/lib/vercel-runtime-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  configureRuntimeModels();

  try {
    return await withVercelGatewayCredentials(async () => {
      const { GET: runSelfTest } = await import(
        "@/app/api/agent/self-test/route"
      );
      return runSelfTest(request);
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Gateway authentication failed.";
    return NextResponse.json(
      { ok: false, error: detail.slice(0, 300) },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
