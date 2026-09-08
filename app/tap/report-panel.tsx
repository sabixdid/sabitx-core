"use client";

import { useMemo, useState } from "react";
import styles from "./tap.module.css";

type Cfg = { mode: string; to: string | null; categories: string[] };

/**
 * No backend. The customer's own SMS or mail app opens with a prefilled
 * message that they review and send themselves. If no destination is
 * configured the control is visibly disabled rather than silently dead.
 */
export default function ReportPanel({
  cfg,
  storeName,
  locationLabel,
}: {
  cfg: Cfg;
  storeName: string;
  locationLabel: string;
}) {
  const [category, setCategory] = useState(cfg.categories[0] ?? "Other");
  const [detail, setDetail] = useState("");
  const configured = Boolean(cfg.to);

  const href = useMemo(() => {
    if (!cfg.to) return null;
    const body = `${storeName} (${locationLabel}) — ${category}${
      detail.trim() ? `: ${detail.trim()}` : ""
    }`;
    return cfg.mode === "email"
      ? `mailto:${cfg.to}?subject=${encodeURIComponent(
          `Store report — ${category}`,
        )}&body=${encodeURIComponent(body)}`
      : `sms:${cfg.to}?&body=${encodeURIComponent(body)}`;
  }, [cfg, category, detail, storeName, locationLabel]);

  return (
    <div className={styles.report}>
      <div className={styles.chips} role="group" aria-label="What is wrong?">
        {cfg.categories.map((c) => (
          <button
            key={c}
            type="button"
            className={styles.chip}
            data-active={c === category}
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <label className={styles.srOnly} htmlFor="report-detail">
        Optional detail
      </label>
      <textarea
        id="report-detail"
        className={styles.textarea}
        rows={2}
        maxLength={300}
        placeholder="Anything else? (optional)"
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
      />

      {configured ? (
        <>
          <a className={styles.primary} href={href!}>
            {cfg.mode === "email" ? "OPEN EMAIL" : "OPEN MESSAGES"}
          </a>
          <p className={styles.reportNote}>
            This opens your own{" "}
            {cfg.mode === "email" ? "mail app" : "messaging app"} with the
            message ready. Nothing is sent until you send it.
          </p>
        </>
      ) : (
        <>
          <span
            className={styles.primary}
            data-disabled="true"
            aria-disabled="true"
          >
            NOT SET UP YET
          </span>
          <p className={styles.reportNote}>
            No destination is configured, so this cannot send anything. Please
            tell a staff member instead.
          </p>
        </>
      )}
    </div>
  );
}
