"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type RuntimeStatus = {
  runtime?: string;
  signal?: string;
  version?: string;
  agent?: {
    state?: string;
    pipeline?: string;
    architect?: string;
    operator?: string;
  };
};

const layers = [
  {
    name: "COMMAND",
    code: "01",
    description: "Intent, routing, decisions, and control.",
    href: "/ask",
  },
  {
    name: "OPERATOR",
    code: "02",
    description: "Execution plans, approval gates, and verified state.",
    href: "/operator",
  },
  {
    name: "VAULT",
    code: "03",
    description: "Documents, exhibits, evidence, and records.",
    href: "/vault",
  },
  {
    name: "MESH",
    code: "04",
    description: "Knowledge, canon, context, and signal.",
    href: "#system-layers",
  },
  {
    name: "STORE",
    code: "05",
    description: "Retail operations, ordering, and commerce.",
    href: "/store",
  },
  {
    name: "SIGNAL",
    code: "06",
    description: "Live runtime state and machine-readable status.",
    href: "/api/status",
  },
];

function readableModel(model: string | undefined, fallback: string) {
  if (!model) return fallback;
  return model
    .replace("openai/", "")
    .replace("alibaba/", "")
    .replaceAll("-", " ")
    .toUpperCase();
}

export default function Home() {
  const [status, setStatus] = useState<RuntimeStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: RuntimeStatus) => {
        if (mounted) setStatus(payload);
      })
      .catch(() => {
        if (mounted) {
          setStatus({ runtime: "unknown", signal: "unavailable" });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isOnline =
    status?.runtime === "online" &&
    status?.signal === "active" &&
    status?.agent?.state === "ready";

  const statusLabel = useMemo(() => {
    if (!status) return "CHECKING";
    return isOnline ? "ONLINE" : "DEGRADED";
  }, [isOnline, status]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_65%,rgba(255,255,255,0.035),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-full shadow-[0_0_16px_rgba(255,255,255,0.9)] ${
              isOnline ? "bg-white" : "bg-neutral-600"
            }`}
          />
          <span className="text-[11px] font-medium tracking-[0.3em] text-neutral-300">
            SABITX // SYSTEMS IN MOTION
          </span>
        </div>
        <span className="hidden text-[10px] tracking-[0.26em] text-neutral-600 sm:block">
          STATUS // {statusLabel}
        </span>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-center px-6 pb-20 pt-16 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          <p className="mb-6 text-[11px] font-medium tracking-[0.34em] text-neutral-500">
            OPERATING INFRASTRUCTURE / 2026
          </p>

          <h1 className="text-[clamp(4.5rem,15vw,11rem)] font-semibold leading-[0.78] tracking-[-0.075em]">
            SABITX
          </h1>

          <p className="mt-8 max-w-3xl text-2xl font-medium leading-tight tracking-[-0.03em] text-neutral-200 md:text-4xl">
            Systems in motion.
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-6 text-neutral-500 md:text-base">
            Operational infrastructure for turning intent into controlled execution.
            One system for command, operators, knowledge, evidence, retail, and signal.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/run"
              className="group inline-flex items-center gap-4 border border-white bg-white px-5 py-3 text-[11px] font-semibold tracking-[0.22em] text-black transition hover:bg-neutral-200"
            >
              ACQUIRE CLEARANCE
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="https://sabitinc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-neutral-800 px-5 py-3 text-[11px] font-medium tracking-[0.22em] text-neutral-400 transition hover:border-neutral-500 hover:text-white"
            >
              PUBLIC OPERATIONS
            </a>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <motion.a
          href="/run"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="group block border border-neutral-800 bg-neutral-950/60 backdrop-blur transition-colors hover:border-neutral-600"
        >
          <div className="grid md:grid-cols-[1.35fr_0.65fr]">
            <div className="p-7 md:p-10">
              <div className="mb-10 flex items-center justify-between gap-4">
                <span className="text-[10px] tracking-[0.3em] text-neutral-500">
                  EXECUTION LAYER
                </span>
                <span className="border border-neutral-800 px-2.5 py-1 text-[9px] tracking-[0.22em] text-neutral-500">
                  {statusLabel}
                </span>
              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.045em] md:text-6xl">
                RUN
              </h2>
              <p className="mt-3 text-sm tracking-[0.18em] text-neutral-500">
                sabitx.run
              </p>
              <p className="mt-8 max-w-xl text-sm leading-6 text-neutral-400 md:text-base">
                Architect intent → operator sequence → verified state.
              </p>
              <span className="mt-10 inline-block text-[10px] tracking-[0.24em] text-neutral-500 transition group-hover:translate-x-1 group-hover:text-white">
                ENTER RUNTIME →
              </span>
            </div>

            <div className="border-t border-neutral-800 p-7 md:border-l md:border-t-0 md:p-10">
              <div className="space-y-7 text-[10px] tracking-[0.22em]">
                <StatusRow
                  label="ARCHITECT"
                  value={readableModel(
                    status?.agent?.architect,
                    "GPT-OSS 120B"
                  )}
                />
                <StatusRow
                  label="OPERATOR"
                  value={readableModel(
                    status?.agent?.operator,
                    "QWEN3 CODER 30B A3B"
                  )}
                />
                <StatusRow label="RUNTIME" value="SABITX.COM/RUN" />
                <StatusRow label="DOMAIN" value="SABITX.RUN / ATTACH PENDING" muted />
              </div>
            </div>
          </div>
        </motion.a>
      </section>

      <section
        id="system-layers"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-neutral-900 pb-5">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-neutral-600">
              SYSTEM MAP
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.025em] md:text-3xl">
              Operational layers
            </h2>
          </div>
          <span className="hidden text-[10px] tracking-[0.2em] text-neutral-700 md:block">
            06 ACTIVE CHANNELS
          </span>
        </div>

        <div className="grid border-l border-t border-neutral-900 md:grid-cols-2 lg:grid-cols-3">
          {layers.map((layer, index) => (
            <motion.a
              key={layer.name}
              href={layer.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
              className="group min-h-56 border-b border-r border-neutral-900 p-7 transition-colors hover:bg-neutral-950 md:p-8"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] tracking-[0.24em] text-neutral-700">
                  {layer.code}
                </span>
                <span className="text-sm text-neutral-700 transition group-hover:translate-x-1 group-hover:text-white">
                  →
                </span>
              </div>
              <div className="mt-20">
                <h3 className="text-xl font-medium tracking-[0.08em]">
                  {layer.name}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-600 transition-colors group-hover:text-neutral-400">
                  {layer.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 border-t border-neutral-900 px-6 py-8 text-[9px] tracking-[0.24em] text-neutral-700 sm:flex-row sm:items-center sm:justify-between md:px-10">
        <span>SABITX // COMMAND INFRASTRUCTURE</span>
        <span>STILL TRANSMITTING.</span>
      </footer>
    </main>
  );
}

function StatusRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-4">
      <span className="text-neutral-700">{label}</span>
      <span className={muted ? "text-neutral-600" : "text-neutral-300"}>
        {value}
      </span>
    </div>
  );
}
