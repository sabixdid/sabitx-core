import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { isEditablePath, validatePaths, validateGeneratedFiles, proposalDigest, assertApproval, CODING_REPOSITORY } from "../app/lib/coding-policy";
import { hasRunAccess, sameOrigin } from "../app/lib/runtime-access";
import type { CodeProposal } from "../app/lib/coding-types";

test("code scope rejects traversal, secrets, workflow and access-control changes", () => {
  for (const path of ["../README.md", "app/../lib/auth.ts", "/app/page.tsx", "app//page.tsx", "app/api/agent/route.ts", "app/lib/runtime-access.ts", ".env.local", ".github/workflows/test.yml", "package.json", "app/run/CodingJobs.tsx", "app\\page.tsx", "app/page.tsx\0.md", "app/%2e%2e/page.tsx"]) {
    assert.equal(isEditablePath(path), false, path);
  }
  assert.equal(isEditablePath("app/page.tsx"), true);
  assert.equal(isEditablePath("docs/runtime-guide.md"), true);
  assert.throws(() => validatePaths(["README.md", "README.md"]));
  assert.throws(() => validatePaths([]));
});

test("model output cannot extend file scope, duplicate edits or exceed limits", () => {
  const source = new Map([["README.md", "before"]]);
  assert.throws(() => validateGeneratedFiles([{ path: "app/page.tsx", content: "hello" }], source));
  assert.throws(() => validateGeneratedFiles([{ path: "README.md", content: "before" }], source));
  assert.throws(() => validateGeneratedFiles([{ path: "README.md", content: "\0" }], source));
  assert.throws(() => validateGeneratedFiles([{ path: "README.md", content: "x".repeat(50_001) }], source));
  assert.throws(() => validateGeneratedFiles([{ path: "README.md", content: "one" },{ path: "README.md", content: "two" }], source));
  assert.deepEqual(validateGeneratedFiles([{ path: "README.md", content: "after" }], source), [{ path: "README.md", content: "after", before: "before" }]);
});

test("approval binds repository, base revision and exact before/after bytes", () => {
  const proposal: CodeProposal = { repository: CODING_REPOSITORY, baseSha: "a".repeat(40), baseTree: "b".repeat(40), summary: "Test", files: [{ path: "README.md", before: "old", content: "new", diff: "" }], digest: "", models: { architect: "test", operator: "test" } };
  proposal.digest = proposalDigest(proposal);
  assert.doesNotThrow(() => assertApproval(proposal, proposal.digest));
  assert.throws(() => assertApproval(proposal, "unrelated approval"));
  assert.throws(() => assertApproval({ ...proposal, baseSha: "c".repeat(40) }, proposal.digest));
  assert.throws(() => assertApproval({ ...proposal, baseTree: "c".repeat(40) }, proposal.digest));
  assert.throws(() => assertApproval({ ...proposal, repository: "other/repo" }, proposal.digest));
  assert.throws(() => assertApproval({ ...proposal, files: [{ ...proposal.files[0], content: "changed after review" }] }, proposal.digest));
  assert.throws(() => assertApproval({ ...proposal, files: [{ ...proposal.files[0], before: "different source" }] }, proposal.digest));
});

test("access fails closed without configuration and rejects cross-origin writes", () => {
  const previous = process.env.SABITX_RUN_KEY_SHA256;
  try {
    const request = new Request("https://sabitx.com/api/coding/jobs", { headers: { "x-sabitx-key": "local-test-key" } });
    delete process.env.SABITX_RUN_KEY_SHA256;
    assert.equal(hasRunAccess(request), false);
    process.env.SABITX_RUN_KEY_SHA256 = "invalid";
    assert.equal(hasRunAccess(request), false);
    process.env.SABITX_RUN_KEY_SHA256 = createHash("sha256").update("local-test-key").digest("hex");
    assert.equal(hasRunAccess(request), true);
    assert.equal(hasRunAccess(new Request(request.url, { headers: { "x-sabitx-key": "wrong" } })), false);
    assert.equal(sameOrigin(new Request(request.url, { headers: { Origin: "https://untrusted.example" } })), false);
    assert.equal(sameOrigin(new Request(request.url, { headers: { Origin: "https://sabitx.com" } })), true);
  } finally { if (previous === undefined) delete process.env.SABITX_RUN_KEY_SHA256; else process.env.SABITX_RUN_KEY_SHA256 = previous; }
});
