import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "violet" | "cyan" | "green" | "red" | "amber" | "neutral";
  dot?: boolean;
}

export default function Badge({
  children,
  variant = "violet",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  const variants = {
    violet: {
      container: "border-violet-400/20 bg-violet-500/10 text-violet-300",
      dot: "bg-violet-400",
    },
    cyan: {
      container: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
      dot: "bg-cyan-400",
    },
    green: {
      container: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
      dot: "bg-emerald-400",
    },
    red: {
      container: "border-red-400/20 bg-red-500/10 text-red-300",
      dot: "bg-red-400",
    },
    amber: {
      container: "border-amber-400/20 bg-amber-500/10 text-amber-300",
      dot: "bg-amber-400",
    },
    neutral: {
      container: "border-white/10 bg-white/[0.06] text-slate-300",
      dot: "bg-slate-400",
    },
  };

  const selected = variants[variant];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${selected.container} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${selected.dot}`}
        />
      )}

      {children}
    </span>
  );
}
