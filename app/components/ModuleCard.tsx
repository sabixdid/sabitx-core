export default function ModuleCard({ label, title, body, tag }: any) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 
      bg-zinc-950/70 p-5 sm:p-6 
      shadow-[0_18px_50px_rgba(0,0,0,0.75)]
      transition hover:scale-[1.015] hover:border-zinc-500/80 hover:bg-zinc-900/80">

      {/* Glow */}
      <div className="pointer-events-none absolute inset-x-[-40%] -top-24 h-32 
        bg-[radial-gradient(circle,_rgba(236,252,203,0.16),_transparent_60%)] 
        opacity-0 transition group-hover:opacity-100" />

      <header className="mb-4 flex items-center justify-between">
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-zinc-500">{label}</span>
        <span className="rounded-full border border-zinc-700/70 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.2em] text-zinc-400">{tag}</span>
      </header>

      <h3 className="mb-2 text-lg font-semibold text-zinc-50">{title}</h3>
      <p className="mb-5 text-xs sm:text-sm text-zinc-400">{body}</p>

      <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">
        <span>ACCESS BRIEF</span>
        <span className="flex items-center gap-1 group-hover:text-emerald-300">
          <span>Details</span>
          <span className="h-[1px] w-5 bg-gradient-to-r from-zinc-500 to-emerald-300 group-hover:w-8 transition-all" />
        </span>
      </div>

    </article>
  );
}
