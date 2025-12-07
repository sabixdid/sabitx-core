"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [unlock, setUnlock] = useState(false);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center">

      {/* BACKGROUND GHOST LION */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
        style={{ backgroundImage: "url('/sabitx/ghost.png')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.22 }}
        transition={{ duration: 1.8 }}
      />

      {/* NOISE OVERLAY */}
      <div className="sabitx-noise pointer-events-none absolute inset-0" />

      {/* MAIN COLUMN */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center text-center px-4"
      >

        {/* LOCKED / UNLOCKED CREST */}
        <motion.img
          src={unlock ? "/sabitx/crest.png" : "/sabitx/crest.png"}
          alt="SABITX Crest"
          className="w-[320px] md:w-[420px]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />

        {/* AURA */}
        {!unlock && (
          <motion.img
            src="/sabitx/aura.png"
            className="absolute w-[420px] md:w-[520px] top-[140px] opacity-70 mix-blend-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 1.4 }}
          />
        )}

        {/* TITLE */}
        <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
          SABITX CORE
        </h1>

        {/* STATUS TEXT */}
        <p className="mt-2 text-zinc-400 text-lg">
          {unlock ? "System Online." : "Signal Detected. Awaiting Authentication."}
        </p>

        {/* LOCK BUTTON */}
        {!unlock && (
          <motion.button
            onClick={() => setUnlock(true)}
            className="mt-8 px-10 py-4 rounded-full bg-white/5 border border-white/20 backdrop-blur-xl hover:bg-white/10 transition"
            whileTap={{ scale: 0.92 }}
          >
            UNLOCK
          </motion.button>
        )}

        {/* ACCESS BUTTONS */}
        {unlock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-col md:flex-row gap-4"
          >
            <a
              href="https://vault.sabitx.com"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md transition"
            >
              Vault Console
            </a>

            <a
              href="https://store.sabitx.com"
              className="px-6 py-3 rounded-full bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
            >
              SABITX Store
            </a>

            <a
              href="/cameras"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md transition"
            >
              Cameras
            </a>

            <a
              href="/override"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md transition"
            >
              Override
            </a>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
