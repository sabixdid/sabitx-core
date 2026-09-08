"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./immersive-scene.module.css";

export default function ImmersiveScene() {
  const scene = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let pointerX = 0;
    let pointerY = 0;
    const paint = () => {
      frame = 0;
      if (!visible) return;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, rect.top / window.innerHeight - 0.15),
      );
      const stopped = paused || reduced.matches;
      element.style.setProperty(
        "--pointer-x",
        stopped ? "0deg" : `${pointerX * 7}deg`,
      );
      element.style.setProperty(
        "--pointer-y",
        stopped ? "0deg" : `${pointerY * -5}deg`,
      );
      element.style.setProperty(
        "--scroll-depth",
        stopped ? "0px" : `${progress * -30}px`,
      );
    };
    const schedule = () => {
      if (!frame && visible) frame = window.requestAnimationFrame(paint);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch" || paused || reduced.matches) return;
      const rect = element.getBoundingClientRect();
      pointerX = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1),
      );
      pointerY = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
      schedule();
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    observer.observe(element);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      observer.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", schedule);
      reduced.removeEventListener("change", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [paused]);

  return (
    <div ref={scene} className={styles.scene} data-paused={paused}>
      <div className={styles.caption}>
        <span>INTENT / SHAPE / REVIEW</span>
        <span>THE X FACTOR</span>
      </div>
      <div
        className={styles.world}
        role="img"
        aria-label="Three dimensional orange X with layered planes representing intent, shape, and review."
      >
        <div className={styles.assembly}>
          <div className={`${styles.plane} ${styles.back}`}>
            <span>01 — INTENT</span>
            <i />
            <i />
            <i />
          </div>
          <div className={`${styles.plane} ${styles.middle}`}>
            <span>02 — SHAPE</span>
            <b aria-hidden="true">↗</b>
          </div>
          <div className={styles.cross} aria-hidden="true">
            <i />
            <i />
          </div>
          <div className={`${styles.plane} ${styles.front}`}>
            <span>03 — REVIEW</span>
            <strong>You decide.</strong>
            <small>Progress stays in your hands.</small>
          </div>
        </div>
        <div className={styles.floor} aria-hidden="true" />
      </div>
      <div className={styles.bottom}>
        <span>Depth with direction.</span>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
        >
          {paused ? "Resume motion" : "Pause motion"}
          <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
        </button>
      </div>
    </div>
  );
}
