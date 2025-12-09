"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ParallaxLayer from "./components/ParallaxLayer";
import LockCore from "./components/LockCore";
import ModuleGrid from "./components/ModuleGrid";

export default function Home() {
  const { scrollYProgress } = useScroll();

  // Crest fade + scale when scrolling
  const crestScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const crestOpacity = useTransform(scrollYProgress, [0, 1], [0.14, 0.05]);

  // Headline motion
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);

  return (
    <main className="relative w-full min-h-screen bg-black overflow-hidden text-white">

      {/* BACKGROUND CREST (PARALLAX REACTIVE) */}
      <motion.div
        style={{ scale: crestScale, opacity: crestOpacity }}
        className="pointer-events-none fixed inset-0 flex items-center justify-center z-0"
      >
        <img
          src="/sabitx/crest-square.png"
          className="w-[60vw] max-w-[900px] opacity-20 select-none"
        />
      </motion.div>

      {/* PARALLAX FLOATING LAYERS */}
      <ParallaxLayer
        img="/sabitx/noise.png"
        speed={0.02}
        opacity={0.2}
        scale={1.8}
      />
      <ParallaxLayer
        img="/sabitx/aura.png"
        speed={0.05}
        opacity={0.15}
        scale={1.2}
      />

      {/* HERO SECTION */}
      <section className="relative z-20 h-[125vh] flex flex-col items-center justify-center text-center px-6">

        {/* TITLE */}
        <motion.h1
          style={{ opacity: titleOpacity, y: titleY }}
          className="text-[2.3rem] md:text-[3.2rem] font-light max-w-4xl leading-tight tracking-tight"
        >
          SABIT X is an operator-grade system for survival, automation, and luxury.
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-4 text-neutral-300 text-lg tracking-wide"
        >
          Still Transmitting.
        </motion.p>

        {/* LOCK INTERFACE */}
        <LockCore />

        {/* INSTRUCTION */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8 tracking-widest text-neutral-400 uppercase text-[0.75rem]"
        >
          Scroll to access modules
        </motion.p>
      </section>

      {/* MODULES SECTION */}
      <div className="relative z-30 w-full bg-black/90 backdrop-blur-xl pt-32 pb-40">
        <ModuleGrid />
      </div>
    </main>
  );
}
