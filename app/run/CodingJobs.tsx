"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CodingJob } from "../lib/coding-types";
import styles from "./runtime.module.css";

const labels: Record<CodingJob["state"], string> = {
  preparing: "Preparing and testing", review: "Ready for your review", executing: "Creating result branch",
  succeeded: "Verified branch created", failed: "Needs attention", cancelled: "Cancelled",
};

export default function CodingJobs({ historyOnly = false }: { historyOnly?: boolean }) {
  const [key, setKey] = useState("");
  const [objective, setObjective] = useState("");
  const [paths, setPaths] = useState("README.md");
  const [jobs, setJobs] = useState<CodingJob[]>([]);
  const [selected, setSelected] = useState<CodingJob | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setKey(window.sessionStorage.getItem("sabitx_clearance") || ""); } catch { /* Session storage is optional. */ }
  }, []);

  async function request(path: string, body?: unknown) {
    if (!key.trim()) throw new Error("Enter your clearance key.");
    try { window.sessionStorage.setItem("sabitx_clearance", key.trim()); } catch { /* Use the current session in memory. */ }
    const response = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: { "x-sabitx-key": key.trim(), "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store",
    });
    const data = await response.json() as { error?: string; job?: CodingJob; jobs?: CodingJob[] };
    if (!response.ok) {
      if (response.status === 401) {
        setKey("");
        try { window.sessionStorage.removeItem("sabitx_clearance"); } catch { /* Optional storage. */ }
      }
      throw new Error(data.error || "The request could not finish. Refresh saved jobs before trying again.");
    }
    return data;
  }

  function remember(job: CodingJob) {
    setSelected(job);
    setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)].slice(0, 20));
    setLoaded(true);
  }

  async function refresh() {
    setBusy("Loading saved jobs…"); setError("");
    try {
      const data = await request("/api/coding/jobs");
      setJobs(data.jobs || []); setLoaded(true);
      setSelected((current) => current ? (data.jobs || []).find((item) => item.id === current.id) || current : null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Saved jobs are unavailable."); }
    finally { setBusy(""); }
  }

  async function prepare(event: FormEvent) {
    event.preventDefault(); setError(""); setSelected(null);
    setBusy("Preparing changes and running an isolated build. This can take a few minutes…");
    try {
      const data = await request("/api/coding/jobs", { objective, paths: paths.split(/[\n,]/).map((value) => value.trim()).filter(Boolean) });
      if (data.job) remember(data.job);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Preparation stopped. Check saved jobs before trying again."); }
    finally { setBusy(""); }
  }

  async function decide(action: "approve" | "cancel") {
    if (!selected) return;
    setBusy(action === "approve" ? "Creating and verifying the approved branch…" : "Cancelling proposal…"); setError("");
    try {
      const data = await request(`/api/coding/jobs/${selected.id}`, { action, digest: selected.proposal?.digest });
      if (data.job) remember(data.job);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Refresh the saved job to check its state."); }
    finally { setBusy(""); }
  }

  return <section className={styles.coding} aria-label={historyOnly ? "Saved coding jobs" : "Approved coding jobs"}>
    <form className={styles.console} onSubmit={historyOnly ? (event) => { event.preventDefault(); void refresh(); } : prepare}>
      <h2>{historyOnly ? "Saved coding jobs" : "Make a coding change"}</h2>
      <p>Propose a small UI or documentation change in SABITX Core. Review the exact changes and build results, then approve a separate result branch.</p>
      <label htmlFor="coding-clearance">Clearance key</label>
      <input id="coding-clearance" type="password" autoComplete="off" value={key} onChange={(event) => setKey(event.target.value)} disabled={!!busy} required />
      {!historyOnly && <>
        <label htmlFor="coding-objective">What should change?</label>
        <textarea id="coding-objective" value={objective} onChange={(event) => setObjective(event.target.value)} maxLength={4000} required disabled={!!busy}
          placeholder="Add a short getting-started section explaining how to use the RUN console." />
        <label htmlFor="coding-paths">Files to work on</label>
        <input id="coding-paths" value={paths} onChange={(event) => setPaths(event.target.value)} required disabled={!!busy} aria-describedby="coding-path-help" />
        <p id="coding-path-help">Up to four UI or documentation paths, separated by commas. New documentation files are allowed. Access controls, API routes and project configuration are protected.</p>
      </>}
      <div className={styles.codingActions}>
        {!historyOnly && <button type="submit" disabled={!!busy}>Prepare and test changes</button>}
        <button type={historyOnly ? "submit" : "button"} onClick={historyOnly ? undefined : () => void refresh()} disabled={!!busy}>Load saved jobs</button>
      </div>
      {busy && <p role="status">{busy}</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </form>

    {selected && <article className={`${styles.console} ${styles.codingReview}`} aria-live="polite">
      <div className={styles.resultHeader}><div><span>{labels[selected.state]}</span><h2>{selected.proposal?.summary || selected.objective}</h2></div></div>
      <p>{selected.objective}</p>
      {selected.error && <p role="alert" className={styles.error}>{selected.error}</p>}
      {(selected.state === "preparing" || selected.state === "executing") && <p>Refresh saved jobs to check progress. If this state persists after an interrupted request, inspect any saved result before starting another job.</p>}
      {selected.proposal?.files.map((file) => <details key={file.path} open><summary>{file.path}</summary><pre className={styles.codeDiff}>{file.diff}</pre></details>)}
      {selected.checks?.map((check) => <details key={check.name}><summary>{check.exitCode === 0 ? "Passed" : "Failed"}: {check.name}</summary><pre className={styles.codeDiff}>{check.output}</pre></details>)}
      {selected.state === "review" && <>
        <p>Approval creates a new branch containing exactly these tested changes. Merging or publishing that branch is a separate action.</p>
        <div className={styles.codingActions}>
          <button type="button" onClick={() => void decide("approve")} disabled={!!busy}>Approve changes and create branch</button>
          <button type="button" onClick={() => void decide("cancel")} disabled={!!busy}>Cancel proposal</button>
        </div>
      </>}
      {selected.result && <p><a href={selected.result.url} target="_blank" rel="noreferrer">{selected.result.contentsVerified ? "Open verified changes on GitHub" : "Inspect the saved result on GitHub"} →</a></p>}
      <p className={styles.codingMeta}>Saved {new Date(selected.createdAt).toLocaleString()}. {selected.approvedAt && `Approved ${new Date(selected.approvedAt).toLocaleString()}.`}</p>
    </article>}

    {loaded && <div className={styles.console}>
      <h2>Recent jobs</h2>
      {jobs.length ? <ul className={styles.codingJobList}>{jobs.map((job) => <li key={job.id}><button type="button" onClick={() => setSelected(job)} disabled={!!busy}>
        <strong>{job.objective}</strong><span>{labels[job.state]} · {new Date(job.createdAt).toLocaleString()}</span>
      </button></li>)}</ul> : <p>No coding jobs have been saved yet.</p>}
    </div>}
  </section>;
}
