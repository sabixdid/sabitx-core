"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import styles from "./runtime.module.css";
import CodingJobs from "./CodingJobs";

type ExecutionSpec = {
  objective: string;
  requirements: string[];
  constraints: string[];
  acceptanceCriteria: string[];
  implementationInstructions: string[];
};

type AgentRun = {
  id: string;
  state: "planned";
  createdAt: string;
  objective: string;
  specification: ExecutionSpec;
  operatorPlan: string;
  models: { architect: string; operator: string };
  verification: {
    architectSchema: "passed";
    operatorOutput: "received";
    externalActionsExecuted: false;
  };
  timingMs: { architect: number; operator: number; total: number };
};

type StatusPayload = {
  runtime?: string;
  signal?: string;
  version?: string;
  agent?: { state?: string; pipeline?: string };
};

const STORAGE_KEY = "sabitx_runs_v1";
const MAX_STORED_RUNS = 20;

function saveRun(run: AgentRun) {
  try {
    const existing = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]"
    ) as AgentRun[];
    const next = [run, ...existing.filter((item) => item.id !== run.id)].slice(
      0,
      MAX_STORED_RUNS
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The run still renders even when browser storage is unavailable.
  }
}

function SignalList({ items }: { items: string[] }) {
  return (
    <ul className={styles.signalList}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`}>{item}</li>
      ))}
    </ul>
  );
}

export default function RunConsole({
  surface = "RUN",
}: {
  surface?: "RUN" | "ASK" | "OPERATOR";
}) {
  const [accessKey, setAccessKey] = useState("");
  const [mode, setMode] = useState<"coding" | "planning">("coding");
  const [objective, setObjective] = useState("");
  const [run, setRun] = useState<AgentRun | null>(null);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [phase, setPhase] = useState<
    "idle" | "architect" | "operator" | "verified"
  >("idle");
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setAccessKey(window.sessionStorage.getItem("sabitx_clearance") || "");

    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: StatusPayload) => setStatus(payload))
      .catch(() =>
        setStatus({ runtime: "unknown", signal: "unavailable" })
      );
  }, []);

  const locked = useMemo(() => !accessKey.trim(), [accessKey]);
  const running = phase === "architect" || phase === "operator";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setRun(null);
    setRemaining(null);

    const key = accessKey.trim();
    const cleanObjective = objective.trim();

    if (!key) {
      setError("Clearance key required.");
      return;
    }

    if (!cleanObjective) {
      setError("Send the objective.");
      return;
    }

    window.sessionStorage.setItem("sabitx_clearance", key);
    setPhase("architect");

    const operatorTimer = window.setTimeout(() => setPhase("operator"), 1_800);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sabitx-key": key,
        },
        body: JSON.stringify({ objective: cleanObjective }),
      });

      const payload = (await response.json()) as {
        run?: AgentRun;
        error?: string;
        detail?: string;
        rateLimitRemaining?: number;
      };

      if (!response.ok || !payload.run) {
        if (response.status === 401) {
          window.sessionStorage.removeItem("sabitx_clearance");
          setAccessKey("");
        }
        throw new Error(
          [payload.error, payload.detail].filter(Boolean).join(" ") ||
            `Run failed with ${response.status}.`
        );
      }

      saveRun(payload.run);
      setRun(payload.run);
      setRemaining(payload.rateLimitRemaining ?? null);
      setPhase("verified");
    } catch (caught) {
      setPhase("idle");
      setError(
        caught instanceof Error ? caught.message : "Runtime did not answer."
      );
    } finally {
      window.clearTimeout(operatorTimer);
    }
  }

  return (
    <main className={styles.runtime}>
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.rail}>
        <Link href="/" className={styles.wordmark}>
          SABITX
        </Link>
        <nav aria-label="Runtime navigation">
          <Link href="/run" aria-current={surface === "RUN" ? "page" : undefined}>
            RUN
          </Link>
          <Link href="/runs">RUNS</Link>
          <Link href="/vault">VAULT</Link>
          <a href="https://sabitinc.com">PUBLIC OPERATIONS</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.kicker}>
          {surface} / EXECUTION SURFACE / {status?.version || "RUN"}
        </div>
        <h1>
          SEND THE SIGNAL.
          <span>{mode === "coding" ? "REVIEW. APPROVE. VERIFY." : "RETURN WITH A PLAN."}</span>
        </h1>
        <p>
          {mode === "coding" ? "Turn a small coding objective into tested changes. Review the result before approving a new branch." : "Architect intent → validate the specification → operator sequence → planned state."}
        </p>

        <div className={styles.statusRow} aria-label="System status">
          <span>
            RUNTIME // {(status?.runtime || "checking").toUpperCase()}
          </span>
          <span>SIGNAL // {(status?.signal || "checking").toUpperCase()}</span>
          <span>
            AGENT // {(status?.agent?.state || "checking").toUpperCase()}
          </span>
        </div>
      </section>

      <div className={styles.modeControls} aria-label="Run mode">
        <button type="button" aria-pressed={mode === "coding"} onClick={() => setMode("coding")}>Coding job</button>
        <button type="button" aria-pressed={mode === "planning"} onClick={() => { setMode("planning"); try { setAccessKey(window.sessionStorage.getItem("sabitx_clearance") || ""); } catch { /* Optional storage. */ } }}>Planning only</button>
      </div>
      {mode === "coding" ? <CodingJobs /> : <>
      <section className={styles.commandGrid}>
        <form className={styles.console} onSubmit={submit}>
          <div className={styles.consoleHeader}>
            <span>COMMAND INPUT</span>
            <span>{locked ? "CLEARANCE REQUIRED" : "CLEARANCE HELD"}</span>
          </div>

          <label htmlFor="clearance">Clearance key</label>
          <input
            id="clearance"
            type="password"
            autoComplete="off"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            placeholder="Enter runtime key"
            disabled={running}
          />

          <label htmlFor="objective">Objective</label>
          <textarea
            id="objective"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            placeholder="Example: Audit the SABITX domain architecture and return the smallest verified sequence to attach sabitx.run without breaking sabitx.com."
            maxLength={4_000}
            disabled={running}
          />

          <div className={styles.formFooter}>
            <span>{objective.length.toLocaleString()} / 4,000</span>
            <button type="submit" disabled={running}>
              {running ? "RUNNING SIGNAL…" : "RUN ARCHITECT → OPERATOR"}
            </button>
          </div>

          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}
        </form>

        <aside className={styles.sequence} aria-label="Execution sequence">
          <div className={phase !== "idle" ? styles.activeStep : ""}>
            <span>01</span>
            <strong>SIGNAL</strong>
            <small>Objective accepted</small>
          </div>
          <div
            className={
              phase === "architect" || phase === "operator" || phase === "verified"
                ? styles.activeStep
                : ""
            }
          >
            <span>02</span>
            <strong>ARCHITECT</strong>
            <small>Structured specification</small>
          </div>
          <div
            className={
              phase === "operator" || phase === "verified"
                ? styles.activeStep
                : ""
            }
          >
            <span>03</span>
            <strong>OPERATOR</strong>
            <small>Executable sequence</small>
          </div>
          <div className={phase === "verified" ? styles.activeStep : ""}>
            <span>04</span>
            <strong>VERIFY</strong>
            <small>Schema and output state</small>
          </div>
        </aside>
      </section>

      {run ? (
        <section className={styles.result} aria-live="polite">
          <div className={styles.resultHeader}>
            <div>
              <span>RUN / {run.id.slice(0, 8).toUpperCase()}</span>
              <h2>STATE UPDATED // PLANNED</h2>
            </div>
            <div>
              <span>{run.timingMs.total.toLocaleString()} MS</span>
              {remaining !== null ? <span>{remaining} RUNS REMAIN</span> : null}
            </div>
          </div>

          <div className={styles.resultGrid}>
            <article>
              <span className={styles.index}>ARCHITECT SPEC</span>
              <h3>{run.specification.objective}</h3>

              <h4>Requirements</h4>
              <SignalList items={run.specification.requirements} />

              <h4>Constraints</h4>
              <SignalList items={run.specification.constraints} />

              <h4>Acceptance criteria</h4>
              <SignalList items={run.specification.acceptanceCriteria} />

              <h4>Implementation instructions</h4>
              <SignalList items={run.specification.implementationInstructions} />
            </article>

            <article>
              <span className={styles.index}>OPERATOR PLAN</span>
              <pre>{run.operatorPlan}</pre>
            </article>
          </div>

          <footer className={styles.verification}>
            <span>SCHEMA // PASSED</span>
            <span>OPERATOR OUTPUT // RECEIVED</span>
            <span>EXTERNAL ACTIONS // NOT EXECUTED</span>
            <span>
              MODELS // {run.models.architect} + {run.models.operator}
            </span>
          </footer>
        </section>
      ) : null}
      </>}
    </main>
  );
}
