"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function ParallaxLayer({
  img,
  speed = 0.03,
  opacity = 0.2,
  scale = 1.3,
}: {
  img: string;
  speed?: number;
  opacity?: number;
  scale?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const dx = useSpring(x, { stiffness: 30, damping: 20 });
  const dy = useSpring(y, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      x.set((e.clientX - cx) * speed);
      y.set((e.clientY - cy) * speed);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y, speed]);

  return (
    <motion.div
      style={{
        x: dx,
        y: dy,
      }}
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <img
        src={img}
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
        className="w-full h-full object-cover object-center select-none"
      />
    </motion.div>
  );
}
