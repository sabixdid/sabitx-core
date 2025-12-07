"use client";

import Image from "next/image";

export default function CamerasPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* GHOST BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.18]">
        <Image
          src="/sabitx/vault-ghost.png"
          alt="ghost"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* NOISE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-[0.25]">
        <Image src="/sabitx/noise.png" alt="" fill className="object-cover" />
      </div>

      {/* CONTENT */}
      <section className="relative z-10 px-6 py-20 flex flex-col items-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 mb-6">
          SABIT X // NODE VIEWER
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Camera Matrix
        </h1>

        <p className="max-w-2xl text-center text-zinc-400 text-sm mb-16">
          Every node is a signal window. These feeds become live once hardware sync is completed.
          Offline nodes still report heartbeat intervals.
        </p>

        {/* GRID */}
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
          {[
            { label: "NODE-331-MAIN", status: "OFFLINE" },
            { label: "NODE-WALNUT-HILL", status: "OFFLINE" },
            { label: "SATELLITE-REMOTE", status: "RESERVED" },
          ].map((node, i) => (
            <div
              key={i}
              className="border border-zinc-700/60 rounded-2xl bg-zinc-900/40 shadow-[0_0_25px_rgba(0,0,0,0.6)] p-5 backdrop-blur-sm"
            >
              <header className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  {node.label}
                </span>
                <span
                  className={`text-xs ${
                    node.status === "OFFLINE"
                      ? "text-red-400"
                      : node.status === "RESERVED"
                      ? "text-zinc-400"
                      : "text-emerald-400"
                  }`}
                >
                  {node.status}
                </span>
              </header>

              <div className="aspect-video border border-zinc-700/40 rounded-xl bg-black/40 flex items-center justify-center text-zinc-600 text-xs">
                Feed Not Connected
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
