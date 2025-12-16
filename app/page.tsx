"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden px-6">

      {/* AMBIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.035] bg-[url('/noise.png')]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight"
        >
          SABITX
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-6 text-xl md:text-2xl text-neutral-400"
        >
          Operating System
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-4 text-sm text-neutral-500 max-w-xl"
        >
          Unified access to systems already in motion.
        </motion.p>

      </section>

      {/* CHANNELS */}
      <section className="relative z-10 pb-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        <Channel title="Vault" desc="Documents • Exhibits • Case Files" href="https://vault.sabitx.com" />
        <Channel title="Store" desc="Order • Pay • Pickup" href="https://store.sabitx.com" />
        <Channel title="Operator" desc="Cameras • Dashboards • Control" href="https://operator.sabitx.com" />
        <Channel title="Systems" desc="Infrastructure • Monitoring" href="https://systems.sabitx.com" />
        <Channel title="Mesh" desc="Knowledge • Canon • Signal" href="https://mesh.sabitx.com" />
        <Channel title="Employment" desc="Roles • Access • Alignment" href="https://sabitinc.com" />

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 pb-10 text-center text-xs tracking-wide text-neutral-600">
        SABITX PORTAL • sabitx.com
      </footer>

    </main>
  );
}

function Channel({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group relative border border-neutral-800 rounded-xl p-6 hover:border-neutral-500 transition-colors"
    >
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)]" />

      <div className="relative flex flex-col space-y-3">
        <h2 className="text-xl font-semibold tracking-wide">
          {title}
        </h2>
        <p className="text-sm text-neutral-500">
          {desc}
        </p>
        <span className="text-xs tracking-wide text-neutral-400 group-hover:text-white transition-colors">
          Enter →
        </span>
      </div>
    </motion.a>
  );
}
