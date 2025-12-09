"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function LockCore() {
  const [unlocked, setUnlocked] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const dx = useSpring(x, { stiffness: 60, damping: 20 });
  const dy = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (unlocked) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      const distX = e.clientX - cx;
      const distY = e.clientY - cy;

      x.set(distX * 0.06);
      y.set(distY * 0.06);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [unlocked, x, y]);

  const handleUnlock = () => {
    setUnlocked(true);

    // Expand ripple out
    setTimeout(() => {
      const el = document.getElementById("module-grid");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="mt-20 relative flex items-center justify-center">
      {/* Outer halo */}
      <motion.div
        className="absolute w-[360px] h-[360px] rounded-full bg-white/5 blur-3xl"
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Middle halo */}
      <motion.div
        className="absolute w-[260px] h-[260px] rounded-full bg-white/8 backdrop-blur-xl"
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      {/* CORE LOCK */}
      <motion.button
        style={{ x: dx, y: dy }}
        onClick={handleUnlock}
        className={`relative z-10 w-[180px] h-[180px] rounded-full border 
          ${unlocked ? "bg-white text-black" : "border-neutral-600 bg-white/10 text-white"}
          flex items-center justify-center text-xl tracking-wider backdrop-blur-xl transition-all duration-300`}
      >
        {unlocked ? "ACCESS" : "LOCK"}
      </motion.button>

      {/* Click ripple */}
      {unlocked && (
        <motion.div
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 6, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute w-[200px] h-[200px] rounded-full bg-white/40"
        />
      )}
    </div>
  );
}
