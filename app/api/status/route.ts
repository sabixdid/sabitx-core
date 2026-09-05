import {
  ARCHITECT_MODEL,
  gatewayIsConfigured,
  OPERATOR_MODEL,
} from "@/app/lib/sabitx-agent";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const gatewayReady = gatewayIsConfigured();

  return NextResponse.json(
    {
      system: "SABITX",
      runtime: "online",
      signal: gatewayReady ? "active" : "degraded",
      clearance: "required",
      version: "run-v2",
      modules: ["ask", "operator", "vault", "runs", "coding"],
      coding: {
        configuration: gatewayReady && !!process.env.DATABASE_URL && /^[a-f0-9]{64}$/i.test(process.env.SABITX_RUN_KEY_SHA256 || "") ? "present" : "required",
        workflow: "propose → isolated build → approval → verified branch",
        scope: "SABITX Core UI and documentation",
        storage: "private",
        approvalRequired: true,
        automaticMerge: false,
      },
      agent: {
        state: gatewayReady ? "ready" : "configuration-required",
        pipeline: "architect → operator → verification",
        architect: ARCHITECT_MODEL,
        operator: OPERATOR_MODEL,
      },
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
