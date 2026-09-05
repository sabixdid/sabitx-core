import { getToken } from "@vercel/connect";
import { CODING_REPOSITORY, MAX_CHANGE_BYTES, MAX_FILE_BYTES } from "./coding-policy";
import type { CodeProposal } from "./coding-types";

type GitTree = { sha: string; truncated?: boolean; tree: { path: string; mode: string; type: string; sha: string; size?: number }[] };

async function githubToken(write: boolean) {
  return getToken(process.env.SABITX_GITHUB_CONNECTOR || "github/sabitx-run", {
    subject: { type: "app" },
    authorizationDetails: [{
      type: "github_app_installation",
      repositories: [CODING_REPOSITORY],
      permissions: [write ? "contents:write" : "contents:read"],
    }],
  });
}

async function github<T>(path: string, body?: unknown): Promise<T> {
  const token = await githubToken(body !== undefined);
  const response = await fetch(`https://api.github.com/repos/${CODING_REPOSITORY}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
    cache: "no-store",
  });
  if (!response.ok) {
    // Provider response bodies can contain private context. Do not surface them.
    throw new Error(`Repository request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export async function readRepository(paths: string[]) {
  const repo = await github<{ default_branch: string; private: boolean }>("");
  // Sandbox checkout is credential-free. Private repository support is a
  // separate capability, not an invitation to inject a provider token into a VM.
  if (repo.private) throw new Error("This executor currently supports the configured public repository only.");
  const head = await github<{ sha: string; commit: { tree: { sha: string } } }>(`/commits/${encodeURIComponent(repo.default_branch)}`);
  const tree = await github<GitTree>(`/git/trees/${head.commit.tree.sha}?recursive=1`);
  if (tree.truncated) throw new Error("Repository listing exceeds this executor's limits.");
  const sources = new Map<string, string>();
  let total = 0;
  for (const path of paths) {
    const segments = path.split("/");
    for (let end = 1; end < segments.length; end++) {
      const parent = tree.tree.find((item) => item.path === segments.slice(0, end).join("/"));
      if (parent && parent.type !== "tree") throw new Error("Selected files cannot traverse links or non-directory entries.");
    }
    const entry = tree.tree.find((item) => item.path === path);
    if (!entry) { sources.set(path, ""); continue; }
    if (entry.type !== "blob" || entry.mode !== "100644" || (entry.size || 0) > MAX_FILE_BYTES) {
      throw new Error("Selected files must be regular text files under 50 KB.");
    }
    const blob = await github<{ content: string; encoding: string }>(`/git/blobs/${entry.sha}`);
    if (blob.encoding !== "base64") throw new Error("Unsupported repository content encoding.");
    const content = Buffer.from(blob.content, "base64").toString("utf8");
    total += Buffer.byteLength(content);
    if (content.includes("\0") || total > MAX_CHANGE_BYTES) throw new Error("Selected source exceeds the text size limit.");
    sources.set(path, content);
  }
  return { baseSha: head.sha, baseTree: tree.sha, sources };
}

export async function repositoryHead(): Promise<string> {
  const repo = await github<{ default_branch: string }>("");
  return (await github<{ sha: string }>(`/commits/${encodeURIComponent(repo.default_branch)}`)).sha;
}

export async function createResultCommit(proposal: CodeProposal, jobId: string): Promise<string> {
  const base = await github<{ tree: { sha: string } }>(`/git/commits/${proposal.baseSha}`);
  if (base.tree.sha !== proposal.baseTree) throw new Error("The pinned source tree changed.");
  const tree = await github<{ sha: string }>("/git/trees", {
    base_tree: proposal.baseTree,
    tree: proposal.files.map((file) => ({ path: file.path, mode: "100644", type: "blob", content: file.content })),
  });
  const commit = await github<{ sha: string }>("/git/commits", {
    message: `SABITX RUN: ${proposal.summary.slice(0,100)}\n\nJob: ${jobId}\nApproved proposal: ${proposal.digest}`,
    tree: tree.sha,
    parents: [proposal.baseSha],
  });
  return commit.sha;
}

export async function createResultBranch(branch: string, commit: string): Promise<void> {
  // Never update an existing reference and never push to the default branch.
  if (!/^sabitx\/job-[a-f0-9-]{36}$/.test(branch)) throw new Error("Invalid result branch.");
  await github("/git/refs", { ref: `refs/heads/${branch}`, sha: commit });
}

export async function verifyResult(branch: string, commit: string, proposal: CodeProposal): Promise<void> {
  const reference = await github<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
  if (reference.object.sha !== commit) throw new Error("Result branch does not match the saved commit.");
  const actual = await github<{ tree: { sha: string } }>(`/git/commits/${commit}`);
  const tree = await github<GitTree>(`/git/trees/${actual.tree.sha}?recursive=1`);
  if (tree.truncated) throw new Error("Result listing could not be fully verified.");
  for (const file of proposal.files) {
    const entry = tree.tree.find((item) => item.path === file.path);
    if (!entry || entry.type !== "blob") throw new Error("A result file is missing.");
    const blob = await github<{ content: string }>(`/git/blobs/${entry.sha}`);
    if (Buffer.from(blob.content, "base64").toString("utf8") !== file.content) throw new Error("A result file differs from the approved content.");
  }
}
