import { hasRunAccess, sameOrigin } from "@/app/lib/runtime-access";
import { listJobs } from "@/app/lib/coding-store";
import { prepareCodingJob } from "@/app/lib/coding-service";
import { withVercelGatewayCredentials } from "@/app/lib/vercel-runtime-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;
function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
export async function GET(request: Request) {
  if (!hasRunAccess(request)) return reply({ error: "Clearance denied." }, 401);
  try { return reply({ jobs: await listJobs() }); }
  catch { return reply({ error: "Saved jobs are temporarily unavailable." }, 503); }
}
export async function POST(request: Request) {
  if (!hasRunAccess(request)) return reply({ error: "Clearance denied." }, 401);
  if (!sameOrigin(request)) return reply({ error: "Request origin denied." }, 403);
  const raw = await request.text();
  if (raw.length > 6000) return reply({ error: "Request is too large." }, 413);
  let body: { objective?: unknown; paths?: unknown };
  try { body = JSON.parse(raw); } catch { return reply({ error: "Invalid request." }, 400); }
  if (!body || typeof body.objective !== "string") return reply({ error: "An objective is required." }, 400);
  try {
    const job = await withVercelGatewayCredentials(() => prepareCodingJob(body.objective as string, body.paths));
    return reply({ job }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safe = /^(Choose |Enter |Each |Five coding)/.test(message);
    return reply({ error: safe ? message : "The job could not be started. Check the saved register before trying again." }, safe ? 400 : 503);
  }
}
