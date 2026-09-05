"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import styles from "../run/runtime.module.css";
import CodingJobs from "../run/CodingJobs";

type StoredRun = {
  id: string;
  state: string;
  createdAt: string;
  objective: string;
  operatorPlan: string;
  models?: { architect?: string; operator?: string };
  timingMs?: { total?: number };
};

const STORAGE_KEY = "sabitx_runs_v1";

function subscribeToRuns(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("sabitx-runs-changed", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("sabitx-runs-changed", onChange);
  };
}
function storedRuns() {
  try { return window.localStorage.getItem(STORAGE_KEY) || "[]"; }
  catch { return "[]"; }
}

export default function RunsClient() {
  const raw = useSyncExternalStore(subscribeToRuns, storedRuns, () => "[]");
  const runs = useMemo<StoredRun[]>(() => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((run): run is StoredRun =>
        !!run && typeof run.id === "string" && typeof run.state === "string" &&
        typeof run.objective === "string" && typeof run.createdAt === "string" &&
        typeof run.operatorPlan === "string") : [];
    } catch { return []; }
  }, [raw]);

  function clearRuns() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("sabitx-runs-changed"));
  }

  return (
    <main className={styles.runtime}>
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.rail}>
        <Link href="/" className={styles.wordmark}>
          SABITX
        </Link>
        <nav aria-label="Runtime navigation">
          <Link href="/run">RUN</Link>
          <Link href="/runs" aria-current="page">
            RUNS
          </Link>
          <Link href="/vault">VAULT</Link>
          <a href="https://sabitinc.com">PUBLIC OPERATIONS</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.kicker}>RUN REGISTER</div>
        <h1>
          WORK. RECORDED.
          <span>RESULTS YOU CAN INSPECT.</span>
        </h1>
        <p>
          Coding jobs, approvals and verification results are saved privately.
          Earlier planning runs remain in this browser below.
        </p>
      </section>

      <CodingJobs historyOnly />

      <section className={styles.result}>
        <div className={styles.resultHeader}>
          <div>
            <span>RUN REGISTER</span>
            <h2>{runs.length} LOCAL RUN{runs.length === 1 ? "" : "S"}</h2>
          </div>
          <div className={styles.registerActions}>
            <Link href="/run">NEW RUN →</Link>
            {runs.length ? (
              <button type="button" onClick={clearRuns}>
                CLEAR LOCAL REGISTER
              </button>
            ) : null}
          </div>
        </div>

        {runs.length ? (
          <div className={styles.runList}>
            {runs.map((run) => (
              <article key={run.id} className={styles.runCard}>
                <div>
                  <span className={styles.index}>
                    {new Date(run.createdAt).toLocaleString()}
                  </span>
                  <h3>{run.objective}</h3>
                  <div className={styles.runMeta}>
                    <span>STATE // {run.state.toUpperCase()}</span>
                    <span>
                      RUNTIME // {run.timingMs?.total?.toLocaleString() || "—"} MS
                    </span>
                    <span>RUN // {run.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                <pre>{run.operatorPlan}</pre>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            No runs are stored in this browser. <Link href="/run">Acquire signal.</Link>
          </div>
        )}
      </section>
    </main>
  );
}
