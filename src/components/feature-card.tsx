import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  number?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  number,
}: FeatureCardProps) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101529]/75 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-violet-400/40 hover:shadow-[0_15px_50px_rgba(139,92,246,0.12)] sm:p-7">

      {/* Background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-600/10 blur-[70px] transition-all duration-500 group-hover:bg-violet-500/20" />

      {/* Card header */}
      <div className="relative z-10 flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300 transition-all duration-500 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
          <Icon size={23} strokeWidth={1.7} />
        </div>

        {number && (
          <span className="font-display text-sm font-semibold tracking-widest text-white/20">
            {number}
          </span>
        )}
      </div>

      {/* Card content */}
      <div className="relative z-10 mt-7">

        <h3 className="font-display text-xl font-semibold tracking-tight text-white transition-colors duration-300 group-hover:text-violet-200">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {description}
        </p>

      </div>

      {/* Bottom accent */}
      <div className="relative z-10 mt-7 h-px w-12 bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500 group-hover:w-full" />

    </article>
  );
    }
