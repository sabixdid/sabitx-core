"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../run/runtime.module.css";

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

export default function RunsClient() {
  const [runs, setRuns] = useState<StoredRun[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || "[]"
      ) as StoredRun[];
      setRuns(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRuns([]);
    }
  }, []);

  function clearRuns() {
    window.localStorage.removeItem(STORAGE_KEY);
    setRuns([]);
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
        <div className={styles.kicker}>LOCAL RUN REGISTER</div>
        <h1>
          VERIFIED STATE.
          <span>NO CLOUD ARCHIVE YET.</span>
        </h1>
        <p>
          This register stays in the current browser. Server-side persistence and
          Vault grants remain separate by design.
        </p>
      </section>

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
