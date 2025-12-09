"use client";

import Link from "next/link";

export default function ModuleCard({ label, title, desc, tag, href }) {
  return (
    <Link
      href={href}
      className="block w-full bg-white/5 border border-white/10 rounded-2xl p-6
      hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl"
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs tracking-widest text-neutral-400 uppercase">{label}</span>
        <span className="text-[0.55rem] tracking-widest border border-neutral-500 rounded-full px-3 py-1">
          {tag}
        </span>
      </div>

      <div className="text-[1.5rem] font-light mb-1">{title}</div>

      <p className="text-neutral-300 text-sm max-w-md leading-relaxed">{desc}</p>

      <div className="mt-4 text-xs tracking-widest text-neutral-400 uppercase">
        Access Brief →
      </div>
    </Link>
  );
}
