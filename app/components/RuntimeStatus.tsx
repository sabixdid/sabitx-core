"use client";

import { useEffect, useState } from "react";
import styles from "../home.module.css";

type Status = "checking" | "responding" | "attention" | "unavailable";
const labels: Record<Status, string> = {
  checking: "Checking system status",
  responding: "System responding",
  attention: "System needs attention",
  unavailable: "Status unavailable",
};

export default function RuntimeStatus() {
  const [status, setStatus] = useState<Status>("checking");
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    fetch("/api/status", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Status unavailable");
        const data = await response.json();
        if (active)
          setStatus(
            data.runtime === "online" &&
              data.signal === "active" &&
              data.agent?.state === "ready"
              ? "responding"
              : "attention",
          );
      })
      .catch(() => {
        if (active) setStatus("unavailable");
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return (
    <span className={styles.status} data-state={status} role="status">
      <span aria-hidden="true" />
      {labels[status]}
    </span>
  );
}
