import { GET as readStatus, OPTIONS as statusOptions } from "@/app/api/status/route";
import {
  gatewayCredentialsAvailable,
  withVercelGatewayCredentials,
} from "@/app/lib/vercel-runtime-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!gatewayCredentialsAvailable()) {
    return readStatus();
  }

  return withVercelGatewayCredentials(async () => readStatus());
}

export function OPTIONS() {
  return statusOptions();
}
