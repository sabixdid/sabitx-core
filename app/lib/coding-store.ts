import { neon } from "@neondatabase/serverless";
import type { CodingJob } from "./coding-types";
import { RUN_OWNER } from "./runtime-access";

function database() {
  if (!process.env.DATABASE_URL) throw new Error("Private job storage is not configured.");
  return neon(process.env.DATABASE_URL);
}

export async function consumeCodingLimit(): Promise<boolean> {
  const sql = database();
  const rows = await sql`
    INSERT INTO sabitx_coding_limits (owner_id, window_start, count) VALUES (${RUN_OWNER}, now(), 1)
    ON CONFLICT (owner_id) DO UPDATE SET
      count = CASE WHEN sabitx_coding_limits.window_start < now() - interval '10 minutes' THEN 1 ELSE sabitx_coding_limits.count + 1 END,
      window_start = CASE WHEN sabitx_coding_limits.window_start < now() - interval '10 minutes' THEN now() ELSE sabitx_coding_limits.window_start END
    WHERE sabitx_coding_limits.count < 5 OR sabitx_coding_limits.window_start < now() - interval '10 minutes'
    RETURNING count`;
  return rows.length > 0;
}

export async function createJob(job: CodingJob): Promise<void> {
  const sql = database();
  await sql`INSERT INTO sabitx_coding_jobs (id, owner_id, state, document) VALUES (${job.id}, ${RUN_OWNER}, ${job.state}, ${JSON.stringify(job)}::jsonb)`;
}

export async function getJob(id: string): Promise<CodingJob | null> {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return null;
  const sql = database();
  const rows = await sql`SELECT document FROM sabitx_coding_jobs WHERE id=${id}::uuid AND owner_id=${RUN_OWNER}`;
  return rows[0]?.document as CodingJob || null;
}

export async function listJobs(): Promise<CodingJob[]> {
  const sql = database();
  const rows = await sql`SELECT document FROM sabitx_coding_jobs WHERE owner_id=${RUN_OWNER} ORDER BY created_at DESC LIMIT 20`;
  return rows.map((row) => row.document as CodingJob);
}

export async function saveJob(job: CodingJob, previousState: CodingJob["state"]): Promise<boolean> {
  const sql = database();
  job.updatedAt = new Date().toISOString();
  const rows = await sql`UPDATE sabitx_coding_jobs SET state=${job.state}, document=${JSON.stringify(job)}::jsonb, updated_at=now()
    WHERE id=${job.id}::uuid AND owner_id=${RUN_OWNER} AND state=${previousState} RETURNING id`;
  return rows.length === 1;
}

// Atomic compare-and-set prevents double-clicks and concurrent requests from
// executing the same approval twice. Only the server-saved proposal is used.
export async function claimApproval(id: string, digest: string): Promise<CodingJob | null> {
  const sql = database();
  const approvedAt = new Date().toISOString();
  const rows = await sql`UPDATE sabitx_coding_jobs SET state='executing', updated_at=now(),
    document=document || jsonb_build_object('state','executing','approvedAt',${approvedAt}::text,'approvedDigest',${digest}::text,'updatedAt',${approvedAt}::text)
    WHERE id=${id}::uuid AND owner_id=${RUN_OWNER} AND state='review' AND document->'proposal'->>'digest'=${digest}
    RETURNING document`;
  return rows[0]?.document as CodingJob || null;
}
