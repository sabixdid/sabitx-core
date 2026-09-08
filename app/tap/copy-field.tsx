"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./tap.module.css";

type State = "idle" | "copied" | "manual";

export default function CopyField({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [revealed, setRevealed] = useState(!secret);
  const valueRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flash = useCallback((next: State) => {
    setState(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2600);
  }, []);

  const copy = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard api");
      await navigator.clipboard.writeText(value);
      flash("copied");
    } catch {
      // Clipboard blocked (insecure context, permission, older browser).
      // Reveal and select the text so it can still be copied by hand.
      setRevealed(true);
      const node = valueRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      flash("manual");
    }
  }, [value, flash]);

  const shown = revealed ? value : "•".repeat(Math.min(value.length, 16));

  return (
    <div className={styles.field}>
      <div className={styles.fieldHead}>
        <span className={styles.fieldLabel}>{label}</span>
        {secret ? (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((r) => !r)}
            aria-pressed={revealed}
          >
            {revealed ? "HIDE" : "SHOW"}
          </button>
        ) : null}
      </div>
      <div className={styles.fieldBody}>
        <span
          ref={valueRef}
          className={styles.fieldValue}
          data-masked={!revealed}
        >
          {shown}
        </span>
        <button type="button" className={styles.copy} onClick={copy}>
          {state === "copied"
            ? "COPIED"
            : state === "manual"
              ? "SELECT + COPY"
              : "COPY"}
        </button>
      </div>
      <p className={styles.live} role="status" aria-live="polite">
        {state === "copied"
          ? `${label} copied to clipboard.`
          : state === "manual"
            ? "Clipboard unavailable. The value is selected — copy it manually."
            : ""}
      </p>
    </div>
  );
}
