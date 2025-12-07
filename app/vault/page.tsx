"use client";

import { useState } from "react";

export default function VaultPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
        SABITX Vault
      </h1>

      <button
        onClick={() => setOpen(true)}
        className={`px-8 py-3 rounded-full border transition-all ${
          open
            ? "border-emerald-300 text-emerald-200 bg-emerald-400/10"
            : "border-zinc-600 text-zinc-200 hover:border-emerald-400"
        }`}
      >
        {open ? "ACCESS GRANTED" : "UNLOCK"}
      </button>

      {open && (
        <p className="mt-6 text-zinc-500 text-sm tracking-[0.2em] uppercase">
          Redirecting…
        </p>
      )}
    </main>
  );
}
