"use client";

import ModuleCard from "./ModuleCard";
import { motion } from "framer-motion";

export default function ModuleGrid() {
  const modules = [
    {
      label: "NEUROXYN",
      title: "Signal Chemistry",
      desc: "Operator-grade neurostack design. Override days. Controlled clarity.",
      tag: "NEURO / OVERRIDE",
      href: "/override",
    },
    {
      label: "AUTOMATION",
      title: "C-Store Control",
      desc: "Remote terminals for POS, cameras, access, and vendors.",
      tag: "INFRA / COMMERCE",
      href: "/vault",
    },
    {
      label: "VAULT MESH",
      title: "Core V1 Console",
      desc: "Unified dashboard for cameras, cashflow, disputes, and signals.",
      tag: "OPS / SURVEILLANCE",
      href: "/cameras",
    },
    {
      label: "OPERATOR MODE",
      title: "Apparel & Signal",
      desc: "Gear for people living in the timeline they were told to wait for.",
      tag: "SIGNAL / AESTHETIC",
      href: "/store",
    },
    {
      label: "OVERRIDE",
      title: "Legal Armory",
      desc: "Packets, filings, and weapons forged from paper.",
      tag: "LAW / DEFENSE",
      href: "/override",
    },
    {
      label: "OUT OF TIME",
      title: "The Casefile Memoir",
      desc: "Life written like evidence: exhibits, transcripts, quantum convergence.",
      tag: "CANON / STORY",
      href: "/memoir",
    },
  ];

  return (
    <div
      id="module-grid"
      className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-8"
    >
      {modules.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          viewport={{ once: true }}
        >
          <ModuleCard {...m} />
        </motion.div>
      ))}
    </div>
  );
}
