import { configureRuntimeModels } from "@/app/lib/sabitx-runtime-config";
import { gatewayCredentialsAvailable } from "@/app/lib/vercel-runtime-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const models = configureRuntimeModels();
  const gatewayReady = gatewayCredentialsAvailable();

  return NextResponse.json(
    {
      system: "SABITX",
      runtime: "online",
      signal: gatewayReady ? "active" : "degraded",
      clearance: "required",
      version: "run-v1",
      modules: ["ask", "operator", "vault", "runs"],
      agent: {
        state: gatewayReady ? "ready" : "configuration-required",
        pipeline: "architect → operator → verification",
        architect: models.architect,
        operator: models.operator,
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
