"use client";

import { motion } from "framer-motion";

export default function SabitLock({ unlocked, onUnlock }: { unlocked: boolean; onUnlock: () => void }) {
  return (
    <div className="relative h-72 w-72 sm:h-96 sm:w-96">
      
      {/* Outer glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: unlocked ? 1 : 0.6,
          scale: unlocked ? 1.05 : 1 
        }}
        className={`absolute inset-0 rounded-full border 
        ${unlocked ? "border-emerald-300/80 shadow-[0_0_120px_rgba(80,255,180,0.65)]" 
                    : "border-zinc-700/70 shadow-[0_0_55px_rgba(0,0,0,0.5)]"}`}
      />

      {/* Inner disc */}
      <div className="absolute inset-10 rounded-full border border-zinc-700/60 bg-zinc-950/70" />

      {/* Rotating metal */}
      <motion.div
        animate={{
          rotate: unlocked ? 360 : 0,
        }}
        transition={{
          duration: 6,
          ease: "linear",
          repeat: unlocked ? Infinity : 0,
        }}
        className="absolute inset-10 rounded-full opacity-70
        bg-[conic-gradient(from_0deg,#ffffff30,#14141470,#0f0f0f90,#ffffff30)] 
        mix-blend-screen"
      />

      {/* Cross */}
      <div className="absolute inset-14 flex items-center justify-center">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-50" />
      </div>
      <div className="absolute inset-14 flex items-center justify-center">
        <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-zinc-600 to-transparent opacity-50" />
      </div>

      {/* Button */}
      <motion.button
        onClick={onUnlock}
        whileHover={{ scale: unlocked ? 1.10 : 1.06 }}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
        h-20 w-20 rounded-full border flex items-center justify-center
        transition-all 
        ${unlocked 
            ? "border-emerald-300/80 bg-emerald-400/20 shadow-[0_0_45px_rgba(52,211,153,0.9)]" 
            : "border-zinc-500 bg-zinc-900 shadow-[0_0_28px_rgba(0,0,0,0.9)] hover:border-emerald-300/70"}`}
      >
        <span className={`text-[0.55rem] tracking-[0.22em] uppercase 
          ${unlocked ? "text-emerald-200" : "text-zinc-200"}`}>
          {unlocked ? "GRANTED" : "LOCK"}
        </span>
      </motion.button>
    </div>
  );
}
