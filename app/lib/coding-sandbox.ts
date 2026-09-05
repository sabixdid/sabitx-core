import { Sandbox } from "@vercel/sandbox";
import type { CodeProposal, CheckResult } from "./coding-types";
import { CODING_REPOSITORY } from "./coding-policy";

export async function checkProposal(proposal: CodeProposal): Promise<{ sandboxName: string; checks: CheckResult[] }> {
  const sandbox = await Sandbox.create({
    source: { type: "git", url: `https://github.com/${CODING_REPOSITORY}.git`, revision: proposal.baseSha, depth: 1 },
    runtime: "node24",
    timeout: 240_000,
    resources: { vcpus: 2 },
    networkPolicy: { allow: ["github.com", "registry.npmjs.org"] },
    env: { NEXT_TELEMETRY_DISABLED: "1", CI: "1" },
  });
  const checks: CheckResult[] = [];
  async function run(name: string, command: string, args: string[], timeoutMs: number) {
    const start = Date.now();
    const result = await sandbox.runCommand(command, args, { timeoutMs });
    const output = ((await result.stdout()) + (await result.stderr())).slice(-12_000);
    const check = { name, exitCode: result.exitCode, output, durationMs: Date.now() - start };
    checks.push(check);
    return check.exitCode === 0;
  }
  try {
    // Install the locked, existing dependencies before applying untrusted code.
    if (!await run("Install locked dependencies", "npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], 100_000)) {
      return { sandboxName: sandbox.name, checks };
    }
    await sandbox.writeFiles(proposal.files.map((file) => ({ path: file.path, content: file.content })));
    // Next's existing font loader needs these hosts. No credentials or project
    // environment variables are provided to generated code.
    await sandbox.updateNetworkPolicy({ allow: ["fonts.googleapis.com", "fonts.gstatic.com"] });
    await run("Production build and typecheck", "npm", ["run", "build"], 120_000);
    return { sandboxName: sandbox.name, checks };
  } finally {
    await sandbox.stop();
  }
}
