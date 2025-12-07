"use client";

import Image from "next/image";

export default function OverridePage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      <div className="absolute inset-0 opacity-[0.15]">
        <Image src="/sabitx/ghost.png" alt="" fill className="object-cover" />
      </div>

      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.2]">
        <Image src="/sabitx/noise.png" alt="" fill className="object-cover" />
      </div>

      <section className="relative z-10 px-6 py-20 flex flex-col items-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 mb-6">
          SABIT X // OVERRIDE ENGINE
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Legal Armory
        </h1>

        <p className="max-w-2xl text-center text-zinc-400 text-sm mb-16">
          Packets. Filings. Exhibits. System failures are documented, inverted,
          and returned as pressure. This module is where paper becomes a weapon.
        </p>

        <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
          {[
            "CARMAX // FCRA breach",
            "BMO // ChexSystems remediation",
            "MUNICIPAL // 331 Main discovery",
            "STATE // Depakote chemical control",
            "FEDERAL // Data correction requests",
            "CIVIL // Operator protection protocol",
          ].map((title, i) => (
            <div
              key={i}
              className="border border-zinc-700/60 rounded-2xl bg-zinc-900/40 shadow-[0_0_25px_rgba(0,0,0,0.6)] p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
              <p className="text-xs text-zinc-500">
                Status: <span className="text-emerald-300">Tracked</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
