export type CodeFile = { path: string; before: string; content: string; diff: string };
export type CheckResult = { name: string; exitCode: number; output: string; durationMs: number };
export type CodeProposal = {
  repository: string;
  baseSha: string;
  baseTree: string;
  summary: string;
  files: CodeFile[];
  digest: string;
  models: { architect: string; operator: string };
};
export type CodingJob = {
  id: string;
  objective: string;
  paths: string[];
  state: "preparing" | "review" | "executing" | "succeeded" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  proposal?: CodeProposal;
  checks?: CheckResult[];
  sandboxName?: string;
  approvedAt?: string;
  approvedDigest?: string;
  result?: { branch: string; commit: string; url: string; contentsVerified: boolean };
  error?: string;
};
