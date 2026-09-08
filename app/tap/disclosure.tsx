"use client";

import { useId, useState } from "react";
import styles from "./tap.module.css";

export default function Disclosure({
  summary,
  children,
  tone = "default",
}: {
  summary: string;
  children: React.ReactNode;
  tone?: "default" | "quiet";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={tone === "quiet" ? styles.discQuiet : styles.disc}>
      <button
        type="button"
        className={styles.discBtn}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{summary}</span>
        <span className={styles.chev} data-open={open} aria-hidden="true">
          +
        </span>
      </button>
      <div id={id} className={styles.discBody} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
