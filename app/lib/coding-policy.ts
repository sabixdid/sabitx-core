import { createHash } from "node:crypto";
import type { CodeFile, CodeProposal } from "./coding-types";

export const CODING_REPOSITORY = "sabixdid/sabitx-core";
export const MAX_FILE_BYTES = 50_000;
export const MAX_CHANGE_BYTES = 100_000;

export function isEditablePath(path: string): boolean {
  if (path.length > 180 || !/^[A-Za-z0-9_/-]+\.(tsx?|css|md)$/.test(path)) return false;
  if (path.split("/").some((part) => !part || part === "." || part === "..")) return false;
  // This first adapter changes UI and documentation. Credentials, policy, API,
  // dependencies, CI and infrastructure are outside its authority.
  return path === "README.md" || path.startsWith("docs/") ||
    (path.startsWith("app/") && !path.startsWith("app/api/") &&
      !path.startsWith("app/lib/") && !path.includes("CodingJobs"));
}

export function validatePaths(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 4 ||
      value.some((path) => typeof path !== "string" || !isEditablePath(path))) {
    throw new Error("Choose one to four UI or documentation files. API, access, dependency and infrastructure files are protected.");
  }
  const paths = value as string[];
  if (new Set(paths).size !== paths.length) throw new Error("Each file may be selected only once.");
  return paths;
}

export function validateGeneratedFiles(value: unknown, sources: Map<string, string>): Pick<CodeFile, "path" | "before" | "content">[] {
  if (!Array.isArray(value) || !value.length || value.length > sources.size) throw new Error("The operator returned an invalid file list.");
  const seen = new Set<string>();
  let total = 0;
  const files = value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("The operator returned an invalid file.");
    const file = item as Record<string, unknown>;
    if (typeof file.path !== "string" || !sources.has(file.path) || !isEditablePath(file.path) ||
        seen.has(file.path) || typeof file.content !== "string" || file.content.includes("\0")) {
      throw new Error("The operator attempted a change outside the selected files.");
    }
    seen.add(file.path);
    const size = Buffer.byteLength(file.content);
    total += size;
    if (size > MAX_FILE_BYTES || total > MAX_CHANGE_BYTES) throw new Error("The proposed change exceeds the size limit.");
    return { path: file.path, content: file.content, before: sources.get(file.path)! };
  }).filter((file) => file.before !== file.content);
  if (!files.length) throw new Error("The operator did not propose a change.");
  return files;
}

export function proposalDigest(proposal: Pick<CodeProposal, "repository" | "baseSha" | "baseTree" | "files">): string {
  return createHash("sha256").update(JSON.stringify({
    repository: proposal.repository,
    baseSha: proposal.baseSha,
    baseTree: proposal.baseTree,
    files: [...proposal.files].sort((a, b) => a.path.localeCompare(b.path))
      .map(({ path, before, content }) => ({ path, before, content })),
  })).digest("hex");
}

export function assertApproval(proposal: CodeProposal, approvedDigest: unknown): void {
  if (proposal.repository !== CODING_REPOSITORY || !/^[a-f0-9]{40}$/.test(proposal.baseSha) || !/^[a-f0-9]{40}$/.test(proposal.baseTree) ||
      approvedDigest !== proposal.digest || proposalDigest(proposal) !== proposal.digest) {
    throw new Error("The proposal changed. Review the current changes before approving.");
  }
  validatePaths(proposal.files.map((file) => file.path));
}
