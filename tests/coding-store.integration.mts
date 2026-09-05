import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { createJob, getJob, claimApproval } from "../app/lib/coding-store";
import { RUN_OWNER } from "../app/lib/runtime-access";
import type { CodingJob } from "../app/lib/coding-types";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for this explicit integration check.");
const sql = neon(process.env.DATABASE_URL);
const id = randomUUID();
const otherId = randomUUID();
const now = new Date().toISOString();
const job: CodingJob = {
  id, objective: "Isolated storage verification fixture", paths: ["README.md"], state: "review", createdAt: now, updatedAt: now,
  proposal: { repository: "fixture", baseSha: "a".repeat(40), baseTree: "b".repeat(40), summary: "Fixture", files: [], digest: "storage-fixture", models: { architect: "fixture", operator: "fixture" } },
};
try {
  await createJob(job);
  assert.equal((await getJob(id))?.state, "review");
  assert.equal(await claimApproval(id, "wrong-digest"), null);
  const attempts = await Promise.all([claimApproval(id, "storage-fixture"), claimApproval(id, "storage-fixture")]);
  assert.equal(attempts.filter(Boolean).length, 1, "Exactly one concurrent approval must win");
  assert.equal((await getJob(id))?.approvedDigest, "storage-fixture");
  await sql`INSERT INTO sabitx_coding_jobs (id, owner_id, state, document) VALUES (${otherId}, 'verification-other-owner', 'review', ${JSON.stringify({ ...job, id: otherId })}::jsonb)`;
  assert.equal(await getJob(otherId), null, "Another owner's job must be invisible");
  assert.equal(await claimApproval(otherId, "storage-fixture"), null);
  console.log("Storage verified: persisted readback, digest match, concurrent approval lock and owner isolation.");
} finally {
  await sql`DELETE FROM sabitx_coding_jobs WHERE (id=${id}::uuid AND owner_id=${RUN_OWNER}) OR (id=${otherId}::uuid AND owner_id='verification-other-owner')`;
}
