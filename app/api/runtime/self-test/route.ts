import { GET as runSelfTest } from "@/app/api/agent/self-test/route";
import { withVercelGatewayCredentials } from "@/app/lib/vercel-runtime-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return await withVercelGatewayCredentials(() => runSelfTest(request));
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Gateway authentication failed.";
    return NextResponse.json(
      { ok: false, error: detail.slice(0, 300) },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
