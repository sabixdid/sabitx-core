import { hasRunAccess, sameOrigin } from "@/app/lib/runtime-access";
import { getJob } from "@/app/lib/coding-store";
import { approveCodingJob, cancelCodingJob } from "@/app/lib/coding-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
type Context = { params: Promise<{ id: string }> };
function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
export async function GET(request: Request, context: Context) {
  if (!hasRunAccess(request)) return reply({ error: "Clearance denied." }, 401);
  try { const job = await getJob((await context.params).id); return job ? reply({ job }) : reply({ error: "Job not found." }, 404); }
  catch { return reply({ error: "The saved job is temporarily unavailable." }, 503); }
}
export async function POST(request: Request, context: Context) {
  if (!hasRunAccess(request)) return reply({ error: "Clearance denied." }, 401);
  if (!sameOrigin(request)) return reply({ error: "Request origin denied." }, 403);
  const raw = await request.text();
  if (raw.length > 1000) return reply({ error: "Request is too large." }, 413);
  try {
    const body = JSON.parse(raw) as { action?: string; digest?: unknown };
    const { id } = await context.params;
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return reply({ error: "Job not found." }, 404);
    if (body?.action === "approve") return reply({ job: await approveCodingJob(id, body.digest) });
    if (body?.action === "cancel") return reply({ job: await cancelCodingJob(id) });
    return reply({ error: "Choose approve or cancel." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return reply({ error: /^(The proposal |The repository |This job |This approval |Only a proposal|The job changed|Job not found|Passing checks)/.test(message)
      ? message : "The action could not finish. Refresh the saved job before trying again." }, 409);
  }
}
