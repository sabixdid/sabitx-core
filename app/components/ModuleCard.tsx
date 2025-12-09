import Link from "next/link";

interface ModuleCardProps {
  label: string;
  title: string;
  desc: string;
  tag?: string;
  href: string;
}

export default function ModuleCard({
  label,
  title,
  desc,
  tag,
  href
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="module-card block p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <div className="text-xs uppercase tracking-widest text-white/60 mb-2">
        {label}
      </div>
      <div className="text-xl font-semibold mb-1">{title}</div>
      <div className="text-white/70 text-sm mb-3">{desc}</div>
      {tag && (
        <div className="text-[10px] px-2 py-1 rounded-md bg-white/10 inline-block">
          {tag}
        </div>
      )}
    </Link>
  );
}
